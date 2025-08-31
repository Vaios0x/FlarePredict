const { ethers } = require("hardhat");

async function main() {
  const address = "0x5E5D2287EA3F5778562228BaD1F6449FcD8a6Ee1";
  const balance = await ethers.provider.getBalance(address);
  
  console.log(`Wallet: ${address}`);
  console.log(`Balance: ${ethers.formatEther(balance)} C2FLR`);
  
  if (balance === 0n) {
    console.log("\n⚠️  WARNING: Wallet has no balance!");
    console.log("Get testnet tokens from: https://faucet.flare.network/coston2");
  } else if (balance < ethers.parseEther("0.1")) {
    console.log("\n⚠️  WARNING: Low balance for deployment!");
    console.log("Get more testnet tokens from: https://faucet.flare.network/coston2");
  } else {
    console.log("\n✅ Sufficient balance for deployment");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
