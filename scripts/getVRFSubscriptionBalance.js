const { ethers } = require("hardhat");

async function getVRFSubscriptionBalance() {
  const raffle = await ethers.getContract("Raffle");
  const balance = await raffle.getVRFSubscriptionBalance();
  const subscriptionId = await raffle.getSubscriptionId();
  console.log(
    `VRF subscription id ${subscriptionId} has ${ethers.utils.formatEther(
      balance
    )} link token!`
  );
}

getVRFSubscriptionBalance()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
