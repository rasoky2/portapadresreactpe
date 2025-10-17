/* eslint-disable @typescript-eslint/no-require-imports */
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '..', 'database', 'portal_padres.db');
const db = new sqlite3.Database(dbPath);

console.log('🔍 Consultando usuarios en la base de datos...\n');

// Consultar usuarios
db.all(`
  SELECT u.UsuarioID, u.Username, u.Password, u.Nombre, u.Apellido, r.NombreRol 
  FROM Usuarios u 
  JOIN Roles r ON u.RolID = r.RolID 
  ORDER BY u.UsuarioID
`, (err, rows) => {
  if (err) {
    console.error('Error al consultar usuarios:', err);
    return;
  }

  console.log('📋 Usuarios encontrados:');
  console.log('=' .repeat(80));
  console.log('ID | Username      | Password | Nombre           | Apellido        | Rol');
  console.log('-'.repeat(80));
  
  rows.forEach(user => {
    console.log(
      `${user.UsuarioID.toString().padStart(2)} | ${user.Username.padEnd(12)} | ${user.Password.padEnd(7)} | ${user.Nombre.padEnd(15)} | ${user.Apellido.padEnd(14)} | ${user.NombreRol}`
    );
  });

  console.log('\n🔑 Credenciales de acceso:');
  console.log('=' .repeat(50));
  rows.forEach(user => {
    console.log(`👤 ${user.Username} / ${user.Password} (${user.NombreRol})`);
  });

  db.close();
});
