const { ethers } = require('hardhat');

async function main() {
  console.log('🔍 Verificando contratos disponibles en Coston2 testnet...');

  // Direcciones conocidas del FTSO
  const KNOWN_ADDRESSES = [
    '0x1000000000000000000000000000000000000001', // FTSO Manager
    '0x1000000000000000000000000000000000000002', // FTSO V1
    '0x1000000000000000000000000000000000000003', // FTSO V2
    '0x1000000000000000000000000000000000000004', // FtsoFeedPublisher
    '0x1000000000000000000000000000000000000005', // FtsoInflationConfigurations
    '0xaD67FE66660Fb8dFE9d6b1b4240d8650e30F6019', // ContractRegistry
  ];

  console.log('\n📋 Verificando contratos conocidos...');
  
  for (const address of KNOWN_ADDRESSES) {
    try {
      const code = await ethers.provider.getCode(address);
      if (code !== '0x') {
        const codeSize = (code.length - 2) / 2; // Remover '0x' y convertir a bytes
        console.log(`✅ ${address}: ${codeSize} bytes`);
        
        // Intentar detectar el tipo de contrato
        if (code.includes('0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc')) {
          console.log(`  🔗 Parece ser un contrato proxy`);
        }
        
        // Verificar si tiene funciones FTSO
        if (code.includes('getFeedById') || code.includes('getFeedsById')) {
          console.log(`  📊 Parece ser un contrato FTSO`);
        }
        
      } else {
        console.log(`❌ ${address}: No hay contrato`);
      }
    } catch (error) {
      console.log(`❌ ${address}: Error - ${error.message}`);
    }
  }

  // Verificar si hay algún contrato FTSO funcionando directamente
  console.log('\n🔍 Probando FTSO V2 directamente...');
  
  const FTSO_V2_ADDRESS = '0x1000000000000000000000000000000000000003';
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
    }
  ];

  try {
    const ftsoV2 = new ethers.Contract(FTSO_V2_ADDRESS, FTSO_V2_ABI, ethers.provider);
    
    // Probar con un feed ID
    const FLR_USD_FEED = '0x01464c522f55534400000000000000000000000000';
    
    console.log('📊 Intentando obtener precio FLR/USD...');
    const result = await ftsoV2.getFeedById(FLR_USD_FEED);
    
    const priceValue = result[0];
    const decimals = result[1];
    const timestamp = result[2];
    
    const price = parseFloat(priceValue.toString()) / Math.pow(10, Number(decimals));
    
    console.log(`✅ Precio FLR/USD: $${price.toFixed(6)}`);
    console.log(`📏 Decimals: ${decimals}`);
    console.log(`⏰ Timestamp: ${new Date(Number(timestamp) * 1000).toLocaleString()}`);
    console.log(`🔢 Raw value: ${priceValue.toString()}`);
    
  } catch (error) {
    console.log(`❌ Error probando FTSO V2 directamente: ${error.message}`);
  }

  // Verificar configuración de red
  console.log('\n🌐 Información de red:');
  try {
    const network = await ethers.provider.getNetwork();
    console.log(`Chain ID: ${network.chainId}`);
    console.log(`Nombre: ${network.name}`);
    
    if (network.chainId === 114) {
      console.log('✅ Estamos en Coston2 testnet');
      console.log('⚠️  NOTA: El FTSO puede no estar completamente funcional en testnet');
    } else if (network.chainId === 14) {
      console.log('✅ Estamos en Flare mainnet');
      console.log('✅ El FTSO debería estar completamente funcional');
    } else {
      console.log('⚠️  Red desconocida');
    }
  } catch (error) {
    console.log(`❌ Error obteniendo información de red: ${error.message}`);
  }

  // Verificar balance de la cuenta
  console.log('\n💰 Información de cuenta:');
  try {
    const accounts = await ethers.getSigners();
    const balance = await ethers.provider.getBalance(accounts[0].address);
    console.log(`Cuenta: ${accounts[0].address}`);
    console.log(`Balance: ${ethers.formatEther(balance)} FLR`);
  } catch (error) {
    console.log(`❌ Error obteniendo información de cuenta: ${error.message}`);
  }

  console.log('\n📝 Conclusiones:');
  console.log('1. Si el FTSO no está funcionando en testnet, usar precios simulados');
  console.log('2. Para producción, migrar a Flare mainnet');
  console.log('3. Implementar fallbacks robustos para casos donde el FTSO no esté disponible');
  console.log('4. Considerar usar múltiples fuentes de datos');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
