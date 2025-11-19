import { ethers, upgrades } from "hardhat"
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers"
import { expect } from "chai"
import { decimal } from "../utils/decimal"
import { WrappedPACv2 } from "../types"

export const shouldBehaveLikeAdminBridge = async () => {
	let wpac: WrappedPACv2
	let _owner: SignerWithAddress, alice: SignerWithAddress, bob: SignerWithAddress, minter: SignerWithAddress
	const pacAddr = "tpc1zlymfcuxlgvvuud2q4zw0scllqn74d2f90hld6w"

	before(async () => {
		const signers = await ethers.getSigners()

		_owner = signers[0]
		alice = signers[1]
		bob = signers[2]
		minter = signers[3]
	})

	beforeEach(async () => {
		const Factory = await ethers.getContractFactory("WrappedPACv2")
		const WPAC = await upgrades.deployProxy(Factory, undefined, { initializer: "initialize" })
		wpac = await WPAC.waitForDeployment()

		await wpac.setMinter(minter)

		await wpac.connect(minter).mint(bob.address, decimal(100))
		await wpac.connect(minter).mint(minter.address, decimal(20)) // Give minter some tokens to bridge
	})

	it("should fail if caller is not minter", async () => {
		await expect(wpac.connect(alice).adminBridge(pacAddr, decimal(1))).to.be.revertedWith("WPAC: caller is not the minter")
	})

	it("should fail if amount exceeds balance", async () => {
		await expect(wpac.connect(minter).adminBridge(pacAddr, decimal(21))).to.be.revertedWith("ERC20: burn amount exceeds balance")

		// Minter bridges 8 tokens, now has 12 left
		await wpac.connect(minter).adminBridge(pacAddr, decimal(8))

		// Minter tries to bridge 13 tokens but only has 12, should fail
		await expect(wpac.connect(minter).adminBridge(pacAddr, decimal(13))).to.be.revertedWith("ERC20: burn amount exceeds balance")
	})

	it("should bridge tokens to another blockchain address (Minter)", async () => {
		await wpac.connect(bob).bridge(pacAddr, decimal(8))
		await wpac.connect(bob).bridge(pacAddr, decimal(10))

		// Minter bridges 2 tokens from their balance
		await wpac.connect(minter).adminBridge(pacAddr, decimal(2))

		const event = await wpac.bridged(3)

		expect(await wpac.balanceOf(minter.address)).to.be.equal(decimal(18)) // 20 - 2 = 18
		expect(await wpac.balanceOf(bob.address)).to.be.equal(decimal(82)) // 100 - 8 - 10 = 82
		expect(event.pactusAddress).to.be.equal(pacAddr)
		expect(event.sender).to.be.equal(minter.address)
		expect(event.amount).to.be.equal(decimal(2))
		expect(event.fee).to.be.equal(decimal(0))

		expect(await wpac.totalSupply()).to.be.equal(decimal(100))
		expect(await wpac.counter()).to.be.equal(3) // counter
	})
}
