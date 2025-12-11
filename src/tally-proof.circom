pragma circom 2.0.0;

include "../node_modules/circomlib/circuits/comparators.circom";

// Simple tally proof circuit that verifies a sum of votes
template TallyProof(numVotes) {
    signal input votes[numVotes];
    signal input expectedTotal;
    signal output isValid;

    // Calculate the sum of all votes using signals
    signal sum[numVotes + 1];
    sum[0] <== 0;
    
    for (var i = 0; i < numVotes; i++) {
        sum[i + 1] <== sum[i] + votes[i];
    }

    // Check if the calculated total matches expected total
    component eq = IsEqual();
    eq.in[0] <== sum[numVotes];
    eq.in[1] <== expectedTotal;
    
    isValid <== eq.out;
}

component main = TallyProof(10);