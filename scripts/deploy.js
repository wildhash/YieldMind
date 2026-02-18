const hre = require("hardhat");

async function main() {
  console.log("Deploying YieldMindVault to BSC...");

  // Get the deployer account
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with account:", deployer.address);

  // Set AI agent address (deployer for now, will be updated to backend address)
  const aiAgentAddress = deployer.address;

  // Deploy the vault
  const YieldMindVault = await hre.ethers.getContractFactory("YieldMindVault");
  const vault = await YieldMindVault.deploy(aiAgentAddress);

  await vault.waitForDeployment();
  const vaultAddress = await vault.getAddress();

  console.log("YieldMindVault deployed to:", vaultAddress);
  console.log("\nUpdate your .env files with:");
  console.log(`VAULT_CONTRACT_ADDRESS=${vaultAddress}`);
  console.log(`NEXT_PUBLIC_VAULT_ADDRESS=${vaultAddress}`);
  
  console.log("\nVerify contract on BSCScan:");
  console.log(`npx hardhat verify --network bsc ${vaultAddress} ${aiAgentAddress}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
