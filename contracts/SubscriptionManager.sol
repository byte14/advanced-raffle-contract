// SPDX-License-Identifier: MIT
pragma solidity ^0.8.8;

import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import "@chainlink/contracts/src/v0.8/interfaces/KeeperRegistryInterface.sol";
import "@chainlink/contracts/src/v0.8/interfaces/LinkTokenInterface.sol";

interface KeeperRegistrarInterface {
    function register(
        string memory name,
        bytes calldata encryptedEmail,
        address upkeepContract,
        uint32 gasLimit,
        address adminAddress,
        bytes calldata checkData,
        uint96 amount,
        uint8 source,
        address sender
    ) external;
}

contract SubscriptionManager {
    VRFCoordinatorV2Interface internal immutable i_vrfCoordinator;
    LinkTokenInterface private immutable i_link;
    KeeperRegistryInterface private immutable i_registry;
    address private immutable i_registrar;
    address private immutable i_owner;
    bytes4 private constant REGISTER_SIG =
        KeeperRegistrarInterface.register.selector;
    uint256 private s_upkeepId;
    uint64 internal s_subscriptionId;

    modifier onlyOwner() {
        require(msg.sender == i_owner);
        _;
    }

    constructor(
        address vrfCoordinator,
        address link,
        address registrar,
        address registry
    ) {
        i_vrfCoordinator = VRFCoordinatorV2Interface(vrfCoordinator);
        i_link = LinkTokenInterface(link);
        i_registrar = registrar;
        i_registry = KeeperRegistryInterface(registry);
        i_owner = msg.sender;
        createVRFSubscription();
    }

    function depositLink(uint256 value) external {
        i_link.transferFrom(msg.sender, address(this), value);
    }

    function withdrawLink(uint256 value) external onlyOwner {
        i_link.transfer(msg.sender, value);
    }

    function createVRFSubscription() public onlyOwner {
        s_subscriptionId = i_vrfCoordinator.createSubscription();
    }

    function fundVRFSubscription(uint256 value) external {
        i_link.transferAndCall(
            address(i_vrfCoordinator),
            value,
            abi.encode(s_subscriptionId)
        );
    }

    function addVRFConsumer(address consumerAddress) public onlyOwner {
        i_vrfCoordinator.addConsumer(s_subscriptionId, consumerAddress);
    }

    function cancelVRFSubscription() external onlyOwner {
        i_vrfCoordinator.cancelSubscription(s_subscriptionId, i_owner);
        s_subscriptionId = 0;
    }

    function registerUpkeep(
        string memory name,
        bytes calldata encryptedEmail,
        address upkeepContract,
        uint32 gasLimit,
        bytes calldata checkData,
        uint96 amount,
        uint8 source
    ) external onlyOwner {
        (State memory state, Config memory _c, address[] memory _k) = i_registry
            .getState();
        uint256 oldNonce = state.nonce;
        bytes memory payload = abi.encode(
            name,
            encryptedEmail,
            upkeepContract,
            gasLimit,
            msg.sender,
            checkData,
            amount,
            source,
            address(this)
        );

        i_link.transferAndCall(
            i_registrar,
            amount,
            bytes.concat(REGISTER_SIG, payload)
        );
        (state, _c, _k) = i_registry.getState();
        uint256 newNonce = state.nonce;
        if (newNonce == oldNonce + 1) {
            s_upkeepId = uint256(
                keccak256(
                    abi.encodePacked(
                        blockhash(block.number - 1),
                        address(i_registry),
                        uint32(oldNonce)
                    )
                )
            );
        } else {
            revert("auto-approve disabled");
        }
    }

    function getOwner() external view returns (address) {
        return i_owner;
    }

    function getUpkeepId() external view returns (uint256) {
        return s_upkeepId;
    }

    function getSubscriptionId() external view returns (uint64) {
        return s_subscriptionId;
    }

    function getVRFSubscriptionBalance() external view returns (uint256) {
        (uint256 balance, , , ) = i_vrfCoordinator.getSubscription(
            s_subscriptionId
        );
        return balance;
    }
}
