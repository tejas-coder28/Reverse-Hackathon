import type { TransparencyLogProof } from '../types';
import { sha256Hex } from '../hash';

let transparencyLogStore: string[] = [];

export function resetTransparencyLog(): void {
  transparencyLogStore = [];
}

export async function appendToTransparencyLog(combinedStateHash: string): Promise<TransparencyLogProof> {
  const leafHash = await sha256Hex(`00${combinedStateHash}`);
  transparencyLogStore.push(leafHash);

  const leafIndex = transparencyLogStore.length - 1;
  const treeSize = transparencyLogStore.length;

  const merkleRoot = await computeMerkleRoot(transparencyLogStore);
  const inclusionProof = await generateInclusionProof(leafIndex, transparencyLogStore);

  return {
    logId: 'nbfc-credit-transparency-v1',
    treeSize,
    leafIndex,
    leafHash,
    merkleRoot,
    inclusionProof,
  };
}

export async function computeMerkleRoot(leaves: string[]): Promise<string> {
  if (leaves.length === 0) return await sha256Hex('EMPTY_TREE');
  if (leaves.length === 1) return leaves[0];

  let currentLevel = [...leaves];
  while (currentLevel.length > 1) {
    const nextLevel: string[] = [];
    for (let i = 0; i < currentLevel.length; i += 2) {
      if (i + 1 < currentLevel.length) {
        const combined = await sha256Hex(`01${currentLevel[i]}${currentLevel[i + 1]}`);
        nextLevel.push(combined);
      } else {
        nextLevel.push(currentLevel[i]);
      }
    }
    currentLevel = nextLevel;
  }
  return currentLevel[0];
}

async function generateInclusionProof(leafIndex: number, leaves: string[]): Promise<string[]> {
  const proof: string[] = [];
  if (leaves.length <= 1) return proof;

  let index = leafIndex;
  let currentLevel = [...leaves];

  while (currentLevel.length > 1) {
    const siblingIndex = index % 2 === 0 ? index + 1 : index - 1;
    if (siblingIndex < currentLevel.length) {
      proof.push(currentLevel[siblingIndex]);
    }

    const nextLevel: string[] = [];
    for (let i = 0; i < currentLevel.length; i += 2) {
      if (i + 1 < currentLevel.length) {
        const combined = await sha256Hex(`01${currentLevel[i]}${currentLevel[i + 1]}`);
        nextLevel.push(combined);
      } else {
        nextLevel.push(currentLevel[i]);
      }
    }
    currentLevel = nextLevel;
    index = Math.floor(index / 2);
  }

  return proof;
}

export async function verifyTransparencyLog(
  proof: TransparencyLogProof,
  combinedStateHash: string
): Promise<{ valid: boolean; reason?: string }> {
  const expectedLeaf = await sha256Hex(`00${combinedStateHash}`);
  if (proof.leafHash !== expectedLeaf) {
    return {
      valid: false,
      reason: `Leaf hash mismatch. Calculated leaf (${expectedLeaf.substring(0, 12)}...) != Log leaf (${proof.leafHash.substring(0, 12)}...)`,
    };
  }

  if (proof.treeSize === 1) {
    if (proof.inclusionProof.length > 0) {
      return { valid: false, reason: 'Single-node tree must not carry inclusion proof elements.' };
    }
    if (proof.merkleRoot !== expectedLeaf) {
      return { valid: false, reason: 'Merkle root mismatch for single-node tree.' };
    }
    return { valid: true };
  }

  /*
   * Replay the inclusion proof level-by-level, mirroring the exact tree shape
   * that appendToTransparencyLog/generateInclusionProof built. Levels whose
   * node count is odd end with an unpaired (odd-tail) node that is carried up
   * WITHOUT a sibling hash; such levels contribute no proof element. Replaying
   * one proof entry per level (as before) diverged from the generator for any
   * tree with an odd number of leaves >= 3, producing false tamper verdicts.
   */
  let currentHash = expectedLeaf;
  let index = proof.leafIndex;
  let levelSize = proof.treeSize;
  let siblingIdx = 0;

  while (levelSize > 1 && siblingIdx < proof.inclusionProof.length) {
    if (index % 2 === 1) {
      // Node is right-paired: left sibling must be consumed.
      const siblingHash = proof.inclusionProof[siblingIdx];
      currentHash = await sha256Hex(`01${siblingHash}${currentHash}`);
      siblingIdx++;
    } else if (index + 1 < levelSize) {
      // Node is left-paired and a right sibling exists: consume it.
      const siblingHash = proof.inclusionProof[siblingIdx];
      currentHash = await sha256Hex(`01${currentHash}${siblingHash}`);
      siblingIdx++;
    }
    // else: unpaired odd-tail node — carried up without a proof element.

    index = Math.floor(index / 2);
    levelSize = Math.ceil(levelSize / 2);
  }

  // Leftover proof entries mean the proof does not match this tree shape.
  if (siblingIdx !== proof.inclusionProof.length) {
    return {
      valid: false,
      reason: `Inclusion proof length mismatch for tree of size ${proof.treeSize}.`,
    };
  }

  if (currentHash !== proof.merkleRoot) {
    return {
      valid: false,
      reason: `Merkle tree root mismatch. Recalculated (${currentHash.substring(0, 12)}...) != Claimed (${proof.merkleRoot.substring(0, 12)}...)`,
    };
  }

  return { valid: true };
}
