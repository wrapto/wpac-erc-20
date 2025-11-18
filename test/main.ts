import { shouldBehaveLikeAdminBridge } from "./adminBridge"
import { shouldBehaveLikeBridge } from "./bridge"
import { shouldBehaveLikeInitialize } from "./init"
import { shouldBehaveLikeMint } from "./mint"
import { shouldBehaveLikeUpgrade } from "./upgrade"
describe("Wrapped PAC", function () {
	describe("Initialize", async function () {
		shouldBehaveLikeInitialize()
	})

	describe("Mint", async function () {
		shouldBehaveLikeMint()
	})

	describe("Bridge", async function () {
		shouldBehaveLikeBridge()
	})

	describe("Admin Bridge", async function () {
		shouldBehaveLikeAdminBridge()
	})

	describe("Upgrade", async function () {
		shouldBehaveLikeUpgrade()
	})
})
