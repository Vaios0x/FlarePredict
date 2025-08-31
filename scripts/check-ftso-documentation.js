const { ethers } = require('hardhat');

async function main() {
  console.log('📚 Verificando documentación oficial del FTSO...');

  // Según la documentación oficial de Flare:
  // https://docs.flare.network/ftso/
  
  console.log('\n📖 Información del FTSO según documentación oficial:');
  console.log('🌐 FTSO (Flare Time Series Oracle) proporciona datos de precios en tiempo real');
  console.log('⏱️  Los precios se actualizan cada 3 minutos');
  console.log('🔗 Dirección del contrato FTSO V2: 0x1000000000000000000000000000000000000003');
  console.log('📊 Feeds disponibles: FLR/USD, BTC/USD, ETH/USD, SGB/USD');
  
  console.log('\n🔍 Verificando diferentes direcciones del FTSO...');
  
  // Probar diferentes direcciones conocidas del FTSO
  const FTSO_ADDRESSES = [
    '0x1000000000000000000000000000000000000003', // FTSO V2
    '0x1000000000000000000000000000000000000002', // FTSO V1
    '0x1000000000000000000000000000000000000001', // FTSO Manager
  ];

  for (const address of FTSO_ADDRESSES) {
    try {
      console.log(`\n🔍 Probando dirección: ${address}`);
      
      const code = await ethers.provider.getCode(address);
      if (code !== '0x') {
        console.log(`✅ Contrato encontrado en ${address}`);
        
        // Intentar leer el código del contrato para entender su interfaz
        const codeSize = code.length - 2; // Remover '0x'
        console.log(`📏 Tamaño del código: ${codeSize / 2} bytes`);
        
        // Verificar si es un contrato proxy
        if (code.includes('0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc')) {
          console.log(`🔗 Parece ser un contrato proxy`);
        }
        
      } else {
        console.log(`❌ No hay contrato en ${address}`);
      }
    } catch (error) {
      console.log(`❌ Error verificando ${address}: ${error.message}`);
    }
  }

  console.log('\n📋 Verificando configuración de red...');
  
  try {
    const network = await ethers.provider.getNetwork();
    console.log(`🌐 Red: ${network.name} (Chain ID: ${network.chainId})`);
    
    if (network.chainId === 114) {
      console.log('✅ Estamos en Coston2 testnet');
      console.log('⚠️  NOTA: El FTSO puede no estar completamente funcional en testnet');
    } else if (network.chainId === 14) {
      console.log('✅ Estamos en Flare mainnet');
      console.log('✅ El FTSO debería estar completamente funcional');
    } else {
      console.log('⚠️  Red desconocida, el FTSO puede no estar disponible');
    }
  } catch (error) {
    console.log(`❌ Error obteniendo información de red: ${error.message}`);
  }

  console.log('\n🔧 Verificando configuración de Hardhat...');
  
  try {
    const accounts = await ethers.getSigners();
    console.log(`👤 Cuenta conectada: ${accounts[0].address}`);
    
    const balance = await ethers.provider.getBalance(accounts[0].address);
    console.log(`💰 Balance: ${ethers.formatEther(balance)} FLR`);
    
  } catch (error) {
    console.log(`❌ Error obteniendo información de cuenta: ${error.message}`);
  }

  console.log('\n📝 Recomendaciones:');
  console.log('1. Verificar que estés conectado a la red correcta (Coston2 o Flare mainnet)');
  console.log('2. El FTSO puede requerir configuración adicional en testnet');
  console.log('3. Considerar usar precios simulados para desarrollo');
  console.log('4. Verificar la documentación oficial: https://docs.flare.network/ftso/');
  
  console.log('\n🎯 Para mercados de predicción en producción:');
  console.log('- Usar Flare mainnet donde el FTSO está completamente funcional');
  console.log('- Implementar fallbacks para casos donde el FTSO no esté disponible');
  console.log('- Considerar usar múltiples fuentes de datos para mayor confiabilidad');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
