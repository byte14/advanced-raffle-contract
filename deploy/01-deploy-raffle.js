const { network, ethers } = require("hardhat");
const { networkConfig } = require("../helper-hardhat-config");
const { verify } = require("../utils/verify");
require("dotenv").config();

const SEND_VALUE = ethers.utils.parseEther("2");

module.exports = async function ({ getNamedAccounts, deployments }) {
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId = network.config.chainId;
  let vrfCoordinatorV2Mock;
  let vrfCoordinatorV2Address;
  let linkTokenAddress;

  if (chainId === 31337) {
    vrfCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock");
    vrfCoordinatorV2Address = vrfCoordinatorV2Mock.address;
    linkTokenAddress = (await ethers.getContract("LinkToken")).address;
  } else {
    vrfCoordinatorV2Address = networkConfig[chainId]["vrfCoordinatorV2"];
    linkTokenAddress = networkConfig[chainId]["linkToken"];
  }

  const entryFee = networkConfig[chainId]["entryFee"];
  const keyHash = networkConfig[chainId]["keyHash"];
  const callbackGasLimit = networkConfig[chainId]["callbackGasLimit"];
  const interval = networkConfig[chainId]["interval"];

  const arguments = [
    vrfCoordinatorV2Address,
    linkTokenAddress,
    entryFee,
    keyHash,
    callbackGasLimit,
    interval,
  ];

  await deploy("Raffle", {
    from: deployer,
    args: arguments,
    log: true,
    waitConfirmations: network.config.blockConfirmations,
  });

  const raffle = await ethers.getContract("Raffle", deployer);

  if (chainId === 31337) {
    await vrfCoordinatorV2Mock.fundSubscription(1, SEND_VALUE);
  } else {
    const linkToken = await ethers.getContractAt("LinkToken", linkTokenAddress);
    const approveLinkTX = await linkToken.approve(raffle.address, SEND_VALUE);
    await approveLinkTX.wait(1);
    const depositLinkTx = await raffle.depositLink(SEND_VALUE);
    await depositLinkTx.wait(1);
    const fundSubscriptionTx = await raffle.fundSubscription(SEND_VALUE);
    await fundSubscriptionTx.wait(1);

    if (process.env.ETHERSCAN_API_KEY) {
      await verify(raffle.address, arguments);
    }
  }
  log("______________________________________________________");
};

module.exports.tags = ["all", "raffle"];
