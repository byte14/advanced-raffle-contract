// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import "@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol";

error Raffle__NotEnoughETH();
error Raffle__TransferFailed();

contract Raffle is VRFConsumerBaseV2 {
    address private immutable i_owner;
    uint256 private immutable i_entryFee;
    VRFCoordinatorV2Interface private immutable i_vrfCoordinator;
    bytes32 private immutable i_keyHash;
    uint64 private immutable i_subscriptionId;
    uint32 private immutable i_callbackGasLimit;
    uint16 private constant REUQUEST_CONFIRMATIONS = 3;
    uint32 private constant NUM_WORDS = 1;
    address payable[] private s_players;

    address private s_winner;

    event EnterRaffle(address indexed player);
    event RequestedRaffleWinner(uint256 indexed requestId);
    event PickedWinner(address indexed winner);

    constructor(
        address vrfCoordinator,
        uint256 entryFee,
        bytes32 keyHash,
        uint64 subscriptionId,
        uint32 callbackGasLimit
    ) VRFConsumerBaseV2(vrfCoordinator) {
        i_vrfCoordinator = VRFCoordinatorV2Interface(vrfCoordinator);
        i_owner = msg.sender;
        i_entryFee = entryFee;
        i_keyHash = keyHash;
        i_subscriptionId = subscriptionId;
        i_callbackGasLimit = callbackGasLimit;
    }

    function enterRaffle() public payable {
        if (msg.value >= i_entryFee) {
            revert Raffle__NotEnoughETH();
        }
        s_players.push(payable(msg.sender));
        emit EnterRaffle(msg.sender);
    }

    function requestRandomWinner() external {
        uint256 requestId = i_vrfCoordinator.requestRandomWords(
            i_keyHash,
            i_subscriptionId,
            REUQUEST_CONFIRMATIONS,
            i_callbackGasLimit,
            NUM_WORDS
        );
        emit RequestedRaffleWinner(requestId);
    }

    function fulfillRandomWords(uint256, uint256[] memory randomWords)
        internal
        override
    {
        uint256 winnerIndex = randomWords[0] % s_players.length;
        s_winner = s_players[winnerIndex];
        (bool success, ) = s_winner.call{value: address(this).balance}("");
        if (!success) {
            revert Raffle__TransferFailed();
        }
        emit PickedWinner(s_winner);
    }

    function getOwner() public view returns (address) {
        return i_owner;
    }

    function getEntryFee() public view returns (uint256) {
        return i_entryFee;
    }

    function getPlayer(uint256 _index) public view returns (address) {
        return s_players[_index];
    }

    function getRecentWinner() public view returns (address) {
        return s_winner;
    }
}
