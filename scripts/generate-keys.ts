#!/usr/bin/env node
/**
 * CooL.ledger Key Generation Utility
 * Generates fresh cryptographic keypairs for institutional evidence signing:
 * 1. Ed25519 (RFC 8032) - 32-byte secret / public key
 * 2. ML-DSA-65 (FIPS 204) - 32-byte seed / post-quantum keypair
 *
 * Usage:
 *   npm run keys:generate
 *   or:
 *   node --experimental-strip-types scripts/generate-keys.ts
 */

import { ed25519 } from '@noble/curves/ed25519.js';
import { ml_dsa65 } from '@noble/post-quantum/ml-dsa.js';
import { bytesToHex } from '@noble/hashes/utils.js';

function generateRandomBytes(length: number): Uint8Array {
  const bytes = new Uint8Array(length);
  globalThis.crypto.getRandomValues(bytes);
  return bytes;
}

console.log('===============================================================');
console.log('  CooL.ledger - Institutional Keypair Generation Tool');
console.log('===============================================================\n');

// 1. Generate Ed25519 Keypair
const ed25519SecretBytes = generateRandomBytes(32);
const ed25519PublicKeyBytes = ed25519.getPublicKey(ed25519SecretBytes);

const ed25519SecretHex = bytesToHex(ed25519SecretBytes);
const ed25519PublicKeyHex = bytesToHex(ed25519PublicKeyBytes);

console.log('1. Ed25519 Classical Keypair (RFC 8032):');
console.log(`   Secret Key (32 bytes / 64 hex): ${ed25519SecretHex}`);
console.log(`   Public Key (32 bytes / 64 hex): ${ed25519PublicKeyHex}\n`);

// 2. Generate ML-DSA-65 Post-Quantum Keypair
const mldsaSeedBytes = generateRandomBytes(32);
const mldsaKeys = ml_dsa65.keygen(mldsaSeedBytes);

const mldsaSeedHex = bytesToHex(mldsaSeedBytes);
const mldsaPublicKeyHex = bytesToHex(mldsaKeys.publicKey);

console.log('2. ML-DSA-65 Post-Quantum Keypair (NIST FIPS 204):');
console.log(`   Seed (32 bytes / 64 hex):       ${mldsaSeedHex}`);
console.log(`   Public Key (1952 bytes / hex):  ${mldsaPublicKeyHex.slice(0, 64)}... (truncated)\n`);

console.log('---------------------------------------------------------------');
console.log('Copy the following into your .env.local file for production:');
console.log('---------------------------------------------------------------');
console.log(`VITE_ED25519_SECRET_HEX=${ed25519SecretHex}`);
console.log(`VITE_MLDSA_SEED_HEX=${mldsaSeedHex}`);
console.log('---------------------------------------------------------------\n');
console.log('CRITICAL SECURITY NOTE:');
console.log('- Never commit .env.local or secret key material to version control.');
console.log('- In enterprise deployments, store secrets in AWS KMS, HashiCorp Vault,');
console.log('  or hardware security modules (HSM / PKCS#11).\n');
