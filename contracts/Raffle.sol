// SPDX-License-Identifier: MIT
pragma solidity ^0.8.8;

import "@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol";
import "@chainlink/contracts/src/v0.8/interfaces/KeeperCompatibleInterface.sol";
import "./SubscriptionManager.sol";

error NotEnoughETH();
error TransferFailed();
error NotOpen();
error UpKeepNotNeeded(
    uint256 raffleState,
    uint256 numPlayers,
    uint256 timePassed
);

/**@title A Raffle Contract
 * @author Avishek Raj Panta
 * @dev This implements the Chainlink VRF and Chainlink Keepers
 */
contract Raffle is
    VRFConsumerBaseV2,
    KeeperCompatibleInterface,
    SubscriptionManager
{
    // Type declaration
    enum RaffleState {
        OPEN,
        CLOSED
    }
    // State variables
    uint256 private immutable i_entryFee;
    bytes32 private immutable i_keyHash;
    uint32 private immutable i_callbackGasLimit;
    uint16 private constant REUQUEST_CONFIRMATIONS = 3;
    uint32 private constant NUM_WORDS = 1;
    address payable[] private s_players;
    address private s_winner;
    RaffleState private s_raffleState;
    uint256 private s_lastTimestamp;
    uint256 private immutable i_interval;

    // Events
    event EnterRaffle(address indexed player);
    event RequestedRaffleWinner(uint256 indexed requestId);
    event PickedWinner(address indexed winner);

    /**
     * @dev Set the values for i_entryFee, i_keyHash, i_callbackGasLimit
     * i_interval, s_raffleState, and s_lastTimestamp.
     * Adds this contract as a consumer for the VRF subscription.
     */
    constructor(
        address vrfCoordinator,
        address linkToken,
        uint256 entryFee,
        bytes32 keyHash,
        uint32 callbackGasLimit,
        uint256 interval,
        address registrar,
        address registry
    )
        VRFConsumerBaseV2(vrfCoordinator)
        SubscriptionManager(vrfCoordinator, linkToken, registrar, registry)
    {
        i_entryFee = entryFee;
        i_keyHash = keyHash;
        i_callbackGasLimit = callbackGasLimit;
        i_interval = interval;
        s_raffleState = RaffleState.OPEN;
        s_lastTimestamp = block.timestamp;
        addVRFConsumer(address(this));
    }

    /**
     * @dev Invoked by players to enter the raffle.
     * Must send ETH atleast equivalent to 'entryFee'
     * Raffle State needs to be open
     */
    function enterRaffle() external payable {
        if (msg.value < i_entryFee) {
            revert NotEnoughETH();
        }

        if (s_raffleState != RaffleState.OPEN) {
            revert NotOpen();
        }
        s_players.push(payable(msg.sender));
        emit EnterRaffle(msg.sender);
    }

    /**
     * @dev Invoked by Chainlink Keeper node to check 'UpkeepNeed' is true.
     * Raffle State must be open.
     * Must have Players entered in the Raffle.
     * The time interval must be passed.
     */

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

    /**
     * @dev If 'checkUpkeep' returns true, this function is invoked
     * and it submits the request for random winner to the VRF
     * coordinator contract.
     * VRF Subscription must be funded sufficiently.
     */

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
        s_raffleState = RaffleState.CLOSED;
        uint256 requestId = i_vrfCoordinator.requestRandomWords(
            i_keyHash,
            s_subscriptionId,
            REUQUEST_CONFIRMATIONS,
            i_callbackGasLimit,
            NUM_WORDS
        );
        emit RequestedRaffleWinner(requestId);
    }

    /**
     * @dev Invoked by Chainlink VRF node to receive
     * the random winner and send money to the winner
     * Resets the Raffle State, Players and Timestamp
     */
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

    // Getter functions
    function getEntryFee() external view returns (uint256) {
        return i_entryFee;
    }

    function getPlayer(uint256 _index) external view returns (address) {
        return s_players[_index];
    }

    function getTotalPlayers()
        external
        view
        returns (address payable[] memory)
    {
        return s_players;
    }

    function getRecentWinner() external view returns (address) {
        return s_winner;
    }

    function getRaffleState() external view returns (RaffleState) {
        return s_raffleState;
    }

    function getNumberOfPlayers() external view returns (uint256) {
        return s_players.length;
    }

    function getLastTimestamp() external view returns (uint256) {
        return s_lastTimestamp;
    }

    function getInterval() external view returns (uint256) {
        return i_interval;
    }

    function getNumWords() external pure returns (uint256) {
        return NUM_WORDS;
    }

    function getRequestConfirmations() external pure returns (uint256) {
        return REUQUEST_CONFIRMATIONS;
    }
}
