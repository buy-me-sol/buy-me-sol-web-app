import { Provider } from '@project-serum/anchor';
import { Connection, clusterApiUrl } from '@solana/web3.js';

// Set our network to devnet.
const network = clusterApiUrl('devnet');

// Controls how we want to acknowledge when a transaction is "done".
const opts = {
    preflightCommitment: "processed"
  }

export function getProvider() {
    const connection = new Connection(network, opts.preflightCommitment);
    return new Provider(
        connection, window.solana, opts.preflightCommitment
    );
}
