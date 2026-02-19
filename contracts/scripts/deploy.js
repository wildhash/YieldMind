const hre = require("hardhat");

async function main() {
  console.log("Deploying YieldMindVault...");

  const signers = await hre.ethers.getSigners();
  if (!signers.length) {
    throw new Error(
      "No deployer signer found. Set PRIVATE_KEY (or DEPLOYER_PRIVATE_KEY) in backend/.env or shell environment."
    );
  }

  const [deployer] = signers;
  console.log("Deploying with account:", deployer.address);

  const aiAgentAddress = deployer.address;

  const YieldMindVault = await hre.ethers.getContractFactory("YieldMindVault");
  const vault = await YieldMindVault.deploy(aiAgentAddress);

  const deploymentTx = vault.deploymentTransaction();
  if (deploymentTx) {
    console.log("Deployment tx hash:", deploymentTx.hash);
  }

  await vault.waitForDeployment();
  const vaultAddress = await vault.getAddress();

  console.log("YieldMindVault deployed to:", vaultAddress);
  console.log("\nUpdate your .env files with:");
  console.log(`VAULT_CONTRACT_ADDRESS=${vaultAddress}`);
  console.log(`NEXT_PUBLIC_VAULT_ADDRESS=${vaultAddress}`);

  console.log("\nVerify contract on BSCScan:");
  console.log(`npx hardhat verify --network ${hre.network.name} ${vaultAddress} ${aiAgentAddress}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
