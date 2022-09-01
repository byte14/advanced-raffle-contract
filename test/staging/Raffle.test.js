const { expect } = require("chai");
const { getNamedAccounts, ethers, network } = require("hardhat");

network.config.chainId === 31337
  ? describe.skip
  : describe("Raffle Staging Test", function () {
      let deployer;
      let raffle;
      const raffleState = {
        opened: 0,
        closed: 1,
      };
      beforeEach(async function () {
        deployer = (await getNamedAccounts()).deployer;
        raffle = await ethers.getContract("Raffle", deployer);
        entryFee = await raffle.getEntryFee();
        interval = await raffle.getInterval();
      });

      it("works with live Chainlink keepers and Chainlink VRF", async function () {
        const startingTimestamp = await raffle.getLastTimestamp();

        await new Promise(async function (resolve, reject) {
          raffle.once("PickedWinner", async function () {
            console.log("PickedWinner event is fired!");
            try {
              const rState = await raffle.getRaffleState();
              const totalPlayers = await raffle.getTotalPlayers();
              const endingTimestamp = await raffle.getLastTimestamp();
              const winnerEndingBalace = await raffle.provider.getBalance(
                deployer
              );
              console.log(
                rState,
                totalPlayers.length,
                startingTimestamp.toString(),
                endingTimestamp.toString(),
                winnerEndingBalace.toString()
              );

              expect(rState).to.equal(raffleState.opened);
              expect(totalPlayers.length).to.equal(0);
              expect(endingTimestamp).to.be.greaterThan(startingTimestamp);
              expect(winnerEndingBalace).to.equal(
                winnerStartingBalance.add(entryFee)
              );
              resolve();
            } catch (error) {
              console.log(error);
              reject(error);
            }
          });
          console.log("Entering Raffle...");
          const txResponse = await raffle.enterRaffle({ value: entryFee });
          await txResponse.wait(1);
          const winnerStartingBalance = await raffle.provider.getBalance(
            deployer
          );
          console.log(
            "Waiting for Chainlink Keepers to call performUPkeep which triggers Chainlink VRF..."
          );
        });
      });
    });
