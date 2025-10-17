const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, '..', 'database', 'portal_padres.db');
const schemaPath = path.join(__dirname, '..', 'database', 'schema.sql');

// Eliminar base de datos existente si existe
if (fs.existsSync(dbPath)) {
  fs.unlinkSync(dbPath);
  console.log('🗑️ Base de datos anterior eliminada');
}

const db = new sqlite3.Database(dbPath);

console.log('🚀 Creando nueva base de datos SQLite desde schema.sql...\n');

// Crear tablas desde schema.sql
const createTables = () => {
  return new Promise((resolve, reject) => {
    // Leer el archivo schema.sql
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    // Dividir el schema en statements individuales
    // Primero normalizar saltos de línea y espacios
    const normalizedSchema = schema
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')
      .replace(/\n\s*\n/g, '\n')
      .replace(/\s+/g, ' ')
      .trim();
    
    const statements = normalizedSchema
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    // Separar CREATE TABLE de INSERT
    const createStatements = statements.filter(stmt => stmt.toUpperCase().includes('CREATE TABLE'));
    const insertStatements = statements.filter(stmt => stmt.toUpperCase().includes('INSERT'));

    console.log(`📋 Total statements: ${statements.length}`);
    console.log(`📋 CREATE TABLE statements: ${createStatements.length}`);
    console.log(`📋 INSERT statements: ${insertStatements.length}`);
    
    // Debug: mostrar los primeros statements
    console.log('Primeros 5 statements:');
    statements.slice(0, 5).forEach((stmt, i) => {
      console.log(`${i + 1}: ${stmt.substring(0, 50)}...`);
    });
    
    console.log(`📋 Ejecutando ${createStatements.length} CREATE TABLE statements...\n`);

    // Primero ejecutar todos los CREATE TABLE
    let createCompleted = 0;
    createStatements.forEach((statement, index) => {
      db.run(statement, (err) => {
        if (err) {
          console.error(`❌ Error creando tabla ${index + 1}:`, err.message);
          console.error('Statement:', statement.substring(0, 100) + '...');
          reject(err);
          return;
        }
        console.log(`✅ Tabla ${index + 1} creada correctamente`);
        createCompleted++;
        if (createCompleted === createStatements.length) {
          console.log('\n📋 Ejecutando INSERT statements...\n');
          
          // Luego ejecutar todos los INSERT
          let insertCompleted = 0;
          insertStatements.forEach((statement, index) => {
            db.run(statement, (err) => {
              if (err) {
                console.error(`❌ Error insertando datos ${index + 1}:`, err.message);
                console.error('Statement:', statement.substring(0, 100) + '...');
                reject(err);
                return;
              }
              console.log(`✅ Datos ${index + 1} insertados correctamente`);
              insertCompleted++;
              if (insertCompleted === insertStatements.length) {
                console.log('\n✅ Todas las tablas y datos creados desde schema.sql');
          resolve();
        }
      });
    });
        }
      });
    });
  });
};

// Los datos iniciales ya están incluidos en schema.sql

// Verificar datos insertados
const verifyData = () => {
  return new Promise((resolve) => {
    console.log('\n🔍 Verificando datos insertados...\n');
    
    const queries = [
      { name: 'Usuarios', sql: 'SELECT * FROM Usuarios' },
      { name: 'Roles', sql: 'SELECT * FROM Roles' },
      { name: 'Padres', sql: 'SELECT * FROM Padres' },
      { name: 'Hijos', sql: 'SELECT * FROM Hijos' },
      { name: 'ConceptosPago', sql: 'SELECT * FROM ConceptosPago' },
      { name: 'Facturas', sql: 'SELECT * FROM Facturas' },
      { name: 'Pagos', sql: 'SELECT * FROM Pagos' }
    ];

    let completed = 0;
    queries.forEach((query) => {
      db.all(query.sql, (err, rows) => {
        if (err) {
          console.error(`❌ Error consultando ${query.name}:`, err.message);
        } else {
          console.log(`📋 ${query.name}: ${rows.length} registros`);
          if (query.name === 'Usuarios') {
            rows.forEach(user => {
              console.log(`   👤 ${user.Usuario} / ${user.Contraseña} (Rol: ${user.IdRol})`);
            });
          }
          if (query.name === 'ConceptosPago') {
            rows.forEach(concepto => {
              console.log(`   💰 ${concepto.NombreConcepto}: S/ ${concepto.Monto} (${concepto.TipoConcepto})`);
            });
          }
        }
        completed++;
        if (completed === queries.length) {
          resolve();
        }
      });
    });
  });
};

// Ejecutar inicialización
const initDatabase = async () => {
  try {
    await createTables();
    await verifyData();
    
    console.log('\n🎉 ¡Base de datos inicializada exitosamente!');
    console.log('🔑 Credenciales de acceso:');
    console.log('   admin / 123456 (Administrador)');
    console.log('   profjuan / 123456 (Docente)');
    console.log('   papacarlos / 123456 (Padre)');
    console.log('\n💰 Sistema de pagos incluido:');
    console.log('   - Matrícula Primaria: S/ 250.00');
    console.log('   - Matrícula Secundaria: S/ 300.00');
    console.log('   - Mensualidades y conceptos adicionales');
    
    db.close();
  } catch (error) {
    console.error('❌ Error inicializando base de datos:', error);
    db.close();
  }
};

initDatabase();
