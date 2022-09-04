const { ethers } = require("hardhat");

async function addVRFConsumer() {
  const raffle = await ethers.getContract("Raffle");
  const tx = await raffle.addVRFConsumer(raffle.address);
  await tx.wait(1);
  const subscriptionId = await raffle.getSubscriptionId();
  console.log(
    `${raffle.address} has been added as consumer for VRF subscription id ${subscriptionId}`
  );
}

addVRFConsumer()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
