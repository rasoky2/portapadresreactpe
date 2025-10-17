const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('database/portal_padres.db');

console.log('🔍 Verificando tablas de pagos...\n');

// Verificar tablas de pagos
const tables = ['ConceptosPago', 'Facturas', 'DetalleFactura', 'Pagos'];

let completed = 0;
tables.forEach(table => {
  db.all(`SELECT COUNT(*) as count FROM ${table}`, (err, rows) => {
    if (err) {
      console.error(`❌ Error consultando ${table}:`, err.message);
    } else {
      console.log(`📋 ${table}: ${rows[0].count} registros`);
    }
    completed++;
    if (completed === tables.length) {
      // Mostrar conceptos de pago
      console.log('\n💰 Conceptos de pago:');
      db.all('SELECT * FROM ConceptosPago', (err, rows) => {
        if (err) {
          console.error('❌ Error:', err.message);
        } else {
          rows.forEach(concepto => {
            console.log(`   💰 ${concepto.NombreConcepto}: S/ ${concepto.Monto} (${concepto.TipoConcepto})`);
          });
        }
        db.close();
      });
    }
  });
});
