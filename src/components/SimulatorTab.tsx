import React, { useState } from 'react';
import { Play, Loader2, CircleCheck, ShieldAlert, FileJson2 } from 'lucide-react';
import type { ApplicantInput, CooLReceipt } from '../evidence/types';
import { PRESET_APPLICANTS, runCreditModel } from '../model/creditModel';
import { evidenceService } from '../services/evidenceService';
import type { CooLRecordResult } from '../evidence/adapter';
import { Button, Panel, StatusBadge, Field, KeyValueGrid, CopyableValue, SectionHeader, EmptyState } from './ui/primitives';
import { decisionTone, shortHash } from './ui/format';

interface SimulatorTabProps {
  onReceiptCreated: (receipt: CooLReceipt) => void;
  onInspectReceipt: (receipt: CooLReceipt) => void;
  onNavigateToReceiptView?: () => void;
}

const PIPELINE_STEPS = [
  { label: 'AI Decision', sub: 'CreditRisk-v3' },
  { label: 'CooL Boundary', sub: 'cool.record()' },
  { label: 'Commitment', sub: 'H(SALT : in || out)' },
  { label: 'Hybrid Signatures', sub: 'Ed25519 + ML-DSA-65' },
  { label: 'Receipt Sealed', sub: 'TEE + RFC 6962' },
] as const;

export const SimulatorTab: React.FC<SimulatorTabProps> = ({
  onReceiptCreated,
  onInspectReceipt,
  onNavigateToReceiptView,
}) => {
  const [selectedApplicant, setSelectedApplicant] = useState<ApplicantInput>(PRESET_APPLICANTS[0]);
  const [customApplicant, setCustomApplicant] = useState<ApplicantInput>({ ...PRESET_APPLICANTS[0] });
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [activeStep, setActiveStep] = useState<number>(0);
  const [currentReceipt, setCurrentReceipt] = useState<CooLReceipt | null>(null);
  const [evaluationResult, setEvaluationResult] = useState<ReturnType<typeof runCreditModel> | null>(null);
  const [recordResult, setRecordResult] = useState<CooLRecordResult | null>(null);

  const handleSelectPreset = (app: ApplicantInput) => {
    setSelectedApplicant(app);
    setCustomApplicant({ ...app });
    setCurrentReceipt(null);
    setEvaluationResult(null);
    setRecordResult(null);
    setActiveStep(0);
  };

  const handleRunEvaluation = async () => {
    setIsEvaluating(true);
    setCurrentReceipt(null);
    setRecordResult(null);
    setActiveStep(1);

    setTimeout(() => setActiveStep(2), 400);

    setTimeout(async () => {
      setActiveStep(3);
      const { decisionResult, recordResult: res, receipt } = await evidenceService.evaluateAndRecord(customApplicant);
      setEvaluationResult(decisionResult);
      setRecordResult(res);

      if (res.success && receipt) {
        setCurrentReceipt(receipt);
        onReceiptCreated(receipt);
      }

      setActiveStep(4);
      setIsEvaluating(false);
    }, 900);
  };

  const pipelineStep = activeStep >= 4 && !isEvaluating ? 5 : Math.max(activeStep, 0);

  const numberInput = (label: string, key: keyof ApplicantInput, step?: string) => (
    <div>
      <label className="label" htmlFor={`fld-${key}`}>
        {label}
      </label>
      <input
        id={`fld-${key}`}
        type="number"
        step={step}
        value={customApplicant[key] as number}
        onChange={(e) => setCustomApplicant({ ...customApplicant, [key]: Number(e.target.value) })}
        className="input"
      />
    </div>
  );

  return (
    <div className="space-y-6 pb-12">
      <SectionHeader
        eyebrow="Decision Console"
        title="Autonomous credit underwriting"
        description="Synthetic applicant data is evaluated by the credit model. At the consequential decision boundary, CooL captures cryptographic evidence and seals a receipt."
        actions={
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="mr-1 font-mono text-[10px] uppercase tracking-wider text-ink-400">Preset:</span>
            {PRESET_APPLICANTS.map((app, i) => (
              <button
                key={app.applicantId}
                type="button"
                onClick={() => handleSelectPreset(app)}
                className={`rounded border px-2 py-1 font-mono text-[11px] transition-colors ${
                  selectedApplicant.applicantId === app.applicantId
                    ? 'border-accent-500 bg-accent-950 text-accent-300'
                    : 'border-line-700 bg-base-850 text-ink-300 hover:border-line-600 hover:text-ink-100'
                }`}
              >
                #{app.applicantId.slice(-4)}
                {i === 0 ? '' : ''}
              </button>
            ))}
          </div>
        }
      />

      <div className="grid gap-4 xl:grid-cols-12">
        {/* ── Applicant form ──────────────────────────────────────────────── */}
        <Panel className="xl:col-span-5" title="Applicant" meta="synthetic data — salted before storage">
          <div className="space-y-4">
            <div>
              <label className="label" htmlFor="fld-id">
                Applicant identifier
              </label>
              <input
                id="fld-id"
                type="text"
                value={customApplicant.applicantId}
                onChange={(e) => setCustomApplicant({ ...customApplicant, applicantId: e.target.value })}
                className="input font-mono"
              />
            </div>

            <fieldset className="rounded-md border border-line-700 p-3">
              <legend className="px-1 font-mono text-[10px] uppercase tracking-wider text-ink-400">
                Financial profile
              </legend>
              <div className="grid grid-cols-2 gap-3">
                {numberInput('Annual income ($)', 'annualIncome')}
                {numberInput('Existing debt ($)', 'existingDebt')}
              </div>
            </fieldset>

            <fieldset className="rounded-md border border-line-700 p-3">
              <legend className="px-1 font-mono text-[10px] uppercase tracking-wider text-ink-400">Employment</legend>
              <div className="grid grid-cols-2 gap-3">
                {numberInput('Employment (years)', 'employmentYears', '0.1')}
                {numberInput('Credit score', 'creditScore')}
              </div>
            </fieldset>

            <fieldset className="rounded-md border border-line-700 p-3">
              <legend className="px-1 font-mono text-[10px] uppercase tracking-wider text-ink-400">Risk indicators</legend>
              <div className="grid grid-cols-2 gap-3">
                {numberInput('Loan requested ($)', 'loanAmountRequested')}
                {numberInput('Collateral ($)', 'collateralValue')}
              </div>
            </fieldset>

            <div className="border-t border-line-700 pt-4">
              <Panel
                title="Model"
                className="border-line-700/60"
                bodyClassName="p-3"
              >
                <KeyValueGrid className="grid-cols-2">
                  <Field label="Model">{`CreditRisk-v3`}</Field>
                  <Field label="Version">{`3.4.1-prod`}</Field>
                </KeyValueGrid>
              </Panel>
            </div>

            <Button variant="primary" className="w-full py-2.5" onClick={handleRunEvaluation} disabled={isEvaluating}>
              {isEvaluating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Evaluating &amp; sealing evidence…
                </>
              ) : (
                <>
                  <Play className="h-4 w-4" />
                  Run Decision
                </>
              )}
            </Button>
          </div>
        </Panel>

        {/* ── Pipeline + results ──────────────────────────────────────────── */}
        <div className="space-y-4 xl:col-span-7">
          <Panel title="Evidence capture pipeline" meta={pipelineStep === 0 ? 'idle' : `step ${pipelineStep} of 5`}>
            <ol className="grid gap-2 sm:grid-cols-5">
              {PIPELINE_STEPS.map((step, i) => {
                const reached = pipelineStep >= i + 1;
                return (
                  <li
                    key={step.label}
                    className={`rounded-md border p-2.5 transition-colors ${
                      reached ? 'border-accent-600/60 bg-accent-950/50' : 'border-line-700 bg-base-850'
                    }`}
                  >
                    <span className={`font-mono text-[10px] ${reached ? 'text-accent-300' : 'text-ink-500'}`}>
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <p className={`mt-0.5 text-[12px] font-medium leading-snug ${reached ? 'text-ink-100' : 'text-ink-400'}`}>
                      {step.label}
                    </p>
                    <p className="mt-0.5 truncate font-mono text-[10px] text-ink-500">{step.sub}</p>
                  </li>
                );
              })}
            </ol>
          </Panel>

          {evaluationResult && recordResult ? (
            <div className="space-y-4">
              {/* Decision outcome */}
              <Panel title="Decision" meta="autonomous model output">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <StatusBadge tone={decisionTone(evaluationResult.decision)}>{evaluationResult.decision}</StatusBadge>
                    <span className="font-mono text-xs text-ink-300">
                      Confidence {((evaluationResult.metadata.confidenceScore ?? 0) * 100).toFixed(1)}%
                    </span>
                  </div>
                  <KeyValueGrid className="w-full sm:w-auto sm:grid-cols-3 sm:gap-6">
                    <Field label="Risk score">{evaluationResult.metadata.creditScore}</Field>
                    <Field label="DTI">{`${evaluationResult.metadata.dtiRatio}%`}</Field>
                    <Field label="Monthly income">${evaluationResult.metadata.monthlyIncome.toLocaleString()}</Field>
                  </KeyValueGrid>
                </div>
                <p className="mt-3 border-t border-line-700/60 pt-3 text-xs leading-relaxed text-ink-300">
                  {evaluationResult.metadata.recommendationReason}
                </p>
                {evaluationResult.metadata.riskFactors.length > 0 && (
                  <ul className="mt-2 space-y-1">
                    {evaluationResult.metadata.riskFactors.map((rf) => (
                      <li key={rf} className="font-mono text-[11px] text-warn-300">
                        · {rf}
                      </li>
                    ))}
                  </ul>
                )}
              </Panel>

              {recordResult.success && currentReceipt ? (
                <Panel
                  title="Evidence captured"
                  meta={currentReceipt.decisionId}
                  actions={
                    <div className="flex gap-2">
                      <Button variant="ghost" onClick={() => onInspectReceipt(currentReceipt)}>
                        <FileJson2 className="h-4 w-4" />
                        Raw JSON
                      </Button>
                      {onNavigateToReceiptView && (
                        <Button variant="success" onClick={onNavigateToReceiptView}>
                          Open receipt
                        </Button>
                      )}
                    </div>
                  }
                >
                  <ul className="mb-4 space-y-1.5 text-xs">
                    <li className="flex items-center gap-2 text-ok-300">
                      <CircleCheck className="h-3.5 w-3.5 text-ok-400" /> Evidence created at the decision boundary
                    </li>
                    <li className="flex items-center gap-2 text-ok-300">
                      <CircleCheck className="h-3.5 w-3.5 text-ok-400" /> Cryptographic protection active
                    </li>
                    <li className="flex items-center gap-2 text-ok-300">
                      <CircleCheck className="h-3.5 w-3.5 text-ok-400" /> Receipt generated and persisted
                    </li>
                  </ul>
                  <div className="grid gap-3 border-t border-line-700/60 pt-3 sm:grid-cols-2">
                    <CopyableValue
                      label="Receipt ID"
                      value={currentReceipt.decisionId}
                      display={shortHash(currentReceipt.decisionId, 22, 8)}
                    />
                    <CopyableValue
                      label="SHA-256 combined commitment"
                      value={currentReceipt.privacyCommitment.combinedStateHash}
                      display={shortHash(currentReceipt.privacyCommitment.combinedStateHash, 22, 8)}
                    />
                  </div>
                </Panel>
              ) : (
                <Panel className="border-bad-500/50" title="Evidence capture failed">
                  <div className="flex items-start gap-3">
                    <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-bad-400" />
                    <div className="min-w-0">
                      <p className="text-[13px] font-medium text-bad-300">
                        Decision completed — evidence protection failed
                      </p>
                      <p className="mt-1 text-xs leading-relaxed text-ink-300">
                        Fail-closed policy: this decision is <span className="font-mono">not</span> marked as
                        cryptographically protected. The decision result is not presented as verified evidence.
                      </p>
                      <p className="mt-2 break-words rounded border border-line-700 bg-base-950 p-2 font-mono text-[11px] text-bad-300">
                        {recordResult.error || 'Crypto commitment generation failed'}
                      </p>
                    </div>
                  </div>
                </Panel>
              )}
            </div>
          ) : (
            <EmptyState
              title="No decision executed yet"
              description={`Press "Run Decision" to evaluate ${customApplicant.applicantId} and capture a CooL evidence receipt.`}
            />
          )}
        </div>
      </div>
    </div>
  );
};
