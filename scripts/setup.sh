#!/bin/bash

# Circuit setup script using snarkjs
# This script handles the complete trusted setup process for circuits

set -e

CIRCUIT_NAME=${1:-"merkle-proof"}
LEVELS=${2:-10}
PTAU_SIZE=${3:-14}

echo "Setting up circuit: $CIRCUIT_NAME with $LEVELS levels"
echo "Using Powers of Tau ceremony size: 2^$PTAU_SIZE"

# Create build directory
mkdir -p build

# Step 1: Compile the circuit
echo "Step 1: Compiling circuit..."
circom src/${CIRCUIT_NAME}.circom --r1cs --wasm --sym --c -o build/

# Step 2: Download or generate Powers of Tau ceremony file
PTAU_FILE="build/powersOfTau28_hez_final_${PTAU_SIZE}.ptau"
if [ ! -f "$PTAU_FILE" ]; then
    echo "Step 2: Downloading Powers of Tau ceremony file..."
    wget -O "$PTAU_FILE" "https://hermez.s3-eu-west-1.amazonaws.com/powersOfTau28_hez_final_${PTAU_SIZE}.ptau"
else
    echo "Step 2: Powers of Tau file already exists, skipping download..."
fi

# Step 3: Generate zkey (circuit-specific proving key)
echo "Step 3: Generating circuit proving key..."
snarkjs groth16 setup build/${CIRCUIT_NAME}.r1cs "$PTAU_FILE" build/${CIRCUIT_NAME}_0000.zkey

# Step 4: Contribute to the ceremony (Phase 2)
echo "Step 4: Contributing to Phase 2 ceremony..."
snarkjs zkey contribute build/${CIRCUIT_NAME}_0000.zkey build/${CIRCUIT_NAME}_0001.zkey --name="First contribution" -v

# Step 5: Export verification key
echo "Step 5: Exporting verification key..."
snarkjs zkey export verificationkey build/${CIRCUIT_NAME}_0001.zkey build/${CIRCUIT_NAME}_verification_key.json

# Step 6: Generate Solidity verifier contract
echo "Step 6: Generating Solidity verifier contract..."
snarkjs zkey export solidityverifier build/${CIRCUIT_NAME}_0001.zkey build/${CIRCUIT_NAME}_verifier.sol

echo "Setup complete! Files generated in build/ directory:"
echo "- ${CIRCUIT_NAME}.r1cs (R1CS constraint system)"
echo "- ${CIRCUIT_NAME}.wasm (WebAssembly witness generator)"
echo "- ${CIRCUIT_NAME}_0001.zkey (Proving key)"
echo "- ${CIRCUIT_NAME}_verification_key.json (Verification key)"
echo "- ${CIRCUIT_NAME}_verifier.sol (Solidity verifier contract)"