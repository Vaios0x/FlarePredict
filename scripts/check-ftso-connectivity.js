const { ethers } = require('hardhat');

async function main() {
  console.log('🔍 Verificando conectividad con FTSO...');

  // Dirección del contrato FTSO V2 en Coston2
  const FTSO_V2_ADDRESS = '0x1000000000000000000000000000000000000003';
  
  // Feed IDs para diferentes pares
  const FEED_IDS = {
    FLR_USD: '0x01464c522f55534400000000000000000000000000',
    BTC_USD: '0x014254432f55534400000000000000000000000000',
    ETH_USD: '0x014554482f55534400000000000000000000000000',
    SGB_USD: '0x015347422f55534400000000000000000000000000',
  };

  // ABI para FTSO V2
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
      "inputs": [{"internalType": "bytes21", "name": "_feedId", "type": "bytes21"}],
      "name": "getFeedByIdInWei",
      "outputs": [
        {"internalType": "uint256", "name": "_feedValue", "type": "uint256"},
        {"internalType": "uint64", "name": "_timestamp", "type": "uint64"}
      ],
      "stateMutability": "view",
      "type": "function"
    }
  ];

  try {
    // Crear instancia del contrato FTSO
    const ftsoContract = new ethers.Contract(FTSO_V2_ADDRESS, FTSO_V2_ABI, ethers.provider);
    
    console.log(`📡 Conectando a FTSO V2 en: ${FTSO_V2_ADDRESS}`);
    
    // Obtener información de la red de forma segura
    try {
      const network = await ethers.provider.getNetwork();
      console.log(`🌐 Red actual: ${network.name} (Chain ID: ${network.chainId})`);
    } catch (error) {
      console.log(`🌐 Red actual: No disponible`);
    }
    
    try {
      console.log(`🔗 RPC URL: ${ethers.provider.connection.url}`);
    } catch (error) {
      console.log(`🔗 RPC URL: No disponible`);
    }
    
    // Verificar que el contrato existe
    const code = await ethers.provider.getCode(FTSO_V2_ADDRESS);
    if (code === '0x') {
      throw new Error('El contrato FTSO V2 no existe en esta dirección');
    }
    console.log('✅ Contrato FTSO V2 encontrado');

    // Probar cada feed
    for (const [pair, feedId] of Object.entries(FEED_IDS)) {
      try {
        console.log(`\n📊 Probando ${pair}...`);
        
        const result = await ftsoContract.getFeedByIdInWei(feedId);
        const priceInWei = result[0];
        const timestamp = result[1];
        
        const priceInUSD = parseFloat(priceInWei.toString()) / 1e18;
        const age = Math.floor((Date.now() - Number(timestamp) * 1000) / 1000);
        
        console.log(`✅ ${pair}: $${priceInUSD.toFixed(6)}`);
        console.log(`⏰ Timestamp: ${new Date(Number(timestamp) * 1000).toLocaleString()}`);
        console.log(`🕐 Edad: ${age} segundos`);
        console.log(`🔢 Raw value: ${priceInWei.toString()}`);
        
        // Verificar si el precio es razonable
        if (priceInUSD <= 0) {
          console.log(`⚠️  ADVERTENCIA: Precio de ${pair} es 0 o negativo`);
        } else if (age > 300) { // Más de 5 minutos
          console.log(`⚠️  ADVERTENCIA: Precio de ${pair} es muy antiguo (${age}s)`);
        }
        
      } catch (error) {
        console.log(`❌ Error obteniendo ${pair}: ${error.message}`);
      }
    }

    // Verificar la frecuencia de actualización
    console.log('\n🔄 Verificando frecuencia de actualización...');
    const flrResult1 = await ftsoContract.getFeedByIdInWei(FEED_IDS.FLR_USD);
    const timestamp1 = Number(flrResult1[1]);
    
    await new Promise(resolve => setTimeout(resolve, 10000)); // Esperar 10 segundos
    
    const flrResult2 = await ftsoContract.getFeedByIdInWei(FEED_IDS.FLR_USD);
    const timestamp2 = Number(flrResult2[1]);
    
    const timeDiff = timestamp2 - timestamp1;
    console.log(`⏱️  Diferencia de tiempo entre lecturas: ${timeDiff} segundos`);
    
    if (timeDiff > 0) {
      console.log('✅ El FTSO está actualizando precios');
    } else {
      console.log('⚠️  El FTSO no parece estar actualizando precios');
    }

    console.log('\n✅ Verificación de conectividad completada!');
    console.log('🎉 El FTSO está funcionando correctamente.');

  } catch (error) {
    console.error('❌ Error durante la verificación:', error.message);
    
    if (error.message.includes('execution reverted')) {
      console.log('\n🔍 Posibles causas:');
      console.log('- El contrato FTSO no está disponible en esta red');
      console.log('- Los feeds FTSO no están configurados correctamente');
      console.log('- Problemas de conectividad con la red');
      console.log('- La red no es Coston2 testnet');
    }
    
    if (error.message.includes('network')) {
      console.log('\n🌐 Verificar configuración de red:');
      console.log('- Asegúrate de estar conectado a Coston2 testnet');
      console.log('- Verifica que el RPC endpoint esté funcionando');
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
