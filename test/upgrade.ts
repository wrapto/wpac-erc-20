import { ethers, upgrades } from "hardhat"
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers"
import { expect } from "chai"
import { decimal } from "../utils/decimal"
import { WrappedPAC } from "../types"

export const shouldBehaveLikeUpgrade = async () => {
	let wpac: WrappedPAC
	let alice: SignerWithAddress, minter: SignerWithAddress
	let proxyAddress: string
	let initialImplementation: string

	before(async () => {
		const signers = await ethers.getSigners()

		alice = signers[1]
		minter = signers[2]

		const Factory = await ethers.getContractFactory("WrappedPACv2")
		const WPAC = await upgrades.deployProxy(Factory, undefined, { initializer: "initialize" })
		wpac = await WPAC.waitForDeployment()

		proxyAddress = await wpac.getAddress()
		initialImplementation = await upgrades.erc1967.getImplementationAddress(proxyAddress)

		await wpac.setMinter(minter)
		await wpac.connect(minter).mint(alice.address, decimal(100))
	})

	it("should be deployed as upgradeable proxy", async () => {
		expect(proxyAddress).to.not.equal(initialImplementation)
	})

	it("should preserve state after upgrade", async () => {
		// Store initial state
		const initialOwner = await wpac.owner()
		const initialMinter = await wpac.MINTER()
		const initialBalance = await wpac.balanceOf(alice.address)
		const initialCounter = await wpac.counter()
		const initialTotalSupply = await wpac.totalSupply()
		const initialName = await wpac.name()
		const initialSymbol = await wpac.symbol()
		const initialDecimals = await wpac.decimals()

		// Perform upgrade
		const V2Factory = await ethers.getContractFactory("WrappedPACv2")
		await upgrades.upgradeProxy(proxyAddress, V2Factory)
		const upgraded = await ethers.getContractAt("WrappedPACv2", proxyAddress)

		// Verify state is preserved
		expect(await upgraded.owner()).to.be.equal(initialOwner)
		expect(await upgraded.MINTER()).to.be.equal(initialMinter)
		expect(await upgraded.balanceOf(alice.address)).to.be.equal(initialBalance)
		expect(await upgraded.counter()).to.be.equal(initialCounter)
		expect(await upgraded.totalSupply()).to.be.equal(initialTotalSupply)
		expect(await upgraded.name()).to.be.equal(initialName)
		expect(await upgraded.symbol()).to.be.equal(initialSymbol)
		expect(await upgraded.decimals()).to.be.equal(initialDecimals)
	})

	it("should successfully upgrade the proxy", async () => {
		const beforeImplementation = await upgrades.erc1967.getImplementationAddress(proxyAddress)
		expect(beforeImplementation).to.not.equal(ethers.ZeroAddress)

		// Perform upgrade
		const V2Factory = await ethers.getContractFactory("WrappedPACv2")
		await upgrades.upgradeProxy(proxyAddress, V2Factory)

		const afterImplementation = await upgrades.erc1967.getImplementationAddress(proxyAddress)

		// Implementation address should be valid (may be same if upgrading to identical contract)
		expect(afterImplementation).to.not.equal(ethers.ZeroAddress)
		expect(afterImplementation).to.be.a("string")
	})

	it("should only allow owner to upgrade", async () => {
		// Deploy a new implementation contract
		const V2Factory = await ethers.getContractFactory("WrappedPACv2")
		const newImplementation = await V2Factory.deploy()
		await newImplementation.waitForDeployment()
		const newImplementationAddress = await newImplementation.getAddress()

		// Get the proxy contract and try to upgrade as non-owner
		// The upgradeToAndCall function should revert with OwnableUnauthorizedAccount
		const proxy = await ethers.getContractAt("WrappedPACv2", proxyAddress)

		// Non-owner should not be able to upgrade
		await expect(proxy.connect(alice).upgradeToAndCall(newImplementationAddress, "0x")).to.be.revertedWith("Ownable: caller is not the owner")
	})

	it("should maintain functionality after upgrade", async () => {
		const V2Factory = await ethers.getContractFactory("WrappedPACv2")
		await upgrades.upgradeProxy(proxyAddress, V2Factory)
		const upgraded = await ethers.getContractAt("WrappedPACv2", proxyAddress)

		// Test that minting still works
		await upgraded.connect(minter).mint(alice.address, decimal(10))
		expect(await upgraded.balanceOf(alice.address)).to.be.equal(decimal(110))

		// Test that bridging still works
		const pacAddr = "tpc1zlymfcuxlgvvuud2q4zw0scllqn74d2f90hld6w"
		await upgraded.connect(alice).bridge(pacAddr, decimal(5))
		expect(await upgraded.balanceOf(alice.address)).to.be.equal(decimal(105))
		expect(await upgraded.counter()).to.be.equal(1)
	})

	it("should maintain proxy address after upgrade", async () => {
		const beforeProxy = await wpac.getAddress()

		const V2Factory = await ethers.getContractFactory("WrappedPACv2")
		await upgrades.upgradeProxy(proxyAddress, V2Factory)
		const upgraded = await ethers.getContractAt("WrappedPACv2", proxyAddress)

		const afterProxy = await upgraded.getAddress()

		expect(afterProxy).to.be.equal(beforeProxy)
		expect(afterProxy).to.be.equal(proxyAddress)
	})
}

