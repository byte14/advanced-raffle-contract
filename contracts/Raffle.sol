// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import "@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol";
import "@chainlink/contracts/src/v0.8/interfaces/KeeperCompatibleInterface.sol";

error NotEnoughETH();
error TransferFailed();
error NotOpen();
error UpKeepNotNeeded(
    uint256 raffleState,
    uint256 numPlayers,
    uint256 timePassed
);

contract Raffle is VRFConsumerBaseV2, KeeperCompatibleInterface {
    enum RaffleState {
        OPEN,
        CALCULATING
    }

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
    RaffleState private s_raffleState;
    uint256 private s_lastTimestamp;
    uint256 private immutable i_interval;

    event EnterRaffle(address indexed player);
    event RequestedRaffleWinner(uint256 indexed requestId);
    event PickedWinner(address indexed winner);

    constructor(
        address vrfCoordinator,
        uint256 entryFee,
        bytes32 keyHash,
        uint64 subscriptionId,
        uint32 callbackGasLimit,
        uint256 interval
    ) VRFConsumerBaseV2(vrfCoordinator) {
        i_vrfCoordinator = VRFCoordinatorV2Interface(vrfCoordinator);
        i_owner = msg.sender;
        i_entryFee = entryFee;
        i_keyHash = keyHash;
        i_subscriptionId = subscriptionId;
        i_callbackGasLimit = callbackGasLimit;
        s_raffleState = RaffleState.OPEN;
        s_lastTimestamp = block.timestamp;
        i_interval = interval;
    }

    function enterRaffle() public payable {
        if (msg.value < i_entryFee) {
            revert NotEnoughETH();
        }

        if (s_raffleState != RaffleState.OPEN) {
            revert NotOpen();
        }
        s_players.push(payable(msg.sender));
        emit EnterRaffle(msg.sender);
    }

    function checkUpkeep(
        bytes memory /* checkData */
    )
        public
        view
        override
        returns (
            bool upKeepNeeded,
            bytes memory /* performData */
        )
    {
        bool isOpen = (RaffleState.OPEN == s_raffleState);
        bool hasPlayer = (s_players.length > 0);
        bool hasTimePassed = ((block.timestamp - s_lastTimestamp) > i_interval);
        upKeepNeeded = (isOpen && hasPlayer && hasTimePassed);
    }

    function performUpkeep(
        bytes calldata /* performData */
    ) external override {
        (bool upKeepNeeded, ) = checkUpkeep("");
        if (!upKeepNeeded) {
            revert UpKeepNotNeeded(
                uint256(s_raffleState),
                s_players.length,
                block.timestamp - s_lastTimestamp
            );
        }
        s_raffleState = RaffleState.CALCULATING;
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
        s_raffleState = RaffleState.OPEN;
        s_players = new address payable[](0);
        s_lastTimestamp = block.timestamp;
        (bool success, ) = s_winner.call{value: address(this).balance}("");
        if (!success) {
            revert TransferFailed();
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

    function getTotalPlayers() public view returns (address payable[] memory) {
        return s_players;
    }

    function getRecentWinner() public view returns (address) {
        return s_winner;
    }

    function getRaffleState() public view returns (RaffleState) {
        return s_raffleState;
    }

    function getNumberOfPlayers() public view returns (uint256) {
        return s_players.length;
    }

    function getLastTimestamp() public view returns (uint256) {
        return s_lastTimestamp;
    }

    function getInterval() public view returns (uint256) {
        return i_interval;
    }

    function getNumWords() public pure returns (uint256) {
        return NUM_WORDS;
    }

    function getRequestConfirmations() public pure returns (uint256) {
        return REUQUEST_CONFIRMATIONS;
    }
}
