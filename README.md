# Raffle Contract

## Table of Contents

- [About The Project](#about-the-project)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
- [Usage](#usage)
- [Deployment to a testet](#deployment-to-a-testet)
- [Estimate gas cost in USD](#estimate-gas-cost-in-usd)
- [Verify on etherscan](#verify-on-etherscan)
- [Scripts for interacting with contract on testnet](#scripts-for-interacting-with-contract-on-testnet)

## About The Project

This is an advanced Raffle Smart Contract which uses Chainlink Keepers for automatically kicking off Chainlink VRF to generate a random winner after the given time interval has passed. It allows dynamic subscription of Chainlink Keepers Upkeep and Chainlink VRF.

### Built With

- ![Solidity]
- ![Ethers]
- ![Hardhat]
- ![Chainlink]

## Getting Started

### Prerequisites

- [git](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git)
  - You'll know you did it right if you can run `git --version` and you see a response like `git version x.x.x`
- [Nodejs](https://nodejs.org/en/)
  - You'll know you've installed nodejs right if you can run:
    - `node --version` and get an ouput like: `vx.x.x`
- [Yarn](https://yarnpkg.com/getting-started/install) instead of `npm`
  - You'll know you've installed yarn right if you can run:
    - `yarn --version` and get an output like: `x.x.x`
    - You might need to [install it with `npm`](https://classic.yarnpkg.com/lang/en/docs/install/) or `corepack`

### Installation

1. Clone the repo

   ```
   git clone https://github.com/github_username/repo_name.git
   ```

2. Change the current working directory

   ```
   cd raffle-contract
   ```

3. Install yarn packages
   ```
   yarn install
   ```

## Usage

**Deploy:**

```
yarn hardhat deploy
```

**Testing:**

```
yarn hardhat test
```

**Test Coverage:**

```
yarn hardhat coverage
```

## Deployment to a testet

**1. Setup environment variabltes**

You'll want to set your `GOERLI_RPC_URL` and `PRIVATE_KEY` as environment variables. You can add them to a `.env` file.

- `PRIVATE_KEY`: The private key of your account (like from [metamask](https://metamask.io/)).
- `GOERLI_RPC_URL`: This is url of the goerli testnet node you're working with. You can get setup with one for free from [Alchemy](https://alchemy.com/)

**2. Get testnet ETH and LINK**

Head over to [faucets.chain.link](https://faucets.chain.link/) and get some tesnet ETH & LINK. You should see the ETH and LINK show up in your metamask.

**3. Deploy to goerli testnet**

Now you can run:

```
yarn hardhat deploy --network goerli
```

**NOTE:** You don't need to setup a Chainlink VRF Subscription and Chainlink Keepers Upkeep.
This will be automatically done when you deploy the contract. Your Upkeep will be funded with 5 LINK and VRF subscription with 2 LINK. You can fund with different amount by changing value of `fundUpkeepAmount` and `fundVRFAmount` in your `helper-hardhat-config.js`.

**4. Enter the raffle**

Your contract is now setup and you can enter the lottery by running:

```
yarn hardhat run scripts/enterRaffle.js --network goerli
```

## Estimate gas cost in USD

To get a USD estimation of gas cost, you'll need a `COINMARKETCAP_API_KEY` environment variable and add it into your `.env` file. You can get one for free from [CoinMarketCap](https://pro.coinmarketcap.com/signup).

## Verify on etherscan

If you deploy to a testnet or mainnet, you can verify it if you get an [API Key](https://etherscan.io/myapikey) from Etherscan and set it as an environemnt variable named `ETHERSCAN_API_KEY`. You can add it into your `.env` file.

In it's current state, if you have your api key set, it will auto verify goerli contracts.

However, you can manual verify with:

```
yarn hardhat verify --network goerli --constructor-args arguments.js DEPLOYED_CONTRACT_ADDRESS
```

Check out [hardhat-etherscan](https://hardhat.org/hardhat-runner/plugins/nomiclabs-hardhat-etherscan) for reference.

## Scripts for interacting with contract on testnet

**Enter Raffle:**

```
yarn hardhat run scripts/enterRaffle.js --network goerli
```

**Deposit Link into the contract:**

```
yarn hardhat run scripts/depositLink.js --network goerli
```

**Withdraw Link from the contract:**

```
yarn hardhat run scripts/withdrawLink.js --network goerli
```

**Register Chainlink Keepers Upkeep:**

```
yarn hardhat run scripts/registerUpkeep.js --network goerli
```

**Create Chainlink VRF subscription:**

```
yarn hardhat run scripts/createVRFSubscription.js --network goerli
```

**Fund Chainlink VRF subscription:**

```
yarn hardhat run scripts/fundVRFSubscription.js --network goerli
```

**Add consumer for Chainlink VRF subscription:**

```
yarn hardhat run scripts/addVRFConsumer.js --network goerli
```

**Get Chainlink VRF subscription balance:**

```
yarn hardhat run scripts/getVRFSubscriptionBalance.js --network goerli
```

**Cancel Chainlink VRF subscription:**

```
yarn hardhat run scripts/cancelVRFSubscription.js --network goerli
```

[solidity]: https://img.shields.io/badge/Solidity-%23363636.svg?style=for-the-badge&logo=solidity&logoColor=white
[chainlink]: https://img.shields.io/badge/chainlink-375BD2?style=for-the-badge&logo=chainlink&logoColor=white
[hardhat]: https://img.shields.io/badge/Hardhat-yellow?style=for-the-badge&logo=data%3Aimage%2Fpng%3Bbase64%2CiVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAF8klEQVR42u1YA5BzWRM9Y%2F7%2F7n62bdu2Cmvbtm3bKq5t22PbiDnRS2%2F3zqt8qdS8zCTDqkpXnbo3T%2Fec27cxg5jFLGYxi9mAMiIkkh0jyIoZZMJCMmMRGTCLHBhF%2BUgeqKTTyYJjmPQLPP7DKGfitTw2qJB5BV%2FL4fF1fu4Unh81MMhbMIjxC4MiRD45MXYgkL%2BEYY5CgI3MuF6%2B0S9HRjHiHL8R%2BX4zLEzCH4UAP8NCVuSxkHPlm71PvAwpZMAqnw4%2FKXooikGI9AgUxk8sZhURUtAb5qzDaG8r7mTyBh5J4DfK4j0KA4u4k%2FQYjZ40asFwbzPe9zTD42kCCbwtnRMy1sSRrTEpUhEexgdkx%2FCeIa%2FDKFcDfnI3gILh04Un4tGDLjkvmZ56dA75jHHReONnqR3ojrnqMMVVj694pGCIAL8pPIFvP46ncWPT6LjjtlP2L0OiO1JmfM3jlGh3%2Fn9ttXiR4WNQMNyNLMCsvbClPo5OOT6ZMjLSac%2B%2BvXTfXYvI0ZwYjQifYsZLwgWRWlsNTmqrhodBofA2h1%2F483fjadBR6ZSenk679%2B6lg4d2018%2FDIvWCx6fHqcgErOVYZazCo2OSlAo%2BHrY82%2BoiqPlS1KFfECA4Pzz15O1PjliAeJpRY8mtwGzu9yMOarwjqMCZGc4QiACwuX%2Fay9LCpAPFiB44elZUXnB1wrJeu8RIQmdGZPezB7Q2ctBHYEFaJ7%2F376Jp4kT0jQFnHDCNir666ioBHgaoeNsuLXTSmsvw4O2EijWUpC1hMGjLQjOmo4XcbaALj0%2FiTIz0zUF7N2%2Fh55%2BbA65dQkRCeAjJNlPcdXi4bCV2lGMUUz%2BH2sxSAuueo1dMoJ%2B%2BCyelixK1RRw3rnrKfe3waSY4iITYARxUiFnLbKlI4CWMcHVlkJ4LUUgLbibtIPN2gCuvKCbrk6iiePTAmn0eD46rzw3g72UKOmUn408kPnoCnzWSqyFlpkKcZu5ABQO3lZtD3z%2FSTw9%2FVAi1RXF0Y%2FsjZOPS6Z7uQbk8a63VqbRB29OpJxfI%2FcAg8mriaQSd0DLzPn4jkHhoOi1F3Gwd049IZlWLk%2FlWpAQ6IWkBlx04Tp64J6F5GpVz3%2BkAqpB9jJGOX7QSp9xTNBoYpLa6LyF0HMdmD0zlQYNSqerL02i55%2BaxYVsF51xxiayqHUgKgE1gURiplsQj1CzFGCQKRcUFnldW%2ByL9xJowvi0QBAff%2Fw2%2BuvHoVGTVz0QSCSNJRiCUNNlY5qRSWoiAgEuHehGDuT%2F%2Fz%2Bd9h3YQy8%2FN5M8hvhuC7AUtkOfixkINePfmGfMAYVFbpcX5F2KozUrU%2Bnii9aSvjpVrnULjqrDcWjMw7yOBWSDBIYgGBmmXHlR1Ee26M9fxFPBn4Nk3m1whxA4ysZCzOlQgCGrfZelAovLpO%2BXtOnTS%2F8jiDx%2FM3pEgLNG3f1s5hd8hOhbJMp%2F0HwGPKd2mQMasplkxjPCWbiDDBjDF3LD7qJJXuo9Uhpr%2BsnM0HqOOQt38GQSX2hQL5J4wVUvQSONXKCF8HP%2BVatw74LbZjnCfqk5XPn9nDYVrsCKNHPMTQkS1SDcQSZM8LSg2l4JMheqBSvvMMx58AenUhHnN%2FXCrpvk22ryyGqH%2Fp8O5jmQzVS4J6sW7qB8ZJqLcAUHyB8swKX2PIHKGyzEpIqwlbX%2FXewziNe6d1QkMbgapE3gjQoiL%2BDffkHINRePfzCfK4Q7xIiQpCvESHMuFpsKcSkLeotTZjUfHd9%2FglR3qmK4JqjC5HqhHLGugY%2BDP3jO3wx8L4hoKBRjFqrZM28Z%2FmZuf2Ox7i%2BMzO%2FsX%2FVEiJP2wlqElUz0ZF7oFl7wJRbzOc%2BzeNFiRjkvXMUfr%2BWFGnihRp4367PQyr91AqM6l2uMFr7fJM%2FKO3yviq%2BV8%2B9inmfxtz7n%2BUuMW%2Fj6yYZcrBQOwgU9adJMtbL77HkYbs7BREM%2BZvG4iHdoRevfWMttyUY%2Bs5sZW1RslmtGvifPyLPqOxPlG9SMDPkmYhazmMUsZn1t%2FwIh4A6mR358%2FAAAAABJRU5ErkJggg%3D%3D
[ethers]: https://img.shields.io/badge/ethers.js-2535a0?style=for-the-badge&logo=data%3Aimage%2Fpng%3Bbase64%2CiVBORw0KGgoAAAANSUhEUgAAAGQAAAA6CAYAAABGZvzTAAAABmJLR0QA%2FwD%2FAP%2BgvaeTAAAGZElEQVR4nO2cW4xdVRnHf2taClSLUC6lqLWUWynGgA8GaYAGRQQvQHkBDA8QwiWN4oMJTXwh0cgDCSH4gBED6JMBFBKhhACpEkIJQoDSluu0iAKl0HZoSS9MZ34%2BrD1wOumctc8%2Ba599ZjK%2FZOdMutf51v%2Fba591%2Bda3CtNMM800k4bQtIAU6gCwDPgecDawAJgH7AO2A%2B8ATwNPAv8KIdiI0KmOOlu9SR20PK%2BpN6gzm9Y%2FpVDPUd%2FooCHG84r6nab9mPSoA%2Brt6mgXjTHGsHpd0z5NWoxd1EMZGmI8v23at0mHOkN9uIbGGONXTfs4qVDvqrExVEfUi5v2swyNT3vVq4C%2FJIqNAs8CjwEvAYPAHOAw4DzgEuCbCRtDwJIQwgddCZ7KqPPVrW3e7FH1z%2BrJCTtBXW6c9rbjgV75NilRH2zz8D5Wf9ChvdnqvYlGubAufyY16ulOPL39SF3She1ft2mQNTn9mDKof2vz0H6Uwf6tbewvy%2BBCLfRkUFcXAWcBi4GvEgfk5RPUf28I4ZoMdQ4Aq4FzDnD7eWAVcDRwUPFv24FNxEnDiyGEkW419BXGAfsW9a02b%2Bp4htWvZ9SwSN3VQf1jDKl3q9%2FOpaUx1MPVO9U9FR7E%2FTXo6WaNM6r%2BVT02t66eoJ6vbu7iAVxZg6ZTutAzxmb13NzaakX9pXFF3A0LatL2dtdNorvVH9ahr5Us%2BwbqSuDWil%2FfDvwX%2BE%2FxWQf%2FAM4FtgIDwFzgRODLHdg4BHhAXRpCWJtfYibUn9lZuHxYXaVeY2IFXrPuGeqp6gr1xQ70r1MPbkp3W9ST1J0lHdmn%2FkH9RtO6x2MMvVymfljSl5VNaz4g6uMlHXjTSbCDZ5yqbyjhz1a1k%2B6ufowzqjI8q85tWm9Z1OOMoZsU1zatdT8s9%2Bt4VT28aa2dol5ewrenmtb5OerXTE9xd6uLm9ZaBePefiqUv1f9Uu66Byp%2B7%2BIS370zhPB6RfuNEkIYBe5JFJsFnJ677qoNcqCAXStDwO8q2u4XnihR5pTclVZtkG8l7t8fQvikou1%2BYS0wnCiTfXzsuEHUAByfKPZgNTnVMIbas1J0W%2B8lijXfIMQQQruVqsC%2Fq8mpzKKa7G5J3O%2BLQX1W4v5ICGGoipguSHWhdZHdzyoNsitxf6Y6u4qYLjitJrup1XiqS%2BuYjhskhDAM7E4U6%2FVi8CQ19cutQmo7YF3uCqsOhh8n7vc6gLiZmDCXDWMkut0vZCfwcs46oXqDvJG4f0JFu1VZC1yV2eaPE%2FcfDyF8lrnOyg2SWoH3OjngKeAyNTUdL4XxwE8qePinHHVlQb0yEed5rgFNq9VHM9lakfDvhWI91h%2Bo82y%2FS7jPHmdqGHN7tctECfUMdUcb30bUs3Ppzoa6JvEWreixnmDce9ljhznBLTbOV7cl%2FLott%2FYsqFcnhK%2B3xz9r9WT1U2NyXOnjbOqJ6n2mcwMetV8PlBozzVN70Msb0HWR%2BllR%2F2r1AvWglvszjLuC56kr1actl770iHpor%2F3pCPXGhBOb7P2qHfVC9x8Hdhm7om3G8a0T9qo3W0MAMzvqTNMpNHc3pO0E9ckOH%2F54nlHPaEJ%2FZYz9b7tZierPG9S3VH3M8lmVu42ngZc2oTfLoGs8lfQwE0eCBW4KIfw%2BR31VMGa%2BLCNmMC4AjiQeixgiBgnfJR5feCaEkIrV9T%2FqpaYz3v9ovw%2BMmVEPVher31WXGBNEDnOCMSnrtFQ9E%2Fg7ML9NsUHgFyGEVTnrbhL1aOIm2dg1C9hRXFuAV0II75SxlX2doB4D3AFckSi6BrgNeKQI6fct6hxgYXEd3%2FL3AuKR7UHiyauXgJdDCB9Vrau2hZv6feA3wJmJoluAh4j99z9DCB%2FWpWkijPlVC9n%2FYbdeRxL%2FG6j1xD2Q9cW1IYSwJ6eW2lfSRcNcD%2FyU9PYvwAbir2cj8czfRmBTCCG1v91a5wBwRHHNbfmcBxwHHFt8zi%2BuI1q%2B%2FgHxoa8rtLxKfPA7y9bfDT0LbahHEfcYfkLcTKqyq7iHuFu5A9gLjPBFwsWhxASMAeArCTufEBt6sLg2ErcU1oUQtlXQlY1GQsjFG3wqsTs7rbgWEt%2FWOV2a%2FxT4H%2FFNf6%2Fl833i1HYwhJDa8WyM%2FonpF6iHAEcRu5d5TJxqs4svZjI7iSexdky548zTTDPNNP3L%2FwGTnK6sO%2BBBWAAAAABJRU5ErkJggg%3D%3D
