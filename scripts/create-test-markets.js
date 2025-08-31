const { ethers } = require('hardhat');

async function main() {
  console.log('🚀 Creando mercados de prueba...');

  // Obtener el contrato
  const FlarePredict = await ethers.getContractFactory('FlarePredict');
  const contract = FlarePredict.attach('0xf19b9cECB7B251d0D554FbD5742fae959Dacd33D');

  // Ejemplos de mercados de prueba
  const testMarkets = [
    {
      title: "¿FLR alcanzará $0.50?",
      description: "Mercado resuelve SÍ si FLR/USD >= $0.50 al final del período",
      threshold: "50", // $0.50 * 100
      deadline: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60), // 7 días
    },
    {
      title: "¿FLR superará $0.75?",
      description: "Mercado resuelve SÍ si FLR/USD >= $0.75 al final del período",
      threshold: "75", // $0.75 * 100
      deadline: Math.floor(Date.now() / 1000) + (5 * 24 * 60 * 60), // 5 días
    },
    {
      title: "¿FLR llegará a $1.00?",
      description: "Mercado resuelve SÍ si FLR/USD >= $1.00 al final del período",
      threshold: "100", // $1.00 * 100
      deadline: Math.floor(Date.now() / 1000) + (3 * 24 * 60 * 60), // 3 días
    },
    {
      title: "¿FLR caerá por debajo de $0.20?",
      description: "Mercado resuelve SÍ si FLR/USD <= $0.20 al final del período",
      threshold: "20", // $0.20 * 100
      deadline: Math.floor(Date.now() / 1000) + (10 * 24 * 60 * 60), // 10 días
    },
    {
      title: "¿FLR mantendrá $0.30?",
      description: "Mercado resuelve SÍ si FLR/USD se mantiene en $0.30 ±5%",
      threshold: "30", // $0.30 * 100
      deadline: Math.floor(Date.now() / 1000) + (14 * 24 * 60 * 60), // 14 días
    }
  ];

  for (let i = 0; i < testMarkets.length; i++) {
    const market = testMarkets[i];
    console.log(`\n📊 Creando mercado ${i + 1}: ${market.title}`);
    
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
      await tx.wait();
      console.log(`✅ Mercado ${i + 1} creado exitosamente`);
      
    } catch (error) {
      console.error(`❌ Error creando mercado ${i + 1}:`, error.message);
    }
  }

  console.log('\n🎉 Proceso completado!');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
