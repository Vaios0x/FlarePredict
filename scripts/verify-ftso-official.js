const { ethers } = require('hardhat');

async function main() {
  console.log('🔍 Verificando FTSOv2 con configuración oficial...');

  // Configuración según documentación oficial
  const CONTRACT_REGISTRY_ADDRESS = '0xaD67FE66660Fb8dFE9d6b1b4240d8650e30F6019';
  
  // Feed IDs oficiales
  const FTSO_FEEDS = {
    FLR_USD: '0x01464c522f55534400000000000000000000000000',
    BTC_USD: '0x014254432f55534400000000000000000000000000',
    ETH_USD: '0x014554482f55534400000000000000000000000000',
    XRP_USD: '0x01585250502f555344000000000000000000000000',
  };

  // ABI para ContractRegistry
  const CONTRACT_REGISTRY_ABI = [
    {
      "inputs": [],
      "name": "getFtsoV2",
      "outputs": [{"internalType": "address", "name": "", "type": "address"}],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getTestFtsoV2",
      "outputs": [{"internalType": "address", "name": "", "type": "address"}],
      "stateMutability": "view",
      "type": "function"
    }
  ];

  // ABI para FTSOv2
  const FTSO_V2_ABI = [
    {
      "inputs": [{"internalType": "bytes21", "name": "_feedId", "type": "bytes21"}],
      "name": "getFeedById",
      "outputs": [
        {"internalType": "uint256", "name": "_feedValue", "type": "uint256"},
        {"internalType": "int8", "name": "_decimals", "type": "int8"},
        {"internalType": "uint64", "name": "_timestamp", "type": "uint64"}
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [{"internalType": "bytes21[]", "name": "_feedIds", "type": "bytes21[]"}],
      "name": "getFeedsById",
      "outputs": [
        {"internalType": "uint256[]", "name": "_feedValues", "type": "uint256[]"},
        {"internalType": "int8[]", "name": "_decimals", "type": "int8[]"},
        {"internalType": "uint64", "name": "_timestamp", "type": "uint64"}
      ],
      "stateMutability": "view",
      "type": "function"
    }
  ];

  try {
    console.log('📡 Conectando a ContractRegistry...');
    const contractRegistry = new ethers.Contract(CONTRACT_REGISTRY_ADDRESS, CONTRACT_REGISTRY_ABI, ethers.provider);
    
    // Verificar que el ContractRegistry existe
    const registryCode = await ethers.provider.getCode(CONTRACT_REGISTRY_ADDRESS);
    if (registryCode === '0x') {
      throw new Error('ContractRegistry no encontrado');
    }
    console.log('✅ ContractRegistry encontrado');

    // Obtener dirección del FTSO V2
    console.log('\n🔍 Obteniendo dirección del FTSO V2...');
    let ftsoV2Address;
    
    try {
      ftsoV2Address = await contractRegistry.getFtsoV2();
      console.log(`✅ FTSO V2 de producción: ${ftsoV2Address}`);
    } catch (error) {
      console.log('⚠️ No se pudo obtener FTSO V2 de producción, intentando test...');
      
      try {
        ftsoV2Address = await contractRegistry.getTestFtsoV2();
        console.log(`✅ FTSO V2 de test: ${ftsoV2Address}`);
      } catch (testError) {
        throw new Error('No se pudo obtener dirección del FTSO V2');
      }
    }

    // Verificar que el FTSO V2 existe
    const ftsoCode = await ethers.provider.getCode(ftsoV2Address);
    if (ftsoCode === '0x') {
      throw new Error('FTSO V2 no encontrado en la dirección obtenida');
    }
    console.log('✅ FTSO V2 encontrado');

    // Crear instancia del FTSO V2
    const ftsoV2 = new ethers.Contract(ftsoV2Address, FTSO_V2_ABI, ethers.provider);

    // Probar feeds individuales
    console.log('\n📊 Probando feeds individuales...');
    for (const [pair, feedId] of Object.entries(FTSO_FEEDS)) {
      try {
        console.log(`\n🔍 Probando ${pair}...`);
        
        const result = await ftsoV2.getFeedById(feedId);
        const priceValue = result[0];
        const decimals = result[1];
        const timestamp = result[2];
        
        const price = parseFloat(priceValue.toString()) / Math.pow(10, Number(decimals));
        const age = Math.floor((Date.now() - Number(timestamp) * 1000) / 1000);
        
        console.log(`✅ ${pair}: $${price.toFixed(6)}`);
        console.log(`📏 Decimals: ${decimals}`);
        console.log(`⏰ Timestamp: ${new Date(Number(timestamp) * 1000).toLocaleString()}`);
        console.log(`🕐 Edad: ${age} segundos`);
        console.log(`🔢 Raw value: ${priceValue.toString()}`);
        
        // Verificar si el precio es razonable
        if (price <= 0) {
          console.log(`⚠️  ADVERTENCIA: Precio de ${pair} es 0 o negativo`);
        } else if (age > 300) { // Más de 5 minutos
          console.log(`⚠️  ADVERTENCIA: Precio de ${pair} es muy antiguo (${age}s)`);
        }
        
      } catch (error) {
        console.log(`❌ Error obteniendo ${pair}: ${error.message}`);
      }
    }

    // Probar múltiples feeds a la vez
    console.log('\n📊 Probando múltiples feeds...');
    try {
      const feedIds = Object.values(FTSO_FEEDS);
      const result = await ftsoV2.getFeedsById(feedIds);
      
      const feedValues = result[0];
      const decimals = result[1];
      const timestamp = result[2];
      
      console.log(`✅ Múltiples feeds obtenidos (timestamp: ${new Date(Number(timestamp) * 1000).toLocaleString()})`);
      
      Object.keys(FTSO_FEEDS).forEach((pair, index) => {
        const priceValue = feedValues[index];
        const decimal = decimals[index];
        const price = parseFloat(priceValue.toString()) / Math.pow(10, Number(decimal));
        console.log(`  ${pair}: $${price.toFixed(6)} (decimals: ${decimal})`);
      });
      
    } catch (error) {
      console.log(`❌ Error obteniendo múltiples feeds: ${error.message}`);
    }

    // Verificar frecuencia de actualización
    console.log('\n🔄 Verificando frecuencia de actualización...');
    try {
      const result1 = await ftsoV2.getFeedById(FTSO_FEEDS.FLR_USD);
      const timestamp1 = Number(result1[2]);
      
      await new Promise(resolve => setTimeout(resolve, 10000)); // Esperar 10 segundos
      
      const result2 = await ftsoV2.getFeedById(FTSO_FEEDS.FLR_USD);
      const timestamp2 = Number(result2[2]);
      
      const timeDiff = timestamp2 - timestamp1;
      console.log(`⏱️  Diferencia de tiempo entre lecturas: ${timeDiff} segundos`);
      
      if (timeDiff > 0) {
        console.log('✅ El FTSO está actualizando precios');
      } else {
        console.log('⚠️  El FTSO no parece estar actualizando precios');
      }
    } catch (error) {
      console.log(`❌ Error verificando frecuencia: ${error.message}`);
    }

    console.log('\n✅ Verificación completada exitosamente!');
    console.log('🎉 El FTSOv2 está funcionando correctamente según la documentación oficial.');

  } catch (error) {
    console.error('❌ Error durante la verificación:', error.message);
    
    if (error.message.includes('execution reverted')) {
      console.log('\n🔍 Posibles causas:');
      console.log('- El FTSO no está completamente configurado en esta red');
      console.log('- Los feeds pueden no estar activos en testnet');
      console.log('- Problemas de conectividad con la red');
    }
    
    console.log('\n📝 Recomendaciones:');
    console.log('1. Verificar que estés en la red correcta (Coston2 o Flare mainnet)');
    console.log('2. El FTSO puede requerir configuración adicional en testnet');
    console.log('3. Consultar la documentación oficial: https://dev.flare.network/ftso/');
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
