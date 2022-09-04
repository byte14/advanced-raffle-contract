const { ethers, network } = require("hardhat");
const { networkConfig } = require("../helper-hardhat-config");

const sendValue = ethers.utils.parseEther("10");
const chainId = network.config.chainId;
let linkToken;

async function depositLink() {
  const raffle = await ethers.getContract("Raffle");
  if (chainId !== 31337) {
    linkToken = await ethers.getContractAt(
      "LinkToken",
      networkConfig[chainId]["linkToken"]
    );
  } else {
    linkToken = await ethers.getContract("LinkToken");
  }
  const approveLinkTx = await linkToken.approve(raffle.address, sendValue);
  await approveLinkTx.wait(1);
  console.log(
    `${ethers.utils.formatEther(sendValue)} Link token has been approved`
  );
  const depositLinkTx = await raffle.depositLink(sendValue);
  await depositLinkTx.wait(1);
  console.log(
    `${ethers.utils.formatEther(sendValue)} Link token has been deposited`
  );
}

depositLink()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
