// SPDX-License-Identifier: MIT
// Compatible with OpenZeppelin Contracts ^5.0.0
pragma solidity >=0.8.20;

import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
import "@openzeppelin/contracts/utils/math/Math.sol";
/**
 * @title WrappedPAC (WPAC)
 * @notice Wrapped PAC (WPAC) token contract for bridging PAC coins between EVM blockchains and Pactus blockchain.
 * @author Wrapto <support@wrapto.app>
 * @custom:developer Wrapto <support@wrapto.app>
 * @custom:contact https://wrapto.app
 * @custom:version 0.0.2
 * @custom:license MIT
 */
contract WrappedPAC is Initializable, OwnableUpgradeable, PausableUpgradeable, ERC20Upgradeable, UUPSUpgradeable {
	/**
	 * @notice Struct to store details of a bridge event
	 * @dev Stores the details when tokens are bridged from EVM chain to Pactus blockchain
	 */
	struct BridgeEvent {
		address sender; // Address of the sender
		uint256 amount; // Amount of WPAC tokens bridged (in smallest unit, 9 decimals)
		string pactus; // Pactus blockchain address that will receive the coins
	}

	/**
	 * @notice Mapping to store bridge events by a unique identifier (counter)
	 * @dev The mapping is used to store the bridge events by a unique identifier (counter).
	 */
	mapping(uint256 => BridgeEvent) public bridged;

	/**
	 * @notice Counter for tracking bridge events
	 * @dev The counter is used to track the number of bridge events.
	 */
	uint256 public counter;

	/**
	 * @notice MINTER is the address that can mint new tokens.
	 * @dev The MINTER is the address that can mint new tokens.
	 */
	address public MINTER;

	/**
	 * @notice RESERVED is unused.
	 * @dev The RESERVED is unused.
	 */
	address public RESERVED;

	/**
	 * @notice Emitted when tokens are bridged to the Pactus blockchain
	 * @param sender Address of the sender
	 * @param amount Amount of WPAC tokens bridged
	 * @param pactusAddress Pactus blockchain address that will receive the coins
	 */
	event Bridge(address indexed sender, uint256 amount, string pactusAddress);

	/**
	 * @notice Emitted when the minter address is set
	 * @param minter Address of the new minter
	 */
	event SetMinter(address indexed minter);

	/**
	 * @notice Modifier to check if the caller is the minter.
	 * @param caller The address of the caller.
	 */
	modifier OnlyMinter(address caller) {
		require(caller == MINTER, "WPAC: caller is not the minter");
		_;
	}

	/**
	 * @notice Initializes the contract.
	 * @dev Sets the token name and symbol, initializes the ownership, pausable, and enables UUPS upgradeability.
	 */
	function initialize() public initializer {
		__ERC20_init("Wrapped PAC", "WPAC");
		__Ownable_init();
		__UUPSUpgradeable_init();
	}

	/**
	 * @notice Returns the number of decimals used by the token.
	 * @return The number of decimals (9).
	 */
	function decimals() public pure override returns (uint8) {
		return 9;
	}

	/**
	 * @notice Mints new tokens to a specified address.
	 * @dev Requires the caller to be the minter.
	 * @param to The address to receive the minted tokens.
	 * @param amount The amount of tokens to mint.
	 */
	function mint(address to, uint256 amount) public OnlyMinter(_msgSender()) {
		_mint(to, amount);
	}

	/**
	 * @notice Internal function to handle the common bridge logic.
	 * @dev Burns the sender's tokens and records the bridge event.
	 * @param pactusAddress The Pactus blockchain address that will receive the coins
	 * @param value The amount of WPAC tokens to bridge
	 */
	function _bridge(string memory pactusAddress, uint256 value) internal {
		// Perform token burn first (fail fast if insufficient balance)
		_burn(_msgSender(), value);

		// Update tracking state after successful burn
		++counter;
		bridged[counter] = BridgeEvent(_msgSender(), value, pactusAddress);

		// Emit event after all state changes are complete
		emit Bridge(_msgSender(), value, pactusAddress);
	}

	/**
	 * @notice Bridges tokens to the Pactus blockchain.
	 * @dev Burns the sender's tokens and records the bridge event.
	 * @param pactusAddress The Pactus blockchain address that will receive the coins
	 * @param value The amount of WPAC tokens to bridge
	 */
	function bridge(string memory pactusAddress, uint256 value) public whenNotPaused {
		require(value > (1 * 1e9), "WPAC: value is low.");
		_bridge(pactusAddress, value);
	}

	/**
	 * @notice Bridges tokens administratively to the Pactus blockchain.
	 * @dev Only callable by the MINTER.
	 * @param pactusAddress The Pactus blockchain address that will receive the coins
	 * @param value The amount of WPAC tokens to bridge
	 */
	function adminBridge(string memory pactusAddress, uint256 value) public OnlyMinter(_msgSender()) {
		_bridge(pactusAddress, value);
	}

	/**
	 * @notice Sets the minter address.
	 * @dev Only callable by the contract owner. Sets the minter to the specified address.
	 * @param _minterAddress The address to set as the minter.
	 */
	function setMinter(address _minterAddress) public onlyOwner {
		require(_minterAddress != address(0), "WPAC: minter cannot be zero");

		MINTER = _minterAddress;
		emit SetMinter(_minterAddress);
	}

	/**
	 * @notice Authorizes an upgrade to a new implementation.
	 * @dev Only callable by the contract owner.
	 * @param newImplementation The address of the new implementation.
	 */
	function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}

	/**
	 * @notice Pauses the contract.
	 * @dev Only callable by the contract owner.
	 */
	function pause() public onlyOwner {
		_pause();
	}

	/**
	 * @notice Unpauses the contract.
	 * @dev Only callable by the contract owner.
	 */
	function unpause() public onlyOwner {
		_unpause();
	}
}
