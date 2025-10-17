const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '..', 'database', 'portal_padres_new.db');
const db = new sqlite3.Database(dbPath);

console.log('📊 Agregando datos de ejemplo adicionales...\n');

// Agregar más usuarios
const addMoreUsers = () => {
  return new Promise((resolve, reject) => {
    const insertUsers = `INSERT INTO Usuarios (Usuario, Contraseña, IdRol) VALUES 
      ('proflaura', '123456', 2),
      ('profmiguel', '123456', 2),
      ('mamalucia', '123456', 3),
      ('papajose', '123456', 3),
      ('mamacarmen', '123456', 3)`;

    db.run(insertUsers, (err) => {
      if (err) {
        console.error('❌ Error agregando usuarios:', err.message);
        reject(err);
        return;
      }
      console.log('✅ Usuarios adicionales agregados');
      resolve();
    });
  });
};

// Agregar más padres
const addMorePadres = () => {
  return new Promise((resolve, reject) => {
    const insertPadres = `INSERT INTO Padres (IdUsuario, NombrePadre, Telefono, Direccion) VALUES 
      (4, 'Lucía García', '555-0456', 'Avenida Central 456'),
      (5, 'José Martínez', '555-0789', 'Calle Secundaria 789'),
      (6, 'Carmen López', '555-0321', 'Plaza Mayor 321')`;

    db.run(insertPadres, (err) => {
      if (err) {
        console.error('❌ Error agregando padres:', err.message);
        reject(err);
        return;
      }
      console.log('✅ Padres adicionales agregados');
      resolve();
    });
  });
};

// Agregar más hijos
const addMoreHijos = () => {
  return new Promise((resolve, reject) => {
    const insertHijos = `INSERT INTO Hijos (NombreHijo, Edad, IdPadre) VALUES 
      ('Sofia García', 7, 2),
      ('Diego García', 9, 2),
      ('Isabella Martínez', 6, 3),
      ('Mateo López', 8, 4),
      ('Valentina López', 11, 4)`;

    db.run(insertHijos, (err) => {
      if (err) {
        console.error('❌ Error agregando hijos:', err.message);
        reject(err);
        return;
      }
      console.log('✅ Hijos adicionales agregados');
      resolve();
    });
  });
};

// Agregar más asistencia
const addMoreAsistencia = () => {
  return new Promise((resolve, reject) => {
    const insertAsistencia = `INSERT INTO Asistencia (IdHijo, Fecha, Asistio) VALUES 
      -- Hijos de Carlos Pérez (IdPadre 1)
      (1, '2024-01-18', 1), (1, '2024-01-19', 1), (1, '2024-01-22', 0),
      (2, '2024-01-18', 1), (2, '2024-01-19', 1), (2, '2024-01-22', 1),
      
      -- Hijos de Lucía García (IdPadre 2)
      (3, '2024-01-15', 1), (3, '2024-01-16', 1), (3, '2024-01-17', 1),
      (4, '2024-01-15', 1), (4, '2024-01-16', 0), (4, '2024-01-17', 1),
      
      -- Hijos de José Martínez (IdPadre 3)
      (5, '2024-01-15', 1), (5, '2024-01-16', 1), (5, '2024-01-17', 1),
      
      -- Hijos de Carmen López (IdPadre 4)
      (6, '2024-01-15', 1), (6, '2024-01-16', 1), (6, '2024-01-17', 1),
      (7, '2024-01-15', 0), (7, '2024-01-16', 1), (7, '2024-01-17', 1)`;

    db.run(insertAsistencia, (err) => {
      if (err) {
        console.error('❌ Error agregando asistencia:', err.message);
        reject(err);
        return;
      }
      console.log('✅ Asistencia adicional agregada');
      resolve();
    });
  });
};

// Agregar más notas
const addMoreNotas = () => {
  return new Promise((resolve, reject) => {
    const insertNotas = `INSERT INTO Notas (IdHijo, Materia, Unidad, Criterio, Nota, Fecha) VALUES 
      -- Notas para Ana Pérez (IdHijo 1)
      (1, 'Matemáticas', 'Unidad 2', 'Multiplicación básica', 9.0, '2024-01-18'),
      (1, 'Lengua', 'Unidad 2', 'Escritura creativa', 8.5, '2024-01-19'),
      (1, 'Ciencias', 'Unidad 1', 'El cuerpo humano', 7.5, '2024-01-20'),
      
      -- Notas para Luis Pérez (IdHijo 2)
      (2, 'Matemáticas', 'Unidad 2', 'División', 8.0, '2024-01-18'),
      (2, 'Historia', 'Unidad 1', 'Civilizaciones antiguas', 9.5, '2024-01-19'),
      (2, 'Educación Física', 'Unidad 1', 'Coordinación motora', 8.5, '2024-01-20'),
      
      -- Notas para Sofia García (IdHijo 3)
      (3, 'Matemáticas', 'Unidad 1', 'Números del 1 al 100', 9.0, '2024-01-15'),
      (3, 'Lengua', 'Unidad 1', 'Lectura de cuentos', 8.0, '2024-01-16'),
      
      -- Notas para Diego García (IdHijo 4)
      (4, 'Matemáticas', 'Unidad 1', 'Suma y resta con llevadas', 7.0, '2024-01-15'),
      (4, 'Ciencias', 'Unidad 1', 'Los animales', 8.5, '2024-01-16'),
      
      -- Notas para Isabella Martínez (IdHijo 5)
      (5, 'Matemáticas', 'Unidad 1', 'Números del 1 al 50', 9.5, '2024-01-15'),
      (5, 'Arte', 'Unidad 1', 'Colores primarios', 10.0, '2024-01-16'),
      
      -- Notas para Mateo López (IdHijo 6)
      (6, 'Matemáticas', 'Unidad 1', 'Tablas de multiplicar', 8.0, '2024-01-15'),
      (6, 'Lengua', 'Unidad 1', 'Ortografía básica', 7.5, '2024-01-16'),
      
      -- Notas para Valentina López (IdHijo 7)
      (7, 'Matemáticas', 'Unidad 1', 'Fracciones básicas', 9.0, '2024-01-15'),
      (7, 'Ciencias', 'Unidad 1', 'El sistema solar', 8.5, '2024-01-16')`;

    db.run(insertNotas, (err) => {
      if (err) {
        console.error('❌ Error agregando notas:', err.message);
        reject(err);
        return;
      }
      console.log('✅ Notas adicionales agregadas');
      resolve();
    });
  });
};

// Agregar más citas
const addMoreCitas = () => {
  return new Promise((resolve, reject) => {
    const insertCitas = `INSERT INTO Citas (IdPadre, IdDocente, Fecha, Hora, Descripcion) VALUES 
      (2, 2, '2024-01-22', '10:00', 'Revisión de progreso de Sofia'),
      (2, 2, '2024-01-22', '11:00', 'Consulta sobre Diego'),
      (3, 2, '2024-01-23', '14:00', 'Reunión sobre Isabella'),
      (4, 2, '2024-01-23', '15:00', 'Consulta sobre Mateo y Valentina'),
      (1, 2, '2024-01-24', '16:00', 'Seguimiento de Ana y Luis')`;

    db.run(insertCitas, (err) => {
      if (err) {
        console.error('❌ Error agregando citas:', err.message);
        reject(err);
        return;
      }
      console.log('✅ Citas adicionales agregadas');
      resolve();
    });
  });
};

// Verificar datos finales
const verifyFinalData = () => {
  return new Promise((resolve) => {
    console.log('\n📊 Resumen final de la base de datos:\n');
    
    const queries = [
      { name: 'Usuarios', sql: 'SELECT COUNT(*) as count FROM Usuarios' },
      { name: 'Padres', sql: 'SELECT COUNT(*) as count FROM Padres' },
      { name: 'Hijos', sql: 'SELECT COUNT(*) as count FROM Hijos' },
      { name: 'Asistencia', sql: 'SELECT COUNT(*) as count FROM Asistencia' },
      { name: 'Notas', sql: 'SELECT COUNT(*) as count FROM Notas' },
      { name: 'Citas', sql: 'SELECT COUNT(*) as count FROM Citas' },
      { name: 'Calendario', sql: 'SELECT COUNT(*) as count FROM Calendario' }
    ];

    let completed = 0;
    queries.forEach((query) => {
      db.get(query.sql, (err, row) => {
        if (err) {
          console.error(`❌ Error consultando ${query.name}:`, err.message);
        } else {
          console.log(`📋 ${query.name}: ${row.count} registros`);
        }
        completed++;
        if (completed === queries.length) {
          resolve();
        }
      });
    });
  });
};

// Ejecutar agregado de datos
const addSampleData = async () => {
  try {
    await addMoreUsers();
    await addMorePadres();
    await addMoreHijos();
    await addMoreAsistencia();
    await addMoreNotas();
    await addMoreCitas();
    await verifyFinalData();
    
    console.log('\n🎉 ¡Datos de ejemplo agregados exitosamente!');
    console.log('🔑 Credenciales disponibles:');
    console.log('   admin / 123456 (Administrador)');
    console.log('   profjuan / 123456 (Docente)');
    console.log('   proflaura / 123456 (Docente)');
    console.log('   profmiguel / 123456 (Docente)');
    console.log('   papacarlos / 123456 (Padre)');
    console.log('   mamalucia / 123456 (Padre)');
    console.log('   papajose / 123456 (Padre)');
    console.log('   mamacarmen / 123456 (Padre)');
    
    db.close();
  } catch (error) {
    console.error('❌ Error agregando datos:', error);
    db.close();
  }
};

addSampleData();
