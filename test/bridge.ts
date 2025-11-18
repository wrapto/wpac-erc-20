import { ethers, upgrades } from "hardhat"
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers"
import { expect } from "chai"
import { decimal } from "../utils/decimal"
import { WrappedPAC } from "../types"

export const shouldBehaveLikeBridge = async () => {
	let wpac: WrappedPAC
	let _owner: SignerWithAddress, _alice: SignerWithAddress, bob: SignerWithAddress, minter: SignerWithAddress
	const pacAddr = "tpc1zlymfcuxlgvvuud2q4zw0scllqn74d2f90hld6w"

	before(async () => {
		const signers = await ethers.getSigners()

		_owner = signers[0]
		_alice = signers[1]
		bob = signers[2]
		minter = signers[3]
	})

	beforeEach(async () => {
		const Factory = await ethers.getContractFactory("WrappedPACv2")
		const WPAC = await upgrades.deployProxy(Factory, undefined, { initializer: "initialize" })
		wpac = await WPAC.waitForDeployment()

		await wpac.setMinter(minter)

		await wpac.connect(minter).mint(bob.address, decimal(100))

	})

	it("should fail if the value is below the minimum threshold", async () => {
		await expect(wpac.connect(bob).bridge(pacAddr, decimal(1))).to.be.revertedWith("WPAC: value is low.")
	})

	it("should fail if amount exceeds balance", async () => {
		// Bob has 100 tokens, trying to bridge 110 should fail
		await expect(wpac.connect(bob).bridge(pacAddr, decimal(110))).to.be.revertedWith("ERC20: burn amount exceeds balance")
		// Bob has 100 tokens, trying to bridge 101 should fail
		await expect(wpac.connect(bob).bridge(pacAddr, decimal(101))).to.be.revertedWith("ERC20: burn amount exceeds balance")
		// Note: bridging exactly 100 when balance is 100 should succeed (100 >= 100)
	})

	it("should bridge tokens to another blockchain address", async () => {
		await wpac.connect(bob).bridge(pacAddr, decimal(7))

		const event = await wpac.bridged(1)

		expect(await wpac.balanceOf(bob.address)).to.be.equal(decimal(93))
		expect(event.pactusAddress).to.be.equal(pacAddr)
		expect(event.sender).to.be.equal(bob.address)
		expect(event.amount).to.be.equal(decimal(7))

		expect(await wpac.totalSupply()).to.be.equal(decimal(93)) // 100 - 7 = 93
		expect(await wpac.counter()).to.be.equal(1) // counter
	})
}
