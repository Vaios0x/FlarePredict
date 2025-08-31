import { ethers, run } from "hardhat";

async function main() {
  console.log("🚀 Deploying FlarePredict to Flare Network...");
  
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);
  
  // Deploy contract
  const FlarePredict = await ethers.getContractFactory("FlarePredict");
  const flarePredict = await FlarePredict.deploy();
  
  await flarePredict.waitForDeployment();
  
  const address = await flarePredict.getAddress();
  console.log("✅ FlarePredict deployed to:", address);
  
  // Verify contract
  console.log("Verifying contract...");
  try {
    await run("verify:verify", {
      address: address,
      constructorArguments: [],
    });
    console.log("✅ Contract verified successfully!");
  } catch (error) {
    console.log("⚠️ Verification failed:", error);
  }
  
  console.log("🎉 Deployment complete!");
  console.log("Contract address:", address);
  console.log("Add this to your .env file:");
  console.log(`NEXT_PUBLIC_CONTRACT_ADDRESS=${address}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
