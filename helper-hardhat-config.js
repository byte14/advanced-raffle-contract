const { ethers } = require("hardhat");

const networkConfig = {
  5: {
    name: "goerli",
    vrfCoordinatorV2: "0x2Ca8E0C643bDe4C2E08ab1fA0da3401AdAD7734D",
    linkToken: "0x326C977E6efc84E512bB9C30f76E30c160eD06FB",
    entryFee: ethers.utils.parseEther("0.01"),
    keyHash:
      "0x79d3d8832d904592c0bf9818b621522c988bb8b0c05cdc3b15aea1b6e8db0c15",
    callbackGasLimit: "300000",
    interval: 30,
    fundVRFAmount: ethers.utils.parseEther("2"),
    registry: "0x02777053d6764996e594c3E88AF1D58D5363a2e6",
    registrar: "0x9806cf6fBc89aBF286e8140C42174B94836e36F2",
    upkeepName: "Raffle Upkeep",
    encryptedEmail: "0x",
    checkData: "0x",
    fundUpkeepAmount: ethers.utils.parseEther("5"),
    source: 0,
  },
  31337: {
    name: "hardhat",
    entryFee: ethers.utils.parseEther("0.01"),
    keyHash:
      "0x79d3d8832d904592c0bf9818b621522c988bb8b0c05cdc3b15aea1b6e8db0c15",
    callbackGasLimit: "e00000",
    interval: 30,
    fundVRFAmount: ethers.utils.parseEther("2"),
    registry: "0x02777053d6764996e594c3E88AF1D58D5363a2e6",
    registrar: "0x9806cf6fBc89aBF286e8140C42174B94836e36F2",
  },
};

module.exports = { networkConfig };
