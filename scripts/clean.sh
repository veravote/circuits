#!/bin/bash

# Clean build artifacts

echo "Cleaning build artifacts..."

# Remove circuit build directories but keep ptau folder
if [ -d "build/merkle-proof" ]; then
    rm -rf build/merkle-proof
    echo "✓ Removed merkle-proof build directory"
fi

if [ -d "build/tally-proof" ]; then
    rm -rf build/tally-proof
    echo "✓ Removed tally-proof build directory"
fi

# Remove any temporary files
find . -name "*.tmp" -delete 2>/dev/null || true
find . -name "*.log" -delete 2>/dev/null || true

echo "✓ Cleanup completed (Powers of Tau files preserved)"