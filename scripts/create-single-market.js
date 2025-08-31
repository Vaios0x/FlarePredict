const { ethers } = require('hardhat');

async function main() {
  console.log('🚀 Creando mercado de prueba...');

  // Obtener el contrato
  const FlarePredict = await ethers.getContractFactory('FlarePredict');
  const contract = FlarePredict.attach('0xf19b9cECB7B251d0D554FbD5742fae959Dacd33D');

  // Mercado de prueba simple
  const market = {
    title: "¿FLR alcanzará $0.50?",
    description: "Mercado resuelve SÍ si FLR/USD >= $0.50 al final del período",
    threshold: "50", // $0.50 * 100
    deadline: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60), // 7 días
  };

  console.log(`📊 Creando mercado: ${market.title}`);
  console.log(`📝 Descripción: ${market.description}`);
  console.log(`💰 Umbral: $${parseInt(market.threshold) / 100}`);
  console.log(`⏰ Deadline: ${new Date(market.deadline * 1000).toLocaleString()}`);
  
  try {
    const tx = await contract.createMarket(
      market.title,
      market.description,
      "0x01464c522f55534400000000000000000000000000", // FLR/USD feed
      0, // marketType: 0 = threshold
      ethers.parseUnits(market.threshold, 2), // threshold en centavos
      0, // lowerBound
      0, // upperBound
      market.deadline,
      market.deadline + (24 * 60 * 60), // resolutionTime: 1 día después
      { gasLimit: 500000 }
    );

    console.log(`✅ Transacción enviada: ${tx.hash}`);
    console.log('⏳ Esperando confirmación...');
    
    const receipt = await tx.wait();
    console.log(`✅ Mercado creado exitosamente!`);
    console.log(`📋 Gas usado: ${receipt.gasUsed.toString()}`);
    console.log(`🔗 Block: ${receipt.blockNumber}`);
    
  } catch (error) {
    console.error(`❌ Error creando mercado:`, error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
