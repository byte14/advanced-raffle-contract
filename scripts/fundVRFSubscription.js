const { ethers, network } = require("hardhat");

const fundValue = ethers.utils.parseEther("3");
const chainId = network.config.chainId;

async function fundVRFSubscription() {
  const raffle = await ethers.getContract("Raffle");
  const subscriptionId = await raffle.getSubscriptionId();
  if (chainId !== 31337) {
    const tx = await raffle.fundVRFSubscription(fundValue);
    await tx.wait(1);
    console.log(
      `VRF subscription id ${subscriptionId} is funded with ${ethers.utils.formatEther(
        fundValue
      )} link token!`
    );
  } else {
    const vrfCoordinatorV2Mock = await ethers.getContract(
      "VRFCoordinatorV2Mock"
    );
    await vrfCoordinatorV2Mock.fundSubscription(subscriptionId, fundValue);
    console.log(
      `VRF subscription id ${subscriptionId} is funded with ${ethers.utils.formatEther(
        fundValue
      )} link token!`
    );
  }
}

fundVRFSubscription()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
