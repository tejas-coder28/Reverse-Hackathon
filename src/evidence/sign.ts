import { ed25519 } from '@noble/curves/ed25519.js';
import { ml_dsa65 } from '@noble/post-quantum/ml-dsa.js';
import { bytesToHex, hexToBytes } from '@noble/hashes/utils.js';
import type { HybridSignatures } from './types';

// Deterministic institutional keypairs for evidence signing
// Ed25519 keypair
const SYSTEM_ED25519_SECRET = hexToBytes('7a8f9c0b1e2d3c4b5a6f7e8d9c0b1a2f3e4d5c6b7a8f9c0b1e2d3c4b5a6f7e8d');
const SYSTEM_ED25519_PUBKEY = bytesToHex(ed25519.getPublicKey(SYSTEM_ED25519_SECRET));

// ML-DSA-65 (FIPS 204) Post-Quantum Keypair
const MLDSA_SEED = hexToBytes('0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef');
const SYSTEM_MLDSA65_KEYS = ml_dsa65.keygen(MLDSA_SEED);
const SYSTEM_MLDSA65_PUBKEY = bytesToHex(SYSTEM_MLDSA65_KEYS.publicKey);

/**
 * Sign payload using REAL hybrid cryptography:
 * 1. Real Ed25519 Signature (RFC 8032)
 * 2. Real ML-DSA-65 (Post-Quantum FIPS 204) Signature
 */
export async function createHybridSignatures(payloadHash: string): Promise<HybridSignatures> {
  const msg = new TextEncoder().encode(payloadHash);

  // 1. Real Ed25519 signature
  const edSigBytes = ed25519.sign(msg, SYSTEM_ED25519_SECRET);
  const ed25519SigHex = bytesToHex(edSigBytes);

  // 2. Real ML-DSA-65 (Dilithium FIPS 204) signature
  const mldsaSigBytes = ml_dsa65.sign(msg, SYSTEM_MLDSA65_KEYS.secretKey);
  const mldsa65SigHex = bytesToHex(mldsaSigBytes);

  return {
    ed25519: {
      publicKey: SYSTEM_ED25519_PUBKEY,
      signature: ed25519SigHex,
      algorithm: 'Ed25519',
    },
    mldsa65: {
      publicKey: SYSTEM_MLDSA65_PUBKEY,
      signature: mldsa65SigHex,
      algorithm: 'ML-DSA-65 (FIPS 204)',
    },
  };
}

/**
 * Verifies hybrid Ed25519 + ML-DSA-65 signatures using real crypto library verifiers.
 */
export async function verifyHybridSignatures(
  payloadHash: string,
  signatures: HybridSignatures
): Promise<{ valid: boolean; reason?: string }> {
  if (!signatures || !signatures.ed25519 || !signatures.mldsa65) {
    return { valid: false, reason: 'Missing hybrid signature structures' };
  }

  const msg = new TextEncoder().encode(payloadHash);

  try {
    // 1. Verify Ed25519 signature using real noble-curves verifier
    const edSigBytes = hexToBytes(signatures.ed25519.signature);
    const edPubBytes = hexToBytes(signatures.ed25519.publicKey);
    const edValid = ed25519.verify(edSigBytes, msg, edPubBytes);

    if (!edValid) {
      return { valid: false, reason: 'Real Ed25519 signature verification failed' };
    }

    // 2. Verify ML-DSA-65 post-quantum signature using real noble-post-quantum verifier
    const mldsaSigBytes = hexToBytes(signatures.mldsa65.signature);
    const mldsaPubBytes = hexToBytes(signatures.mldsa65.publicKey);
    const mldsaValid = ml_dsa65.verify(mldsaSigBytes, msg, mldsaPubBytes);

    if (!mldsaValid) {
      return { valid: false, reason: 'Real ML-DSA-65 post-quantum signature verification failed' };
    }

    return { valid: true };
  } catch (err: any) {
    return { valid: false, reason: `Cryptographic signature decoding error: ${err.message}` };
  }
}
