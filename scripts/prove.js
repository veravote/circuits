#!/usr/bin/env node

const snarkjs = require("snarkjs");
const fs = require("fs");
const path = require("path");

async function generateProof(circuitName, input) {
    console.log(`Generating proof for ${circuitName}...`);

    const wasmPath = path.join("build", `${circuitName}.wasm`);
    const zkeyPath = path.join("build", `${circuitName}_0001.zkey`);

    // Check if required files exist
    if (!fs.existsSync(wasmPath)) {
        throw new Error(`WASM file not found: ${wasmPath}. Run setup first.`);
    }
    if (!fs.existsSync(zkeyPath)) {
        throw new Error(`Proving key not found: ${zkeyPath}. Run setup first.`);
    }

    // Generate witness
    console.log("Generating witness...");
    const { witness } = await snarkjs.groth16.fullProve(input, wasmPath, zkeyPath);

    // Generate proof
    console.log("Generating proof...");
    const { proof, publicSignals } = await snarkjs.groth16.fullProve(input, wasmPath, zkeyPath);

    // Save proof and public signals
    const proofPath = path.join("build", `${circuitName}_proof.json`);
    const publicPath = path.join("build", `${circuitName}_public.json`);

    fs.writeFileSync(proofPath, JSON.stringify(proof, null, 2));
    fs.writeFileSync(publicPath, JSON.stringify(publicSignals, null, 2));

    console.log(`Proof saved to: ${proofPath}`);
    console.log(`Public signals saved to: ${publicPath}`);

    return { proof, publicSignals };
}

async function verifyProof(circuitName, proof, publicSignals) {
    console.log(`Verifying proof for ${circuitName}...`);

    const vkeyPath = path.join("build", `${circuitName}_verification_key.json`);

    if (!fs.existsSync(vkeyPath)) {
        throw new Error(`Verification key not found: ${vkeyPath}. Run setup first.`);
    }

    const vKey = JSON.parse(fs.readFileSync(vkeyPath));
    const res = await snarkjs.groth16.verify(vKey, publicSignals, proof);

    console.log(`Verification result: ${res ? "VALID" : "INVALID"}`);
    return res;
}

// Example usage for Merkle proof circuit
async function exampleMerkleProof() {
    const circuitName = "merkle-proof";

    // Example input for a 4-level Merkle tree
    const input = {
        leaf: "12345",
        pathElements: ["1111", "2222", "3333", "4444"],
        pathIndices: 5, // Binary: 0101 (path: right, left, right, left)
    };

    try {
        const { proof, publicSignals } = await generateProof(circuitName, input);
        await verifyProof(circuitName, proof, publicSignals);
    } catch (error) {
        console.error("Error:", error.message);
        process.exit(1);
    }
}

// CLI interface
if (require.main === module) {
    const args = process.argv.slice(2);
    const command = args[0];

    if (command === "example") {
        exampleMerkleProof();
    } else if (command === "prove") {
        const circuitName = args[1];
        const inputFile = args[2];

        if (!circuitName || !inputFile) {
            console.log("Usage: node prove.js prove <circuit-name> <input-file>");
            process.exit(1);
        }

        const input = JSON.parse(fs.readFileSync(inputFile));
        generateProof(circuitName, input)
            .then(({ proof, publicSignals }) => {
                console.log("Proof generation completed successfully!");
            })
            .catch((error) => {
                console.error("Error:", error.message);
                process.exit(1);
            });
    } else if (command === "verify") {
        const circuitName = args[1];

        if (!circuitName) {
            console.log("Usage: node prove.js verify <circuit-name>");
            process.exit(1);
        }

        const proofPath = path.join("build", `${circuitName}_proof.json`);
        const publicPath = path.join("build", `${circuitName}_public.json`);

        const proof = JSON.parse(fs.readFileSync(proofPath));
        const publicSignals = JSON.parse(fs.readFileSync(publicPath));

        verifyProof(circuitName, proof, publicSignals)
            .then((result) => {
                process.exit(result ? 0 : 1);
            })
            .catch((error) => {
                console.error("Error:", error.message);
                process.exit(1);
            });
    } else {
        console.log("Available commands:");
        console.log("  example                           - Run example Merkle proof");
        console.log("  prove <circuit-name> <input-file> - Generate proof from input file");
        console.log("  verify <circuit-name>             - Verify existing proof");
    }
}

module.exports = { generateProof, verifyProof };
