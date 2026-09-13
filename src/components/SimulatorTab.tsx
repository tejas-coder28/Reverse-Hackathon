import React, { useState } from 'react';
import { Play, Loader2, CircleCheck, ShieldAlert, FileJson2 } from 'lucide-react';
import type { ApplicantInput, CooLReceipt } from '../evidence/types';
import { PRESET_APPLICANTS, runCreditModel } from '../model/creditModel';
import { evidenceService } from '../services/evidenceService';
import type { CooLRecordResult } from '../evidence/adapter';
import { Button, Panel, StatusBadge, Field, KeyValueGrid, CopyableValue, SectionHeader, EmptyState, Stamp } from './ui/primitives';
import { decisionTone, shortHash } from './ui/format';

interface SimulatorTabProps {
  onReceiptCreated: (receipt: CooLReceipt) => void;
  onInspectReceipt: (receipt: CooLReceipt) => void;
  onNavigateToReceiptView?: () => void;
}

const PIPELINE_STEPS = [
  { label: 'Model decides', sub: 'CreditRisk-v3' },
  { label: 'State sealed', sub: 'salted SHA-256' },
  { label: 'Institution signs', sub: 'Ed25519' },
  { label: 'Quantum countersign', sub: 'ML-DSA-65' },
  { label: 'Receipt issued', sub: 'enclave + public log' },
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
        eyebrow="Decision Console · New case intake"
        title="Autonomous credit underwriting"
        description="Synthetic applicant data is evaluated by the credit model. At the consequential decision boundary, CooL captures cryptographic evidence and seals a receipt."
        actions={
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="mr-1 text-[10px] uppercase text-ink-500">Preset applicants:</span>
            {PRESET_APPLICANTS.map((app) => (
              <button
                key={app.applicantId}
                type="button"
                onClick={() => handleSelectPreset(app)}
                className={`border px-2 py-1 font-mono text-[11px] transition-colors ${
                  selectedApplicant.applicantId === app.applicantId
                    ? 'border-ink-900 bg-ink-900 text-paper-100'
                    : 'border-rule-500 bg-paper-100 text-ink-700 hover:border-rule-600'
                }`}
                style={{ borderRadius: 2 }}
              >
                #{app.applicantId.slice(-4)}
              </button>
            ))}
          </div>
        }
      />

      <div className="grid gap-4 xl:grid-cols-12">
        {/* ── Intake form ─────────────────────────────────────────────────── */}
        <Panel className="xl:col-span-5" title="Applicant file" meta="synthetic data — salted before storage">
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
                className="input"
              />
            </div>

            <fieldset className="border border-rule-400 p-3" style={{ borderRadius: 2 }}>
              <legend className="px-1 text-[10px] uppercase text-ink-600">Financial profile</legend>
              <div className="grid grid-cols-2 gap-3">
                {numberInput('Annual income ($)', 'annualIncome')}
                {numberInput('Existing debt ($)', 'existingDebt')}
              </div>
            </fieldset>

            <fieldset className="border border-rule-400 p-3" style={{ borderRadius: 2 }}>
              <legend className="px-1 text-[10px] uppercase text-ink-600">Employment</legend>
              <div className="grid grid-cols-2 gap-3">
                {numberInput('Employment (years)', 'employmentYears', '0.1')}
                {numberInput('Credit score', 'creditScore')}
              </div>
            </fieldset>

            <fieldset className="border border-rule-400 p-3" style={{ borderRadius: 2 }}>
              <legend className="px-1 text-[10px] uppercase text-ink-600">Risk indicators</legend>
              <div className="grid grid-cols-2 gap-3">
                {numberInput('Loan requested ($)', 'loanAmountRequested')}
                {numberInput('Collateral ($)', 'collateralValue')}
              </div>
            </fieldset>

            <div className="border-t border-rule-400 pt-4">
              <Panel
                title="The model on file"
                className="bg-paper-50"
                bodyClassName="p-3"
              >
                <KeyValueGrid className="grid-cols-2">
                  <Field label="Model">CreditRisk-v3</Field>
                  <Field label="Version">3.4.1-prod</Field>
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
          <Panel title="Sealing pipeline" meta={pipelineStep === 0 ? 'idle' : `step ${pipelineStep} of 5`}>
            <ol className="grid gap-2 sm:grid-cols-5">
              {PIPELINE_STEPS.map((step, i) => {
                const reached = pipelineStep >= i + 1;
                return (
                  <li
                    key={step.label}
                    className={`border p-2.5 transition-colors ${
                      reached ? 'border-ink-700 bg-paper-200' : 'border-rule-400 bg-paper-100'
                    }`}
                    style={{ borderRadius: 2 }}
                  >
                    <p className={`text-[12px] font-bold leading-snug ${reached ? 'text-ink-900' : 'text-ink-500'}`}>
                      {step.label}
                    </p>
                    <p className="mt-0.5 truncate text-[10px] text-ink-500">{step.sub}</p>
                  </li>
                );
              })}
            </ol>
          </Panel>

          {evaluationResult && recordResult ? (
            <div className="space-y-4">
              {/* Decision outcome */}
              <Panel title="The decision" meta="autonomous model output">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <StatusBadge tone={decisionTone(evaluationResult.decision)}>{evaluationResult.decision}</StatusBadge>
                    <span className="text-xs text-ink-600">
                      Model confidence {((evaluationResult.metadata.confidenceScore ?? 0) * 100).toFixed(1)}%
                    </span>
                  </div>
                  <KeyValueGrid className="w-full sm:w-auto sm:grid-cols-3 sm:gap-6">
                    <Field label="Risk score">{evaluationResult.metadata.creditScore}</Field>
                    <Field label="Debt-to-income">{`${evaluationResult.metadata.dtiRatio}%`}</Field>
                    <Field label="Monthly income">${evaluationResult.metadata.monthlyIncome.toLocaleString()}</Field>
                  </KeyValueGrid>
                </div>
                <p className="mt-3 border-t border-rule-400 pt-3 text-xs leading-relaxed text-ink-700">
                  {evaluationResult.metadata.recommendationReason}
                </p>
                {evaluationResult.metadata.riskFactors.length > 0 && (
                  <ul className="mt-2 space-y-1">
                    {evaluationResult.metadata.riskFactors.map((rf) => (
                      <li key={rf} className="text-[11px] text-annotation-500">
                        · {rf}
                      </li>
                    ))}
                  </ul>
                )}
              </Panel>

              {recordResult.success && currentReceipt ? (
                <Panel
                  title="Evidence sealed"
                  meta={currentReceipt.decisionId}
                  actions={
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" onClick={() => onInspectReceipt(currentReceipt)}>
                        <FileJson2 className="h-4 w-4" />
                        Raw JSON
                      </Button>
                      {onNavigateToReceiptView && (
                        <Button variant="success" onClick={onNavigateToReceiptView}>
                          Open Receipt
                        </Button>
                      )}
                    </div>
                  }
                >
                  <div className="mb-4 flex items-center gap-3">
                    <Stamp size="sm" angle={-3} tone="green" animate>
                      Sealed
                    </Stamp>
                    <p className="text-xs text-ink-600">This receipt is now part of the case file.</p>
                  </div>
                  <ul className="mb-4 space-y-1.5 text-xs text-ink-700">
                    <li className="flex items-center gap-2">
                      <CircleCheck className="h-3.5 w-3.5 text-notary-600" /> Evidence created at the decision boundary
                    </li>
                    <li className="flex items-center gap-2">
                      <CircleCheck className="h-3.5 w-3.5 text-notary-600" /> Cryptographic protection active
                    </li>
                    <li className="flex items-center gap-2">
                      <CircleCheck className="h-3.5 w-3.5 text-notary-600" /> Receipt generated and persisted
                    </li>
                  </ul>
                  <div className="grid gap-3 border-t border-rule-400 pt-3 sm:grid-cols-2">
                    <CopyableValue
                      label="Receipt ID"
                      value={currentReceipt.decisionId}
                      display={shortHash(currentReceipt.decisionId, 22, 8)}
                    />
                    <CopyableValue
                      label="Decision fingerprint (SHA-256)"
                      value={currentReceipt.privacyCommitment.combinedStateHash}
                      display={shortHash(currentReceipt.privacyCommitment.combinedStateHash, 22, 8)}
                    />
                  </div>
                </Panel>
              ) : (
                <Panel className="border-stamp-500" title="Evidence capture failed">
                  <div className="flex items-start gap-3">
                    <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-stamp-500" />
                    <div className="min-w-0">
                      <p className="text-[13px] font-bold text-stamp-600">
                        The decision completed, but its evidence could not be sealed
                      </p>
                      <p className="mt-1 text-xs leading-relaxed text-ink-700">
                        Fail-closed policy: this decision is not marked as cryptographically protected. The result is
                        not presented as verified evidence.
                      </p>
                      <p className="mt-2 break-words border border-rule-400 bg-paper-50 p-2 text-[11px] text-stamp-600" style={{ borderRadius: 2 }}>
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
              description={`Press "Run Decision" to evaluate ${customApplicant.applicantId} and seal the first receipt for this applicant.`}
            />
          )}
        </div>
      </div>
    </div>
  );
};
