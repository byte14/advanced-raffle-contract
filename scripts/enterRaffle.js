const { ethers } = require("hardhat");

async function enterRaffle() {
  const raffle = await ethers.getContract("Raffle");
  const entryFee = await raffle.getEntryFee();
  const enterRaffleTx = await raffle.enterRaffle({ value: entryFee });
  await enterRaffleTx.wait(1);
}

enterRaffle()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
