import {
  Connection,
  Keypair,
  SystemProgram,
  PublicKey,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import {
  Program,
  Wallet,
  AnchorProvider,
  Address,
  BN,
} from "@project-serum/anchor";
import { WbaVault, IDL } from "./programs/wba_vault";
import wallet from "../wba-wallet.json";

// We're going to import our keypair from the wallet file
const keypair = Keypair.fromSecretKey(new Uint8Array(wallet));

// Create a devnet connection
const connection = new Connection("https://api.devnet.solana.com");

// Create our anchor provider
const provider = new AnchorProvider(connection, new Wallet(keypair), {
  commitment: "confirmed",
});

// Create our program
const program = new Program<WbaVault>(
  IDL,
  "D51uEDHLbWAxNfodfQDv7qkp8WZtxrhi3uganGbNos7o" as Address,
  provider
);

const vaultState = new PublicKey(
  "BhyMQ4ivmLbSr95Uvhezjj9jF5Nt9NKcMxfNLH8chvsh"
);

const vaultAuth_seeds = [Buffer.from("auth"), vaultState.toBuffer()];
const vaultAuth = PublicKey.findProgramAddressSync(
  vaultAuth_seeds,
  program.programId
)[0];

const vault_seeds = [Buffer.from("vault"), vaultAuth.toBuffer()];

const vault = PublicKey.findProgramAddressSync(
  vault_seeds,
  program.programId
)[0];

(async () => {
  try {
    const txhash = await program.methods
      .deposit(new BN(0.1 * LAMPORTS_PER_SOL))
      .accounts({
        owner: keypair.publicKey,
        vaultState: vaultState,
        vaultAuth: vaultAuth,
        vault: vault,
        systemProgram: SystemProgram.programId,
      })
      .signers([keypair])
      .rpc();
    console.log(`Success! Check out your TX here: 
      https://explorer.solana.com/tx/${txhash}?cluster=devnet`);
  } catch (e) {
    console.error(`Oops, something went wrong: ${e}`);
  }
  console.log(keypair.publicKey);
})();
