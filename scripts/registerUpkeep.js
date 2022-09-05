const { ethers, network } = require("hardhat");
const { networkConfig } = require("../helper-hardhat-config");

const chainId = network.config.chainId;

async function registerUpkeep() {
  if (chainId !== 31337) {
    const upkeepName = networkConfig[chainId]["upkeepName"];
    const encryptedEmail = networkConfig[chainId]["encryptedEmail"];
    const upkeepGasLimit = networkConfig[chainId]["upkeepGasLimit"];
    const checkData = networkConfig[chainId]["checkData"];
    const fundUpkeepAmount = networkConfig[chainId]["fundUpkeepAmount"];
    const source = networkConfig[chainId]["source"];

    const raffle = await ethers.getContract("Raffle");
    const tx = await raffle.registerUpkeep(
      upkeepName,
      encryptedEmail,
      raffle.address,
      upkeepGasLimit,
      checkData,
      fundUpkeepAmount,
      source
    );
    await tx.wait(1);
    const upkeepId = await raffle.getUpkeepId();
    console.log(`New Upkeep is registered with id ${upkeepId}`);
  } else {
    console.log("No Upkeep registration required");
  }
}

registerUpkeep()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
