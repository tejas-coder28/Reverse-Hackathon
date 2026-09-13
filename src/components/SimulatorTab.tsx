import React, { useState } from 'react';
import { Cpu, ShieldCheck, UserCheck, Play, FileText, CheckCircle2, AlertCircle, XCircle, Code, ShieldAlert, ArrowRight, Sparkles } from 'lucide-react';
import type { ApplicantInput, CooLReceipt } from '../cool/types';
import { PRESET_APPLICANTS, runCreditModel } from '../model/creditModel';
import { evidenceService } from '../services/evidenceService';
import type { CooLRecordResult } from '../cool/adapter';

interface SimulatorTabProps {
  onReceiptCreated: (receipt: CooLReceipt) => void;
  onInspectReceipt: (receipt: CooLReceipt) => void;
  onNavigateToReceiptView?: () => void;
}

export const SimulatorTab: React.FC<SimulatorTabProps> = ({ onReceiptCreated, onInspectReceipt, onNavigateToReceiptView }) => {
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
    setActiveStep(1); // Step 1: AI Decision

    setTimeout(() => {
      setActiveStep(2); // Step 2: CooL Recording Boundary
    }, 400);

    setTimeout(async () => {
      setActiveStep(3); // Step 3: Evidence Committed
      const { decisionResult, recordResult: res, receipt } = await evidenceService.evaluateAndRecord(customApplicant);
      setEvaluationResult(decisionResult);
      setRecordResult(res);

      if (res.success && receipt) {
        setCurrentReceipt(receipt);
        onReceiptCreated(receipt);
      }

      setActiveStep(4); // Step 4: Signed Receipt & Auditable
      setIsEvaluating(false);
    }, 900);
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Console Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-mono font-bold tracking-wider text-cyan-400 uppercase mb-1">
            DECISION CONSOLE
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-2 font-sans">
            <Cpu className="h-7 w-7 text-cyan-400" />
            <span>Autonomous AI Credit Underwriting Console</span>
          </h2>
          <p className="text-xs text-slate-400 font-mono">
            Model: <code className="text-cyan-300">CreditRisk-v3</code> | Version: <code className="text-cyan-300">3.4.1-prod</code> | Domain: <code className="text-slate-300">nbfc.credit_scoring</code>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-slate-400 font-medium font-mono">Select Synthetic Profile:</span>
          {PRESET_APPLICANTS.map((app) => (
            <button
              key={app.applicantId}
              onClick={() => handleSelectPreset(app)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold font-mono transition-all ${
                selectedApplicant.applicantId === app.applicantId
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/25'
                  : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
              }`}
            >
              {app.applicantId}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Synthetic Input Form */}
        <div className="lg:col-span-5 space-y-6 rounded-3xl border border-slate-800 bg-slate-900/80 p-6 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="font-bold text-white flex items-center gap-2 text-sm">
              <UserCheck className="h-4 w-4 text-cyan-400" />
              <span>Synthetic Applicant Profile</span>
            </h3>
            <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/80 border border-emerald-800/60 px-2.5 py-0.5 rounded-full font-semibold">
              Salted Privacy Active
            </span>
          </div>

          <div className="space-y-4 text-xs font-mono">
            <div>
              <label className="block text-slate-400 mb-1">APPLICANT IDENTIFIER</label>
              <input
                type="text"
                value={customApplicant.applicantId}
                onChange={(e) => setCustomApplicant({ ...customApplicant, applicantId: e.target.value })}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-white focus:border-cyan-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 mb-1">ANNUAL INCOME ($)</label>
                <input
                  type="number"
                  value={customApplicant.annualIncome}
                  onChange={(e) => setCustomApplicant({ ...customApplicant, annualIncome: Number(e.target.value) })}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">EXISTING DEBT ($)</label>
                <input
                  type="number"
                  value={customApplicant.existingDebt}
                  onChange={(e) => setCustomApplicant({ ...customApplicant, existingDebt: Number(e.target.value) })}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white focus:border-cyan-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 mb-1">CREDIT SCORE</label>
                <input
                  type="number"
                  value={customApplicant.creditScore}
                  onChange={(e) => setCustomApplicant({ ...customApplicant, creditScore: Number(e.target.value) })}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">LOAN REQUESTED ($)</label>
                <input
                  type="number"
                  value={customApplicant.loanAmountRequested}
                  onChange={(e) => setCustomApplicant({ ...customApplicant, loanAmountRequested: Number(e.target.value) })}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white focus:border-cyan-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 mb-1">COLLATERAL ($)</label>
                <input
                  type="number"
                  value={customApplicant.collateralValue}
                  onChange={(e) => setCustomApplicant({ ...customApplicant, collateralValue: Number(e.target.value) })}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">EMPLOYMENT (YRS)</label>
                <input
                  type="number"
                  step="0.1"
                  value={customApplicant.employmentYears}
                  onChange={(e) => setCustomApplicant({ ...customApplicant, employmentYears: Number(e.target.value) })}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white focus:border-cyan-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* PROMINENT "RUN AI DECISION" BUTTON */}
          <button
            onClick={handleRunEvaluation}
            disabled={isEvaluating}
            className="w-full flex items-center justify-center space-x-2 rounded-2xl bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 px-6 py-4 font-black text-white shadow-xl shadow-cyan-500/30 transition-all hover:scale-[1.01] hover:shadow-cyan-500/50 disabled:opacity-50 text-sm tracking-wide uppercase"
          >
            {isEvaluating ? (
              <>
                <div className="h-5 w-5 animate-spin rounded-full border-3 border-white border-t-transparent" />
                <span>Executing Credit Model & CooL Boundary...</span>
              </>
            ) : (
              <>
                <Play className="h-5 w-5 fill-white shrink-0" />
                <span>RUN AI DECISION</span>
              </>
            )}
          </button>
        </div>

        {/* Right Column: Visual Pipeline Animation & Decision Results */}
        <div className="lg:col-span-7 space-y-6">
          {/* VISUAL PIPELINE ANIMATION (AI DECISION → COOL → EVIDENCE COMMITTED → SIGNED RECEIPT → AUDITABLE) */}
          <div className="rounded-3xl border border-cyan-500/30 bg-slate-950 p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2 text-xs font-mono text-cyan-400 font-bold uppercase">
                <Sparkles className="h-4 w-4" />
                <span>REAL-TIME EVIDENCE GENERATION PIPELINE</span>
              </div>
              <span className="text-[10px] font-mono text-slate-400">EXHIBIT 04 PIPELINE</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 font-mono text-[11px] text-center">
              {/* Step 1 */}
              <div className={`p-2.5 rounded-xl border transition-all ${
                activeStep >= 1 ? 'border-cyan-500 bg-cyan-950/60 text-cyan-300 font-bold shadow-md shadow-cyan-950/40' : 'border-slate-800 bg-slate-900/40 text-slate-500'
              }`}>
                <div>AI DECISION</div>
                <div className="text-[9px] text-slate-400 font-normal">CreditRisk-v3</div>
              </div>

              {/* Step 2 — PROMINENT COOL STEP */}
              <div className={`p-2.5 rounded-xl border transition-all ${
                activeStep >= 2 ? 'border-emerald-400 bg-emerald-950/90 text-emerald-300 font-black shadow-lg shadow-emerald-950/60 ring-2 ring-emerald-500/50' : 'border-slate-800 bg-slate-900/40 text-slate-500'
              }`}>
                <div className="text-emerald-400 font-bold">COOL</div>
                <div className="text-[9px] text-emerald-300 font-bold">dstack-TEE</div>
              </div>

              {/* Step 3 */}
              <div className={`p-2.5 rounded-xl border transition-all ${
                activeStep >= 3 ? 'border-cyan-500 bg-cyan-950/60 text-cyan-300 font-bold shadow-md shadow-cyan-950/40' : 'border-slate-800 bg-slate-900/40 text-slate-500'
              }`}>
                <div>EVIDENCE COMMITTED</div>
                <div className="text-[9px] text-slate-400 font-normal">Salted Hash</div>
              </div>

              {/* Step 4 */}
              <div className={`p-2.5 rounded-xl border transition-all ${
                activeStep >= 4 ? 'border-blue-500 bg-blue-950/60 text-blue-300 font-bold shadow-md shadow-blue-950/40' : 'border-slate-800 bg-slate-900/40 text-slate-500'
              }`}>
                <div>SIGNED RECEIPT</div>
                <div className="text-[9px] text-slate-400 font-normal">Ed25519+PQ</div>
              </div>

              {/* Step 5 */}
              <div className={`p-2.5 rounded-xl border transition-all ${
                activeStep >= 4 ? 'border-emerald-500 bg-emerald-950/60 text-emerald-300 font-bold shadow-md shadow-emerald-950/40' : 'border-slate-800 bg-slate-900/40 text-slate-500'
              }`}>
                <div>AUDITABLE</div>
                <div className="text-[9px] text-slate-400 font-normal">RFC 6962</div>
              </div>
            </div>
          </div>

          {evaluationResult && recordResult ? (
            <div className="space-y-6">
              {/* AI Decision Outcome Card */}
              <div className={`rounded-3xl border p-6 space-y-4 shadow-2xl ${
                evaluationResult.decision === 'APPROVED'
                  ? 'border-emerald-500/40 bg-emerald-950/30'
                  : evaluationResult.decision === 'MANUAL_REVIEW'
                  ? 'border-amber-500/40 bg-amber-950/30'
                  : 'border-rose-500/40 bg-rose-950/30'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {evaluationResult.decision === 'APPROVED' && <CheckCircle2 className="h-9 w-9 text-emerald-400" />}
                    {evaluationResult.decision === 'MANUAL_REVIEW' && <AlertCircle className="h-9 w-9 text-amber-400" />}
                    {evaluationResult.decision === 'REJECTED' && <XCircle className="h-9 w-9 text-rose-400" />}
                    <div>
                      <div className="text-xs uppercase font-mono tracking-wider text-slate-400">Autonomous AI Decision</div>
                      <div className={`text-3xl font-black font-mono tracking-tight ${
                        evaluationResult.decision === 'APPROVED' ? 'text-emerald-400' :
                        evaluationResult.decision === 'MANUAL_REVIEW' ? 'text-amber-400' : 'text-rose-400'
                      }`}>
                        {evaluationResult.decision}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs text-slate-400 font-mono">Confidence Score</span>
                    <div className="text-xl font-black font-mono text-cyan-300">
                      {(evaluationResult.metadata.confidenceScore * 100).toFixed(1)}%
                    </div>
                  </div>
                </div>

                <p className="text-xs text-slate-300 border-t border-slate-800/80 pt-3 leading-relaxed">
                  <strong>Recommendation Reason:</strong> {evaluationResult.metadata.recommendationReason}
                </p>
              </div>

              {/* FLOW 1 — EVIDENCE CREATION BADGE & STATUS */}
              {recordResult.success && currentReceipt ? (
                <div className="rounded-3xl border border-cyan-500/40 bg-slate-900/90 p-6 space-y-4 shadow-2xl">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div>
                      <div className="text-xs font-mono font-bold tracking-wider text-cyan-400 uppercase">
                        FLOW 1 — CREATE EVIDENCE
                      </div>
                      <h4 className="font-bold text-white text-lg flex items-center gap-2">
                        <ShieldCheck className="h-6 w-6 text-emerald-400" />
                        <span>DECISION RECORDED</span>
                      </h4>
                    </div>
                    <span className="font-mono text-xs text-cyan-300 bg-cyan-950 px-3 py-1 rounded-xl border border-cyan-800/60 font-bold">
                      {currentReceipt.decisionId}
                    </span>
                  </div>

                  {/* Flow 1 Required Checkmarks */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
                    <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-800/70 text-emerald-300 flex items-center gap-2 font-semibold">
                      <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                      <span>✓ Evidence created</span>
                    </div>
                    <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-800/70 text-emerald-300 flex items-center gap-2 font-semibold">
                      <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                      <span>✓ Cryptographic protection active</span>
                    </div>
                    <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-800/70 text-emerald-300 flex items-center gap-2 font-semibold">
                      <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                      <span>✓ Receipt generated</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                    <button
                      onClick={() => onInspectReceipt(currentReceipt)}
                      className="flex items-center space-x-2 rounded-xl bg-slate-800 hover:bg-slate-700 px-4 py-2.5 text-xs font-semibold text-cyan-300 transition-all border border-cyan-800/40"
                    >
                      <Code className="h-4 w-4" />
                      <span>Inspect Raw Receipt JSON</span>
                    </button>

                    {onNavigateToReceiptView && (
                      <button
                        onClick={onNavigateToReceiptView}
                        className="flex items-center space-x-2 rounded-xl bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-emerald-500/20 transition-all"
                      >
                        <span>Open & Verify Evidence Receipt View</span>
                        <ArrowRight className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                /* FAIL-CLOSED SECURITY WARNING BANNER */
                <div className="rounded-3xl border border-rose-500/60 bg-rose-950/40 p-6 space-y-3 shadow-2xl">
                  <div className="flex items-center space-x-3 text-rose-400 font-mono text-base font-bold">
                    <ShieldAlert className="h-6 w-6 shrink-0" />
                    <span>Decision completed — evidence protection failed</span>
                  </div>
                  <p className="text-xs text-rose-200/90 leading-relaxed font-mono">
                    SECURITY WARNING: CooL evidence recording encountered an error during decision execution.
                    Under our fail-closed security principle, this decision is NOT marked as cryptographically protected or verified.
                  </p>
                  <div className="text-[11px] font-mono text-rose-400 bg-slate-950 p-2.5 rounded-xl border border-rose-900/60">
                    Error Detail: {recordResult.error || 'Crypto commitment generation failed'}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-800 bg-slate-900/30 p-14 text-center space-y-4">
              <FileText className="h-12 w-12 text-slate-600" />
              <h4 className="text-base font-semibold text-slate-300">No Active AI Decision Generated Yet</h4>
              <p className="text-xs text-slate-500 max-w-md leading-relaxed font-mono">
                Click <strong className="text-cyan-400 font-bold">"RUN AI DECISION"</strong> on the left panel to execute credit evaluation on Synthetic Applicant #{customApplicant.applicantId} and generate CooL cryptographic evidence.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
