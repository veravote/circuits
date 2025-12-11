#!/usr/bin/env node

const circomTester = require("circom_tester");
const path = require("path");

async function testMerkleProof() {
    console.log("Testing Merkle Proof circuit...");

    const circuit = await circomTester.wasm(path.join(__dirname, "../src/merkle-proof.circom"));

    // Test case 1: Valid Merkle proof with 4 levels
    console.log("Test 1: Valid Merkle proof (4 levels)");
    const validInput1 = {
        leaf: "12345",
        pathElements: ["1111", "2222", "3333", "4444"],
        pathIndices: 5, // Binary: 0101 (right, left, right, left)
    };

    const witness1 = await circuit.calculateWitness(validInput1);
    await circuit.checkConstraints(witness1);
    console.log("✓ 4-level proof test passed");

    // Test case 2: Different path indices
    console.log("Test 2: Different path indices");
    const validInput2 = {
        leaf: "54321",
        pathElements: ["5555", "6666", "7777", "8888"],
        pathIndices: 10, // Binary: 1010 (left, right, left, right)
    };

    const witness2 = await circuit.calculateWitness(validInput2);
    await circuit.checkConstraints(witness2);
    console.log("✓ Different path test passed");

    // Test case 3: All left path
    console.log("Test 3: All left path");
    const validInput3 = {
        leaf: "99999",
        pathElements: ["1000", "2000", "3000", "4000"],
        pathIndices: 0, // Binary: 0000 (all left)
    };

    const witness3 = await circuit.calculateWitness(validInput3);
    await circuit.checkConstraints(witness3);
    console.log("✓ All left path test passed");

    // Test case 4: All right path
    console.log("Test 4: All right path");
    const validInput4 = {
        leaf: "88888",
        pathElements: ["9000", "8000", "7000", "6000"],
        pathIndices: 15, // Binary: 1111 (all right)
    };

    const witness4 = await circuit.calculateWitness(validInput4);
    await circuit.checkConstraints(witness4);
    console.log("✓ All right path test passed");

    console.log("🎉 All Merkle Proof tests passed!");
}

if (require.main === module) {
    testMerkleProof()
        .then(() => {
            console.log("✓ Merkle Proof test suite completed successfully!");
            process.exit(0);
        })
        .catch((error) => {
            console.error("❌ Merkle Proof test failed:", error.message);
            process.exit(1);
        });
}

module.exports = { testMerkleProof };
