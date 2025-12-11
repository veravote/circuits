#!/usr/bin/env node

const snarkjs = require("snarkjs");
const fs = require("fs");
const path = require("path");

const CIRCUIT_NAME = "tally-proof";

async function generateProof(input) {
    console.log(`Generating proof for ${CIRCUIT_NAME}...`);

    const wasmPath = path.join("build", CIRCUIT_NAME, `${CIRCUIT_NAME}.wasm`);
    const zkeyPath = path.join("build", CIRCUIT_NAME, `${CIRCUIT_NAME}_0001.zkey`);

    // Check if required files exist
    if (!fs.existsSync(wasmPath)) {
        throw new Error(`WASM file not found: ${wasmPath}. Run setup first.`);
    }
    if (!fs.existsSync(zkeyPath)) {
        throw new Error(`Proving key not found: ${zkeyPath}. Run setup first.`);
    }

    // Generate proof
    console.log("Generating proof...");
    const { proof, publicSignals } = await snarkjs.groth16.fullProve(input, wasmPath, zkeyPath);

    // Save proof and public signals
    const proofPath = path.join("build", CIRCUIT_NAME, `${CIRCUIT_NAME}_proof.json`);
    const publicPath = path.join("build", CIRCUIT_NAME, `${CIRCUIT_NAME}_public.json`);

    fs.writeFileSync(proofPath, JSON.stringify(proof, null, 2));
    fs.writeFileSync(publicPath, JSON.stringify(publicSignals, null, 2));

    console.log(`Proof saved to: ${proofPath}`);
    console.log(`Public signals saved to: ${publicPath}`);

    return { proof, publicSignals };
}

async function verifyProof(proof, publicSignals) {
    console.log(`Verifying proof for ${CIRCUIT_NAME}...`);

    const vkeyPath = path.join("build", CIRCUIT_NAME, `${CIRCUIT_NAME}_verification_key.json`);

    if (!fs.existsSync(vkeyPath)) {
        throw new Error(`Verification key not found: ${vkeyPath}. Run setup first.`);
    }

    const vKey = JSON.parse(fs.readFileSync(vkeyPath));
    const res = await snarkjs.groth16.verify(vKey, publicSignals, proof);

    console.log(`Verification result: ${res ? "✓ VALID" : "✗ INVALID"}`);
    return res;
}

// Example usage
async function runExample() {
    const input = {
        votes: [1, 0, 1, 1, 0, 1, 0, 1, 1, 0], // 10 votes: 6 yes, 4 no
        expectedTotal: 6,
    };

    try {
        const { proof, publicSignals } = await generateProof(input);
        await verifyProof(proof, publicSignals);
        console.log("🎉 Tally proof example completed successfully!");
    } catch (error) {
        console.error("❌ Error:", error.message);
        process.exit(1);
    }
}

// CLI interface
if (require.main === module) {
    const args = process.argv.slice(2);
    const command = args[0];

    if (command === "example") {
        runExample();
    } else if (command === "prove") {
        const inputFile = args[1];

        if (!inputFile) {
            console.log("Usage: node prove-tally.js prove <input-file>");
            process.exit(1);
        }

        const input = JSON.parse(fs.readFileSync(inputFile));
        generateProof(input)
            .then(() => console.log("✓ Proof generation completed!"))
            .catch((error) => {
                console.error("❌ Error:", error.message);
                process.exit(1);
            });
    } else if (command === "verify") {
        const proofPath = path.join("build", CIRCUIT_NAME, `${CIRCUIT_NAME}_proof.json`);
        const publicPath = path.join("build", CIRCUIT_NAME, `${CIRCUIT_NAME}_public.json`);

        const proof = JSON.parse(fs.readFileSync(proofPath));
        const publicSignals = JSON.parse(fs.readFileSync(publicPath));

        verifyProof(proof, publicSignals)
            .then((result) => process.exit(result ? 0 : 1))
            .catch((error) => {
                console.error("❌ Error:", error.message);
                process.exit(1);
            });
    } else {
        console.log("Tally Proof Commands:");
        console.log("  example           - Run example proof");
        console.log("  prove <input-file> - Generate proof from input file");
        console.log("  verify            - Verify existing proof");
    }
}

module.exports = { generateProof, verifyProof };
