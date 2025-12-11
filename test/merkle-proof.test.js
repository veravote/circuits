#!/usr/bin/env node

const circomTester = require("circom_tester");
const path = require("path");

async function testMerkleProof() {
    console.log("Testing Merkle Proof circuit...");

    const circuit = await circomTester.wasm(path.join(__dirname, "../src/merkle-proof.circom"));

    // Test case 1: Valid Merkle proof with 10 levels
    console.log("Test 1: Valid Merkle proof (10 levels)");
    const validInput1 = {
        leaf: "12345",
        pathElements: [
            "1111",
            "2222",
            "3333",
            "4444",
            "5555",
            "6666",
            "7777",
            "8888",
            "9999",
            "1010",
        ],
        pathIndices: 5, // Binary: 0000000101
        root: "21663839004416932945382355908790599225266501822907911457504978515578255421292",
    };

    const witness1 = await circuit.calculateWitness(validInput1);
    await circuit.checkConstraints(witness1);
    console.log("✓ 10-level proof test passed");

    // Test case 2: Different path indices
    console.log("Test 2: Different path indices");
    const validInput2 = {
        leaf: "54321",
        pathElements: [
            "5555",
            "6666",
            "7777",
            "8888",
            "9999",
            "1111",
            "2222",
            "3333",
            "4444",
            "5555",
        ],
        pathIndices: 10, // Binary: 0000001010
        root: "12345678901234567890123456789012345678901234567890123456789012345678901234567890",
    };

    const witness2 = await circuit.calculateWitness(validInput2);
    await circuit.checkConstraints(witness2);
    console.log("✓ Different path test passed");

    // Test case 3: All left path
    console.log("Test 3: All left path");
    const validInput3 = {
        leaf: "99999",
        pathElements: [
            "1000",
            "2000",
            "3000",
            "4000",
            "5000",
            "6000",
            "7000",
            "8000",
            "9000",
            "1001",
        ],
        pathIndices: 0, // Binary: 0000000000 (all left)
        root: "11111111111111111111111111111111111111111111111111111111111111111111111111111111",
    };

    const witness3 = await circuit.calculateWitness(validInput3);
    await circuit.checkConstraints(witness3);
    console.log("✓ All left path test passed");

    // Test case 4: All right path
    console.log("Test 4: All right path");
    const validInput4 = {
        leaf: "88888",
        pathElements: [
            "9000",
            "8000",
            "7000",
            "6000",
            "5000",
            "4000",
            "3000",
            "2000",
            "1000",
            "9001",
        ],
        pathIndices: 1023, // Binary: 1111111111 (all right)
        root: "22222222222222222222222222222222222222222222222222222222222222222222222222222222",
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
