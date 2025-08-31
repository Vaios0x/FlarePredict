const { ethers } = require("hardhat");

async function main() {
  console.log("🔍 Testing FlarePredict contract connectivity...");
  
  try {
    // Get provider
    const provider = new ethers.JsonRpcProvider("https://coston2-api.flare.network/ext/C/rpc");
    
    // Contract address
    const contractAddress = "0xf19b9cECB7B251d0D554FbD5742fae959Dacd33D";
    
    // Check if contract exists
    const code = await provider.getCode(contractAddress);
    if (code === "0x") {
      console.log("❌ Contract not found at address");
      return;
    }
    
    console.log("✅ Contract found at address");
    
    // Get latest block
    const block = await provider.getBlockNumber();
    console.log("Latest block:", block);
    
    // Get network info
    const network = await provider.getNetwork();
    console.log("Network:", network.name, "(Chain ID:", network.chainId, ")");
    
    console.log("\n🎉 Contract connectivity test successful!");
    console.log("Contract is ready to use on Coston2 testnet");
    
  } catch (error) {
    console.error("❌ Error testing contract:", error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
