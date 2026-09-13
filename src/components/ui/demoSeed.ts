import type { CooLReceipt } from '../../cool/types';
import { evidenceService } from '../../services/evidenceService';

/*
 * Demo seeding must run exactly once per page load. React StrictMode (dev)
 * invokes effects twice, and several tabs trigger seeding independently;
 * without this memo, concurrent calls each see an empty ledger and seed
 * duplicate receipts into the transparency log.
 */
let seedPromise: Promise<CooLReceipt> | null = null;

export function seedDemoOnce(): Promise<CooLReceipt> {
  if (!seedPromise) {
    seedPromise = evidenceService.seedDemoIfEmpty().catch((err) => {
      seedPromise = null; // allow retry on a later call
      throw err;
    });
  }
  return seedPromise;
}
