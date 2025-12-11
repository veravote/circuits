#!/bin/bash

# Tally Proof Circuit Setup Script

set -e

CIRCUIT_NAME="tally-proof"
NUM_VOTES=${1:-10}
PTAU_SIZE=${2:-14}

echo "Setting up Tally Proof circuit with $NUM_VOTES votes"
echo "Using Powers of Tau ceremony size: 2^$PTAU_SIZE"

# Create build directories
mkdir -p build/${CIRCUIT_NAME}
mkdir -p build/ptau

# Step 1: Compile the circuit
echo "Step 1: Compiling Tally Proof circuit..."
circom src/${CIRCUIT_NAME}.circom --r1cs --wasm --sym --c -o build/${CIRCUIT_NAME}/

# Step 2: Download or generate Powers of Tau ceremony file
PTAU_FILE="build/ptau/powersOfTau28_hez_final_${PTAU_SIZE}.ptau"
if [ ! -f "$PTAU_FILE" ]; then
    echo "Step 2: Downloading Powers of Tau ceremony file..."
    curl -o "$PTAU_FILE" "https://storage.googleapis.com/zkevm/ptau/powersOfTau28_hez_final_${PTAU_SIZE}.ptau"
else
    echo "Step 2: Powers of Tau file already exists, skipping download..."
fi

# Step 3: Generate zkey (circuit-specific proving key)
echo "Step 3: Generating circuit proving key..."
snarkjs groth16 setup build/${CIRCUIT_NAME}/${CIRCUIT_NAME}.r1cs "$PTAU_FILE" build/${CIRCUIT_NAME}/${CIRCUIT_NAME}_0000.zkey

# Step 4: Contribute to the ceremony (Phase 2)
echo "Step 4: Contributing to Phase 2 ceremony..."
snarkjs zkey contribute build/${CIRCUIT_NAME}/${CIRCUIT_NAME}_0000.zkey build/${CIRCUIT_NAME}/${CIRCUIT_NAME}_0001.zkey --name="Tally Proof contribution" -v

# Step 5: Export verification key
echo "Step 5: Exporting verification key..."
snarkjs zkey export verificationkey build/${CIRCUIT_NAME}/${CIRCUIT_NAME}_0001.zkey build/${CIRCUIT_NAME}/${CIRCUIT_NAME}_verification_key.json

echo "✓ Tally Proof circuit setup complete!"
echo "Files generated in build/${CIRCUIT_NAME}/ directory:"
echo "- ${CIRCUIT_NAME}.r1cs"
echo "- ${CIRCUIT_NAME}.wasm"
echo "- ${CIRCUIT_NAME}_0001.zkey"
echo "- ${CIRCUIT_NAME}_verification_key.json"