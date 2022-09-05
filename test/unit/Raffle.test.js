const { deployments, getNamedAccounts, ethers, network } = require("hardhat");
const { expect } = require("chai");
const { networkConfig } = require("../../helper-hardhat-config");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const helpers = require("@nomicfoundation/hardhat-network-helpers");

network.config.chainId !== 31337
  ? describe.skip
  : describe("Raffle Uint Test", function () {
      let deployer;
      let raffle;
      let vrfCoordinatorV2Mock;
      const entryFee = networkConfig[network.config.chainId]["entryFee"];
      const interval = networkConfig[network.config.chainId]["interval"];
      const raffleState = {
        opened: 0,
        closed: 1,
      };
      const linkAmount = ethers.utils.parseEther("10");

      beforeEach(async function () {
        deployer = (await getNamedAccounts()).deployer;
        await deployments.fixture(["all"]);
        raffle = await ethers.getContract("Raffle", deployer);
        vrfCoordinatorV2Mock = await ethers.getContract(
          "VRFCoordinatorV2Mock",
          deployer
        );
        linkToken = await ethers.getContract("LinkToken", deployer);
      });

      describe("constructor", function () {
        it("initializes the raffle correctly", async function () {
          expect(await raffle.getOwner()).to.equal(deployer);
          expect(await raffle.getEntryFee()).to.equal(entryFee);
          expect(await raffle.getRaffleState()).to.equal(raffleState.opened);
          expect(await raffle.getInterval()).to.equal(interval);
        });
      });

      describe("depositLink", function () {
        it("deposits link token into the contract", async function () {
          await linkToken.approve(raffle.address, linkAmount);
          await raffle.depositLink(linkAmount);
          const raffleLinkBalance = await linkToken.balanceOf(raffle.address);
          expect(raffleLinkBalance).to.equal(linkAmount);
        });
      });

      describe("withdrawLink", function () {
        it("withdraws link token to the owner", async function () {
          await linkToken.approve(raffle.address, linkAmount);
          await raffle.depositLink(linkAmount);
          const deployerStartingBalance = await linkToken.balanceOf(deployer);
          await raffle.withdrawLink(linkAmount);
          const deployerEndingBalance = await linkToken.balanceOf(deployer);
          expect(await linkToken.balanceOf(raffle.address)).to.equal(0);
          expect(deployerEndingBalance).to.equal(
            deployerStartingBalance.add(linkAmount)
          );
        });
      });

      describe("enterRaffle", function () {
        it("reverts when you don't send enough ETH", async function () {
          await expect(raffle.enterRaffle()).to.be.revertedWithCustomError(
            raffle,
            "NotEnoughETH"
          );
        });

        it("doesn't allow to enter when raffle state is closed", async function () {
          await raffle.enterRaffle({ value: entryFee });
          await helpers.time.increase(interval);
          await raffle.performUpkeep("0x");
          await expect(
            raffle.enterRaffle({ value: entryFee })
          ).to.be.revertedWithCustomError(raffle, "NotOpen");
        });

        it("adds player in the players array", async function () {
          await raffle.enterRaffle({ value: entryFee });
          expect(await raffle.getPlayer(0)).to.equal(deployer);
        });

        it("emits 'EnterRaffle' event", async function () {
          await expect(raffle.enterRaffle({ value: entryFee }))
            .to.emit(raffle, "EnterRaffle")
            .withArgs(deployer);
        });
      });

      describe("checkUpkeep", function () {
        it("returns false if raffle state isn't open", async function () {
          await raffle.enterRaffle({ value: entryFee });
          await helpers.time.increase(interval);
          await raffle.performUpkeep("0x");
          const { upKeepNeeded } = await raffle.checkUpkeep("0x");
          expect(upKeepNeeded).to.be.false;
        });

        it("returns false if no people entered", async function () {
          await helpers.time.increase(interval);
          const { upKeepNeeded } = await raffle.checkUpkeep("0x");
          expect(upKeepNeeded).to.be.false;
        });

        it("returns false if enough time hasn't passed", async function () {
          await raffle.enterRaffle({ value: entryFee });
          const { upKeepNeeded } = await raffle.checkUpkeep("0x");
          expect(upKeepNeeded).to.be.false;
        });

        it("returns true if enough time has passed, has players and is open", async function () {
          await raffle.enterRaffle({ value: entryFee });
          await helpers.time.increase(interval);
          const { upKeepNeeded } = await raffle.checkUpkeep("0x");
          expect(upKeepNeeded).to.be.true;
        });
      });

      describe("performUpKeep", function () {
        describe("success", function () {
          beforeEach(async function () {
            await raffle.enterRaffle({ value: entryFee });
            await helpers.time.increase(interval);
          });

          it("can only run if upKeeepNeeded is true", async function () {
            await expect(raffle.performUpkeep("0x")).not.to.be.reverted;
          });

          it("updates the raffle state to closed", async function () {
            await raffle.performUpkeep("0x");
            expect(await raffle.getRaffleState()).to.equal(raffleState.closed);
          });

          it("emits 'RequestedRaffleWinner' event", async function () {
            const txResponse = await raffle.performUpkeep("0x");
            const txReceipt = await txResponse.wait(1);
            const requestId = txReceipt.events[1].args.requestId;
            await expect(txResponse)
              .to.emit(raffle, "RequestedRaffleWinner")
              .withArgs(requestId);
          });
        });

        describe("revert", function () {
          it("reverts when upKeepNeeded is false", async function () {
            const rState = await raffle.getRaffleState();
            const players = await raffle.getTotalPlayers();
            await expect(raffle.performUpkeep("0x"))
              .to.be.revertedWithCustomError(raffle, "UpKeepNotNeeded")
              .withArgs(rState, players.length, anyValue);
          });
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
                .enterRaffle({ value: entryFee });
            }
            await helpers.time.increase(interval);
            const txResponse = await raffle.performUpkeep("0x");
            const txReceipt = await txResponse.wait(1);
            requestId = txReceipt.events[1].args.requestId;
          });

          it("updates the raffle state to open", async function () {
            await vrfCoordinatorV2Mock.fulfillRandomWords(
              requestId,
              raffle.address
            );
            expect(await raffle.getRaffleState()).to.equal(raffleState.opened);
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
            const endingTimestamp = await raffle.getLastTimestamp();
            expect(endingTimestamp).to.be.greaterThan(startingTimestamp);
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
            expect(winnerBalance).to.equal(entryFee.mul(totalPlayers.length));
          });
        });

        describe("revert", function () {
          it("can only be called after performUpkeep", async function () {
            await raffle.enterRaffle({ value: entryFee });
            await helpers.time.increase(interval);
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
