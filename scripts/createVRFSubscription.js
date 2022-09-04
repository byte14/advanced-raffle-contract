const { ethers } = require("hardhat");

async function createVRFSubscription() {
  const raffle = await ethers.getContract("Raffle");
  const tx = await raffle.createVRFSubscription();
  await tx.wait(1);
  const subscriptionId = await raffle.getSubscriptionId();
  console.log(
    `New Chainlink VRF subscription is created with id: ${subscriptionId}`
  );
}

createVRFSubscription()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
