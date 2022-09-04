const { ethers } = require("hardhat");

async function cancelVRFSubscription() {
  const raffle = await ethers.getContract("Raffle");
  const subscriptionId = await raffle.getSubscriptionId();
  const balance = await raffle.getVRFSubscriptionBalance();
  const tx = await raffle.cancelVRFSubscription();
  await tx.wait(1);
  console.log(`VRF subscription id ${subscriptionId} is set to 0`);
  console.log(
    `Subscription owner account is refunded with ${ethers.utils.formatEther(
      balance
    )} link token`
  );
}

cancelVRFSubscription()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
