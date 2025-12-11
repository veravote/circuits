#!/usr/bin/env node

const { testMerkleProof } = require("./merkle-proof.test.js");
const { testTallyProof } = require("./tally-proof.test.js");

async function runAllTests() {
    console.log("🧪 Running all circuit tests...\n");

    try {
        // Run Merkle Proof tests
        console.log("=== MERKLE PROOF TESTS ===");
        await testMerkleProof();
        console.log("");

        // Run Tally Proof tests
        console.log("=== TALLY PROOF TESTS ===");
        await testTallyProof();
        console.log("");

        console.log("🎉 All circuit tests completed successfully!");
    } catch (error) {
        console.error("❌ Test suite failed:", error.message);
        process.exit(1);
    }
}

if (require.main === module) {
    runAllTests();
}

module.exports = { runAllTests };
