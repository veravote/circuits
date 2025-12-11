# Zero-Knowledge Circuits with snarkjs

This project contains Circom circuits with comprehensive snarkjs tooling for trusted setup, proof generation, and verification.

## Circuits

- **Merkle Proof Circuit** (`src/merkle-proof.circom`) - Verifies Merkle tree inclusion proofs
- **Tally Proof Circuit** (`src/tally-proof.circom`) - Verifies vote tallying computations

## Prerequisites

1. **Node.js** (v18 or later)
2. **Circom** - Install from [circom docs](https://docs.circom.io/getting-started/installation)
3. **snarkjs** - Installed as dependency

## Installation

```bash
npm install
```

## Quick Start

### 1. Test Circuits

Test both circuits to ensure they work correctly:

```bash
npm test
```

Or test individual circuits:

```bash
npm run test:merkle
npm run test:tally
```

### 2. Setup Circuits

Set up the trusted ceremony for both circuits:

```bash
npm run setup:all
```

Or setup individual circuits:

```bash
npm run setup:merkle
npm run setup:tally
```

### 3. Generate Proofs

Run example proofs:

```bash
npm run prove:merkle:example
npm run prove:tally:example
```

Or generate proofs from input files:

```bash
npm run prove:merkle
npm run prove:tally
```

### 4. Verify Proofs

```bash
npm run verify:merkle
npm run verify:tally
```

## Available Scripts

### Development

- `npm test` - Run all circuit tests
- `npm run test:merkle` - Test Merkle proof circuit only
- `npm run test:tally` - Test tally proof circuit only
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting
- `npm run clean` - Clean build artifacts

### Circuit Setup

- `npm run setup:merkle` - Setup Merkle proof circuit (downloads ~16MB ptau file)
- `npm run setup:tally` - Setup tally proof circuit
- `npm run setup:all` - Setup both circuits

### Proof Generation & Verification

- `npm run prove:merkle:example` - Generate example Merkle proof
- `npm run prove:tally:example` - Generate example tally proof
- `npm run prove:merkle` - Generate Merkle proof from input file
- `npm run prove:tally` - Generate tally proof from input file
- `npm run verify:merkle` - Verify Merkle proof
- `npm run verify:tally` - Verify tally proof

## Circuit Details

### Merkle Proof Circuit

Verifies that a leaf is included in a Merkle tree with a given root.

**Inputs:**

- `leaf` - The leaf value to prove inclusion for
- `pathElements[levels]` - Array of sibling hashes along the path
- `pathIndices` - Binary representation of the path (0=left, 1=right)
- `root` - The expected Merkle root (public input)

**Constraint:**

- The circuit verifies that the computed root from the path equals the provided root

**Example Input:**

```json
{
    "leaf": "12345678901234567890",
    "pathElements": [
        "1111111111111111111",
        "2222222222222222222",
        "3333333333333333333",
        "4444444444444444444",
        "5555555555555555555",
        "6666666666666666666",
        "7777777777777777777",
        "8888888888888888888",
        "9999999999999999999",
        "1010101010101010101"
    ],
    "pathIndices": 341,
    "root": "21663839004416932945382355908790599225266501822907911457504978515578255421292"
}
```

### Tally Proof Circuit

Verifies that a vote tally is computed correctly.

**Inputs:**

- `votes[numVotes]` - Array of votes (0 or 1)
- `expectedTotal` - The claimed total count

**Output:**

- `isValid` - 1 if tally is correct, 0 otherwise

**Example Input:**

```json
{
    "votes": [1, 0, 1, 1, 0, 1, 0, 1, 1, 0],
    "expectedTotal": 6
}
```

## File Structure

```
├── src/
│   ├── merkle-proof.circom     # Merkle proof circuit
│   └── tally-proof.circom      # Tally proof circuit
├── scripts/
│   ├── setup-merkle-proof.sh   # Merkle proof setup
│   ├── setup-tally-proof.sh    # Tally proof setup
│   ├── prove-merkle.js         # Merkle proof generation/verification
│   ├── prove-tally.js          # Tally proof generation/verification
│   └── clean.sh                # Clean build artifacts
├── test/
│   ├── merkle-proof.test.js    # Merkle proof tests
│   ├── tally-proof.test.js     # Tally proof tests
│   └── test-circuits.js        # Main test runner
├── example-inputs/
│   ├── merkle-proof-input.json # Example Merkle proof input
│   └── tally-proof-input.json  # Example tally proof input
└── build/                      # Generated files (created after setup)
    ├── merkle-proof/           # Merkle proof build artifacts
    ├── tally-proof/            # Tally proof build artifacts
    └── ptau/                   # Powers of Tau ceremony files
```

## Generated Files

After running setup, the following files are generated in `build/<circuit-name>/`:

- `<circuit>.r1cs` - R1CS constraint system
- `<circuit>.wasm` - WebAssembly witness generator
- `<circuit>_0001.zkey` - Proving key (after contributions)
- `<circuit>_verification_key.json` - Verification key
- `<circuit>_proof.json` - Generated proof (after proving)
- `<circuit>_public.json` - Public signals (after proving)

## Advanced Usage

### Custom Input Files

Create your own input files in the `example-inputs/` directory and use them:

```bash
node scripts/prove-merkle.js prove my-custom-input.json
node scripts/prove-tally.js prove my-custom-input.json
```

### Direct Script Usage

You can also run the scripts directly:

```bash
# Setup with custom parameters
./scripts/setup-merkle-proof.sh 20 16  # 20 levels, 2^16 ptau size

# Generate proof from custom input
node scripts/prove-merkle.js prove example-inputs/merkle-proof-input.json

# Verify existing proof
node scripts/prove-merkle.js verify
```

### Solidity Integration

If you need Solidity verifier contracts, you can generate them manually after setup:

```bash
# Generate Solidity verifier for Merkle proof
snarkjs zkey export solidityverifier build/merkle-proof/merkle-proof_0001.zkey merkle-proof_verifier.sol

# Generate Solidity verifier for Tally proof
snarkjs zkey export solidityverifier build/tally-proof/tally-proof_0001.zkey tally-proof_verifier.sol
```

## Troubleshooting

### Common Issues

1. **"WASM file not found"** - Run the setup script first
2. **"Proving key not found"** - Complete the trusted setup ceremony
3. **"Powers of Tau download failed"** - Check internet connection, the ptau files are large (16MB+)

### Debug Mode

Run any script with `-v` flag for verbose output:

```bash
./scripts/setup-merkle-proof.sh 10 14 -v
```

### Clean and Restart

If you encounter issues, clean and restart:

```bash
npm run clean
npm run setup:all
```

## Security Notes

- The setup scripts include a contribution to the trusted setup ceremony
- For production use, ensure multiple independent contributions
- The random beacon step uses a fixed value for reproducibility - use a proper beacon in production
- Always verify the final ceremony transcript before using in production

## Resources

- [snarkjs Documentation](https://github.com/iden3/snarkjs)
- [Circom Documentation](https://docs.circom.io/)
- [Powers of Tau Ceremony](https://github.com/weijiekoh/perpetualpowersoftau)
- [Groth16 Paper](https://eprint.iacr.org/2016/260.pdf)
