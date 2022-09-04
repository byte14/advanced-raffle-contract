const { ethers } = require("hardhat");

const withdrawValue = ethers.utils.parseEther("10");

async function withdrawLink() {
  const raffle = await ethers.getContract("Raffle");
  const withdrawLinkTx = await raffle.withdrawLink(withdrawValue);
  await withdrawLinkTx.wait(1);
  console.log(
    `${ethers.utils.formatEther(withdrawValue)} Link token has been withdrawn`
  );
}

withdrawLink()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
