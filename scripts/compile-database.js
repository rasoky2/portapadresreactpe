/* eslint-disable @typescript-eslint/no-require-imports */
 
const sqlite3 = require('sqlite3').verbose();
const fs = require('node:fs');
const path = require('node:path');

const dbPath = path.join(__dirname, '..', 'database', 'portal_padres.db');
const sqlPath = path.join(__dirname, '..', 'database', 'schema.sql');

console.info('🔍 Verificando base de datos...\n');

// Verificar si existe la base de datos
const exists = fs.existsSync(dbPath)
if (exists) {
  console.info('✅ Base de datos encontrada:', dbPath)
  console.info('ℹ️  Se aplicará schema.sql (CREATE IF NOT EXISTS + INSERT OR IGNORE) para asegurar datos de prueba\n')
}

// Verificar si existe el archivo SQL
if (!fs.existsSync(sqlPath)) {
  console.error('❌ Archivo schema.sql no encontrado:', sqlPath);
  process.exit(1);
}

console.info('📄 Compilando base de datos desde schema.sql...\n');

// Leer el archivo SQL
const sqlContent = fs.readFileSync(sqlPath, 'utf8');

// Abrir/crear la base de datos
const db = new sqlite3.Database(dbPath);

// Migraciones ligeras para adaptar esquemas previos
function runMigrations() {
  return new Promise((resolve) => {
    db.all("PRAGMA table_info('ConceptosPago')", (err, rows) => {
      if (err) {
        // Si falla, probablemente la tabla aún no existe; continuar
        return resolve();
      }
      const hasDur = rows?.some((r) => r.name === 'DuracionMeses');
      if (!hasDur) {
        db.run("ALTER TABLE ConceptosPago ADD COLUMN DuracionMeses INTEGER", (e) => {
          if (e) console.info('ℹ️ No se pudo añadir DuracionMeses (puede existir):', e.message);
          resolve();
        });
      } else {
        resolve();
      }
    });
  });
}

// Ejecutar el SQL
runMigrations().then(() => db.exec(sqlContent, (err) => {
  if (err) {
    console.error('❌ Error compilando base de datos:', err.message);
    db.close();
    process.exit(1);
  }

  console.info('✅ Schema aplicado exitosamente!');
  
  // Verificar datos insertados
  db.all("SELECT COUNT(*) as count FROM Usuarios", (err, rows) => {
    if (err) {
      console.error('❌ Error verificando datos:', err.message);
      db.close();
      return;
    }

    console.info(`📊 Usuarios insertados: ${rows[0].count}`);
    
    // Mostrar credenciales
    db.all("SELECT Usuario, Contraseña, r.NombreRol FROM Usuarios u JOIN Roles r ON u.IdRol = r.IdRol", (err, users) => {
      if (err) {
        console.error('❌ Error consultando usuarios:', err.message);
        db.close();
        return;
      }

      console.info('\n🔑 Credenciales de acceso:');
      console.info('='.repeat(50));
      users.forEach(user => {
        console.info(`👤 ${user.Usuario} / ${user.Contraseña} (${user.NombreRol})`);
      });

      console.info('\n🎉 ¡Base de datos lista para usar!');
      console.info(`📁 Ubicación: ${dbPath}`);
      
      db.close();
    });
  });
}));
