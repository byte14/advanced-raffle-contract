const { deployments, getNamedAccounts, ethers, network } = require("hardhat");
const { expect } = require("chai");
const { networkConfig } = require("../../helper-hardhat-config");
const helpers = require("@nomicfoundation/hardhat-network-helpers");

const chainId = network.config.chainId;
const ENTRY_FEE = networkConfig[chainId]["entryFee"];
const INTERVAL = networkConfig[chainId]["interval"];

chainId !== 31337
  ? describe.skip
  : describe("Raffle", function () {
      let raffle;
      let deployer;
      let vrfCoordinatorV2Mock;

      beforeEach(async function () {
        deployer = (await getNamedAccounts()).deployer;
        await deployments.fixture(["all"]);
        raffle = await ethers.getContract("Raffle", deployer);
        vrfCoordinatorV2Mock = await ethers.getContract(
          "VRFCoordinatorV2Mock",
          deployer
        );
      });

      describe("Constructor", async function () {
        it("initializes the raffle correctly", async function () {
          expect(await raffle.getOwner()).to.equal(deployer);
          expect(await raffle.getEntryFee()).to.equal(ENTRY_FEE);
          expect(await raffle.getRaffleState()).to.equal(0);
          expect(await raffle.getInterval()).to.equal(INTERVAL);
        });
      });

      describe("enterRaffle", async function () {
        it("reverts when you don't send enough ETH", async function () {
          await expect(raffle.enterRaffle()).to.be.revertedWithCustomError(
            raffle,
            "NotEnoughETH"
          );
        });

        it("adds player in the players array", async function () {
          await raffle.enterRaffle({ value: ENTRY_FEE });
          expect(await raffle.getPlayer(0)).to.equal(deployer);
        });

        it("emits 'EnterRaffle' event", async function () {
          await expect(raffle.enterRaffle({ value: ENTRY_FEE }))
            .to.emit(raffle, "EnterRaffle")
            .withArgs(deployer);
        });

        it("doesn't allow to enter when raffle state is in CALCULATING", async function () {
          await raffle.enterRaffle({ value: ENTRY_FEE });
          await helpers.time.increase(Number(INTERVAL) + 1);
          await helpers.mine();
          await raffle.performUpkeep([]);
          await expect(
            raffle.enterRaffle({ value: ENTRY_FEE })
          ).to.be.revertedWithCustomError(raffle, "NotOpen");
        });
      });
    });
