const { network, ethers } = require("hardhat");
const { networkConfig } = require("../helper-hardhat-config");
const { verify } = require("../utils/verify");

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
  const vrfCallbackGasLimit = networkConfig[chainId]["vrfCallbackGasLimit"];
  const interval = networkConfig[chainId]["interval"];
  const registrar = networkConfig[chainId]["registrar"];
  const registry = networkConfig[chainId]["registry"];
  const fundVRFAmount = networkConfig[chainId]["fundVRFAmount"];

  const raffleArgs = [
    vrfCoordinatorV2Address,
    linkTokenAddress,
    entryFee,
    keyHash,
    vrfCallbackGasLimit,
    interval,
    registrar,
    registry,
  ];

  await deploy("Raffle", {
    from: deployer,
    args: raffleArgs,
    log: true,
    waitConfirmations: network.config.blockConfirmations,
  });

  if (chainId === 31337) {
    // Subscription for Chainlik VRF on mock contract
    await vrfCoordinatorV2Mock.fundSubscription(1, fundVRFAmount);
  } else {
    const upkeepName = networkConfig[chainId]["upkeepName"];
    const encryptedEmail = networkConfig[chainId]["encryptedEmail"];
    const upkeepGasLimit = networkConfig[chainId]["upkeepGasLimit"];
    const checkData = networkConfig[chainId]["checkData"];
    const fundUpkeepAmount = networkConfig[chainId]["fundUpkeepAmount"];
    const source = networkConfig[chainId]["source"];

    const raffle = await ethers.getContract("Raffle", deployer);
    const linkToken = await ethers.getContractAt("LinkToken", linkTokenAddress);

    // Approve and Deposit Link token into the contract
    console.log("Approving Link token...");
    const approveLinkTx = await linkToken.approve(
      raffle.address,
      fundUpkeepAmount.add(fundVRFAmount)
    );
    await approveLinkTx.wait(1);
    console.log("Depositig Link token...");
    const depositLinkTx = await raffle.depositLink(
      fundUpkeepAmount.add(fundVRFAmount)
    );
    await depositLinkTx.wait(1);

    // Registration of an Upkeep
    console.log("Registering Upkeep...");
    const upkeepRegisterTx = await raffle.registerUpkeep(
      upkeepName,
      encryptedEmail,
      raffle.address,
      upkeepGasLimit,
      checkData,
      fundUpkeepAmount,
      source
    );
    await upkeepRegisterTx.wait(1);

    // Subscription for Chainlink VRF
    console.log("Funding Chainlink VRF subscription...");
    const fundSubscriptionTx = await raffle.fundVRFSubscription(fundVRFAmount);
    await fundSubscriptionTx.wait(1);

    // Contract verification on Etherscan
    if (process.env.ETHERSCAN_API_KEY) {
      await verify(raffle.address, raffleArgs);
    }
  }
  log("______________________________________________________");
};

module.exports.tags = ["all", "raffle"];
