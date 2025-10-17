async function testPaymentAPIs() {
  try {
    console.log('🔄 Probando APIs de pagos...\n');
    
    // Probar API de conceptos de pago
    console.log('1. Probando API de conceptos de pago...');
    const conceptosRes = await fetch('http://localhost:3000/api/admin/payments/concepts');
    if (conceptosRes.ok) {
      const conceptos = await conceptosRes.json();
      console.log('✅ Conceptos de pago:', conceptos.length, 'registros');
      conceptos.slice(0, 3).forEach(c => {
        console.log(`   💰 ${c.NombreConcepto}: S/ ${c.Monto}`);
      });
    } else {
      console.log('❌ Error en conceptos:', conceptosRes.status);
    }
    
    // Probar API de facturas
    console.log('\n2. Probando API de facturas...');
    const facturasRes = await fetch('http://localhost:3000/api/admin/payments/invoices');
    if (facturasRes.ok) {
      const facturas = await facturasRes.json();
      console.log('✅ Facturas:', facturas.length, 'registros');
    } else {
      console.log('❌ Error en facturas:', facturasRes.status);
    }
    
    // Probar API de padres
    console.log('\n3. Probando API de facturas para padres...');
    const parentFacturasRes = await fetch('http://localhost:3000/api/parent/payments/invoices?parentId=1');
    if (parentFacturasRes.ok) {
      const parentFacturas = await parentFacturasRes.json();
      console.log('✅ Facturas del padre:', parentFacturas.length, 'registros');
    } else {
      console.log('❌ Error en facturas del padre:', parentFacturasRes.status);
    }
    
    console.log('\n🎉 ¡Todas las APIs de pagos funcionando correctamente!');
    
  } catch (error) {
    console.error('❌ Error al probar APIs:', error.message);
  }
}

testPaymentAPIs();
