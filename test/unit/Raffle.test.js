const { deployments, getNamedAccounts, ethers, network } = require("hardhat");
const { expect } = require("chai");
const { networkConfig } = require("../../helper-hardhat-config");
const helpers = require("@nomicfoundation/hardhat-network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");

const chainId = network.config.chainId;
const ENTRY_FEE = networkConfig[chainId]["entryFee"];
const INTERVAL = Number(networkConfig[chainId]["interval"]);
const RAFFLE_STATE = {
  OPEN: 0,
  CALCULATING: 1,
  anyValue,
};

chainId !== 31337
  ? describe.skip
  : describe("Raffle Uint Test", function () {
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

      describe("constructor", function () {
        it("initializes the raffle correctly", async function () {
          expect(await raffle.getOwner()).to.equal(deployer);
          expect(await raffle.getEntryFee()).to.equal(ENTRY_FEE);
          expect(await raffle.getRaffleState()).to.equal(RAFFLE_STATE.OPEN);
          expect(await raffle.getInterval()).to.equal(INTERVAL);
        });
      });

      describe("enterRaffle", function () {
        it("reverts when you don't send enough ETH", async function () {
          await expect(raffle.enterRaffle()).to.be.revertedWithCustomError(
            raffle,
            "NotEnoughETH"
          );
        });

        it("doesn't allow to enter when raffle state is in CALCULATING", async function () {
          await raffle.enterRaffle({ value: ENTRY_FEE });
          await helpers.time.increase(INTERVAL);
          await raffle.performUpkeep("0x");
          await expect(
            raffle.enterRaffle({ value: ENTRY_FEE })
          ).to.be.revertedWithCustomError(raffle, "NotOpen");
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
      });

      describe("checkUpkeep", function () {
        it("returns false if raffle state isn't open", async function () {
          await raffle.enterRaffle({ value: ENTRY_FEE });
          await helpers.time.increase(INTERVAL);
          await raffle.performUpkeep("0x");
          const { upKeepNeeded } = await raffle.checkUpkeep("0x");
          expect(upKeepNeeded).to.be.false;
        });

        it("returns false if no people entered", async function () {
          await helpers.time.increase(INTERVAL);
          const { upKeepNeeded } = await raffle.checkUpkeep("0x");
          expect(upKeepNeeded).to.be.false;
        });

        it("returns false if enough time hasn't passed", async function () {
          await raffle.enterRaffle({ value: ENTRY_FEE });
          const { upKeepNeeded } = await raffle.checkUpkeep("0x");
          expect(upKeepNeeded).to.be.false;
        });

        it("returns true if enough time has passed, has players and is open", async function () {
          await raffle.enterRaffle({ value: ENTRY_FEE });
          await helpers.time.increase(INTERVAL);
          const { upKeepNeeded } = await raffle.checkUpkeep("0x");
          expect(upKeepNeeded).to.be.true;
        });
      });

      describe("performUpKeep", function () {
        it("it can only run if upKeeepNeeded is true", async function () {
          await raffle.enterRaffle({ value: ENTRY_FEE });
          await helpers.time.increase(INTERVAL);
          await expect(raffle.performUpkeep("0x")).not.to.be.reverted;
        });

        it("reverts when upKeepNeeded is false", async function () {
          const raffleBalance = await raffle.provider.getBalance(
            raffle.address
          );
          const raffleState = await raffle.getRaffleState();
          const players = await raffle.getTotalPlayers();
          await expect(raffle.performUpkeep("0x"))
            .to.be.revertedWithCustomError(raffle, "UpKeepNotNeeded")
            .withArgs(raffleState, players.length, anyValue);
        });

        it("updates the raffle state to calculating", async function () {
          await raffle.enterRaffle({ value: ENTRY_FEE });
          await helpers.time.increase(INTERVAL);
          await raffle.performUpkeep("0x");
          expect(await raffle.getRaffleState()).to.equal(
            RAFFLE_STATE.CALCULATING
          );
        });

        it("emits 'RequestedRaffleWinner' event", async function () {
          await raffle.enterRaffle({ value: ENTRY_FEE });
          await helpers.time.increase(INTERVAL);
          const txResponse = await raffle.performUpkeep("0x");
          const txReceipt = await txResponse.wait(1);
          const requestId = txReceipt.events[1].args.requestId;
          await expect(txResponse)
            .to.emit(raffle, "RequestedRaffleWinner")
            .withArgs(requestId);
        });
      });

      describe("fulfillRandomWords", function () {
        describe("success", function () {
          let requestId;
          beforeEach(async function () {
            const accounts = await ethers.getSigners();
            for (let i = 1; i <= 5; i++) {
              await raffle
                .connect(accounts[i])
                .enterRaffle({ value: ENTRY_FEE });
            }
            await helpers.time.increase(INTERVAL);
            const txResponse = await raffle.performUpkeep("0x");
            const txReceipt = await txResponse.wait(1);
            requestId = txReceipt.events[1].args.requestId;
          });

          it("updates the raffle state to open", async function () {
            await vrfCoordinatorV2Mock.fulfillRandomWords(
              requestId,
              raffle.address
            );
            expect(await raffle.getRaffleState()).to.equal(RAFFLE_STATE.OPEN);
          });

          it("reset the players array", async function () {
            await vrfCoordinatorV2Mock.fulfillRandomWords(
              requestId,
              raffle.address
            );
            const totalPlayers = await raffle.getTotalPlayers();
            expect(totalPlayers.length).to.equal(0);
          });

          it("updates the last timestamp with current", async function () {
            const startingTimestamp = await raffle.getLastTimestamp();
            await vrfCoordinatorV2Mock.fulfillRandomWords(
              requestId,
              raffle.address
            );
            expect(await raffle.getLastTimestamp()).to.be.greaterThan(
              startingTimestamp
            );
          });

          it("picks a winner and send all balance", async function () {
            const totalPlayers = await raffle.getTotalPlayers();
            for (let i = 0; i < totalPlayers.length; i++) {
              await helpers.setBalance(totalPlayers[i], 0);
            }
            await vrfCoordinatorV2Mock.fulfillRandomWords(
              requestId,
              raffle.address
            );
            const winner = await raffle.getRecentWinner();
            const winnerBalance = await raffle.provider.getBalance(winner);
            expect(winnerBalance).to.equal(ENTRY_FEE.mul(totalPlayers.length));
          });
        });

        describe("revert", function () {
          it("can only be called after performUpkeep", async function () {
            await raffle.enterRaffle({ value: ENTRY_FEE });
            await helpers.time.increase(INTERVAL);
            await expect(
              vrfCoordinatorV2Mock.fulfillRandomWords(0, raffle.address)
            ).to.be.revertedWith("nonexistent request");
            await expect(
              vrfCoordinatorV2Mock.fulfillRandomWords(1, raffle.address)
            ).to.be.revertedWith("nonexistent request");
          });
        });
      });
    });
