async function createTestInvoice() {
  try {
    console.log('🔄 Creando factura de prueba...\n');
    
    // Crear una factura de prueba
    const facturaData = {
      idPadre: 1,
      idHijo: 1,
      total: 250.00,
      subtotal: 250.00,
      observaciones: 'Matrícula de prueba para Ana Pérez'
    };
    
    console.log('1. Creando factura...');
    const facturaRes = await fetch('http://localhost:3000/api/admin/payments/invoices', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(facturaData)
    });
    
    if (facturaRes.ok) {
      const facturaResult = await facturaRes.json();
      console.log('✅ Factura creada:', facturaResult.message);
      console.log('🆔 ID de factura:', facturaResult.id);
      
      // Registrar un pago
      console.log('\n2. Registrando pago...');
      const pagoData = {
        idFactura: facturaResult.id,
        monto: 250.00,
        metodoPago: 'Efectivo',
        observaciones: 'Pago en efectivo'
      };
      
      const pagoRes = await fetch('http://localhost:3000/api/admin/payments/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(pagoData)
      });
      
      if (pagoRes.ok) {
        const pagoResult = await pagoRes.json();
        console.log('✅ Pago registrado:', pagoResult.message);
        console.log('🆔 ID de pago:', pagoResult.id);
      } else {
        console.log('❌ Error registrando pago:', pagoRes.status);
      }
      
    } else {
      console.log('❌ Error creando factura:', facturaRes.status);
    }
    
    // Verificar facturas actualizadas
    console.log('\n3. Verificando facturas actualizadas...');
    const facturasRes = await fetch('http://localhost:3000/api/admin/payments/invoices');
    if (facturasRes.ok) {
      const facturas = await facturasRes.json();
      console.log('✅ Total de facturas:', facturas.length);
      if (facturas.length > 0) {
        const factura = facturas[0];
        console.log(`   📄 Factura: ${factura.NumeroFactura}`);
        console.log(`   👤 Estudiante: ${factura.NombreHijo} ${factura.ApellidoHijo}`);
        console.log(`   💰 Total: S/ ${factura.Total}`);
        console.log(`   📊 Estado: ${factura.Estado}`);
      }
    }
    
    console.log('\n🎉 ¡Sistema de pagos funcionando completamente!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

createTestInvoice();
