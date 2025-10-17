/* eslint-disable @typescript-eslint/no-require-imports */
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '..', 'database', 'portal_padres.db');
const db = new sqlite3.Database(dbPath);

console.log('🔍 Verificando estructura de la base de datos...\n');

// Verificar tablas
db.all("SELECT name FROM sqlite_master WHERE type='table'", (err, tables) => {
  if (err) {
    console.error('Error al consultar tablas:', err);
    return;
  }

  console.log('📋 Tablas encontradas:');
  tables.forEach(table => {
    console.log(`- ${table.name}`);
  });

  // Verificar estructura de la tabla Usuarios
  db.all("PRAGMA table_info(Usuarios)", (err, columns) => {
    if (err) {
      console.error('Error al consultar estructura de Usuarios:', err);
      return;
    }

    console.log('\n📋 Estructura de la tabla Usuarios:');
    columns.forEach(col => {
      console.log(`- ${col.name} (${col.type})`);
    });

    // Consultar usuarios con la estructura correcta
    db.all("SELECT * FROM Usuarios LIMIT 5", (err, rows) => {
      if (err) {
        console.error('Error al consultar usuarios:', err);
        return;
      }

      console.log('\n📋 Primeros 5 usuarios:');
      console.log(JSON.stringify(rows, null, 2));

      db.close();
    });
  });
});
