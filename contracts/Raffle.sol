// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

error Raffle__NotEnoughETH();

contract Raffle {
    address private immutable i_owner;
    uint256 private immutable i_entryFee;
    address payable[] public players;

    event EnterRaffle(address indexed player);

    constructor(uint256 _entryFee) {
        i_owner = msg.sender;
        i_entryFee = _entryFee;
    }

    function enterRaffle() public payable {
        if (msg.value >= i_entryFee) {
            revert Raffle__NotEnoughETH();
        }
        players.push(payable(msg.sender));
        emit EnterRaffle(msg.sender);
    }

    function pickRandomWinner() external {}

    function getOwner() public view returns (address) {
        return i_owner;
    }

    function getEntryFee() public view returns (uint256) {
        return i_entryFee;
    }

    function getPlayer(uint256 _index) public view returns (address) {
        return players[_index];
    }
}
