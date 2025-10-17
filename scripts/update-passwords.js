const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '..', 'database', 'portal_padres.db');
const db = new sqlite3.Database(dbPath);

const newPassword = '123456'; // Nueva contraseña para todos

console.log('🔍 Actualizando contraseñas de todos los usuarios...\n');

// Primero mostrar usuarios actuales
db.all("SELECT IdUsuario, Usuario, Contraseña, IdRol FROM Usuarios", (err, rows) => {
  if (err) {
    console.error('Error al consultar usuarios:', err);
    return;
  }

  console.log('📋 Usuarios ANTES del cambio:');
  console.log('=' .repeat(60));
  console.log('ID | Usuario      | Contraseña | Rol');
  console.log('-'.repeat(60));
  
  rows.forEach(user => {
    console.log(
      `${user.IdUsuario.toString().padStart(2)} | ${user.Usuario.padEnd(11)} | ${user.Contraseña.padEnd(9)} | ${user.IdRol}`
    );
  });

  // Actualizar todas las contraseñas
  db.run("UPDATE Usuarios SET Contraseña = ?", [newPassword], function(err) {
    if (err) {
      console.error('Error al actualizar contraseñas:', err);
      return;
    }

    console.log(`\n✅ Contraseñas actualizadas exitosamente!`);
    console.log(`🔑 Nueva contraseña para todos: ${newPassword}`);

    // Verificar el cambio
    db.all("SELECT IdUsuario, Usuario, Contraseña, IdRol FROM Usuarios", (err, rows) => {
      if (err) {
        console.error('Error al verificar usuarios:', err);
        return;
      }

      console.log('\n📋 Usuarios DESPUÉS del cambio:');
      console.log('=' .repeat(60));
      console.log('ID | Usuario      | Contraseña | Rol');
      console.log('-'.repeat(60));
      
      rows.forEach(user => {
        console.log(
          `${user.IdUsuario.toString().padStart(2)} | ${user.Usuario.padEnd(11)} | ${user.Contraseña.padEnd(9)} | ${user.IdRol}`
        );
      });

      console.log('\n🎉 ¡Cambio completado! Ahora todos los usuarios usan la contraseña: 123456');
      db.close();
    });
  });
});
