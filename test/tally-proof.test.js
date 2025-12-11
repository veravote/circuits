#!/usr/bin/env node

const circomTester = require("circom_tester");
const path = require("path");

async function testTallyProof() {
    console.log("Testing Tally Proof circuit...");

    const circuit = await circomTester.wasm(path.join(__dirname, "../src/tally-proof.circom"));

    // Test case 1: Valid tally (6 yes votes out of 10)
    console.log("Test 1: Valid tally - 6 yes votes");
    const validInput1 = {
        votes: [1, 0, 1, 1, 0, 1, 0, 1, 1, 0],
        expectedTotal: 6,
    };

    const witness1 = await circuit.calculateWitness(validInput1);
    await circuit.checkConstraints(witness1);

    // Check that output is 1 (valid)
    const output1 = witness1[1]; // First signal after input signals
    if (output1 !== 1n) {
        throw new Error(`Expected output 1 (valid), got ${output1}`);
    }
    console.log("✓ Valid tally test passed");

    // Test case 2: All yes votes
    console.log("Test 2: All yes votes");
    const validInput2 = {
        votes: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        expectedTotal: 10,
    };

    const witness2 = await circuit.calculateWitness(validInput2);
    await circuit.checkConstraints(witness2);

    const output2 = witness2[1];
    if (output2 !== 1n) {
        throw new Error(`Expected output 1 (valid), got ${output2}`);
    }
    console.log("✓ All yes votes test passed");

    // Test case 3: All no votes
    console.log("Test 3: All no votes");
    const validInput3 = {
        votes: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        expectedTotal: 0,
    };

    const witness3 = await circuit.calculateWitness(validInput3);
    await circuit.checkConstraints(witness3);

    const output3 = witness3[1];
    if (output3 !== 1n) {
        throw new Error(`Expected output 1 (valid), got ${output3}`);
    }
    console.log("✓ All no votes test passed");

    // Test case 4: Invalid tally (wrong expected total)
    console.log("Test 4: Invalid tally - wrong expected total");
    const invalidInput = {
        votes: [1, 0, 1, 1, 0, 1, 0, 1, 1, 0], // Actually 6 yes votes
        expectedTotal: 5, // But claiming 5
    };

    const witness4 = await circuit.calculateWitness(invalidInput);
    await circuit.checkConstraints(witness4);

    const output4 = witness4[1];
    if (output4 !== 0n) {
        throw new Error(`Expected output 0 (invalid), got ${output4}`);
    }
    console.log("✓ Invalid tally test passed");

    console.log("🎉 All Tally Proof tests passed!");
}

if (require.main === module) {
    testTallyProof()
        .then(() => {
            console.log("✓ Tally Proof test suite completed successfully!");
            process.exit(0);
        })
        .catch((error) => {
            console.error("❌ Tally Proof test failed:", error.message);
            process.exit(1);
        });
}

module.exports = { testTallyProof };
