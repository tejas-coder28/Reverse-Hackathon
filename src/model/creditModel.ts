/**
 * Autonomous AI Credit Evaluation Engine
 * 
 * CORE EVIDENCE PIPELINE STAGE: AI DECISION GENERATION
 * 
 * WHY CooL IS USED HERE:
 * This is the consequential decision boundary. The credit model evaluates synthetic applicant
 * parameters (income, debt, credit score, loan amount) and outputs a binding underwriting result.
 * 
 * Evidence is committed immediately following this decision step so the application can later
 * demonstrate exactly what was evaluated and decided at decision time, preventing any post-hoc
 * alteration or repudiation of AI decision logic.
 */

import type { ApplicantInput, DecisionMetadata, DecisionResult } from '../cool/types';

export interface CreditEvaluationResult {
  decision: DecisionResult;
  modelId: string;
  modelVersion: string;
  metadata: DecisionMetadata;
}

export const PRESET_APPLICANTS: ApplicantInput[] = [
  {
    applicantId: 'Synthetic Applicant #8842',
    name: 'Sarah Chen (Synthetic #8842)',
    annualIncome: 145000,
    existingDebt: 12000,
    creditScore: 785,
    loanAmountRequested: 35000,
    collateralValue: 85000,
    employmentYears: 6.5,
  },
  {
    applicantId: 'Synthetic Applicant #8843',
    name: 'Marcus Vance (Synthetic #8843)',
    annualIncome: 58000,
    existingDebt: 28000,
    creditScore: 635,
    loanAmountRequested: 42000,
    collateralValue: 15000,
    employmentYears: 2.1,
  },
  {
    applicantId: 'Synthetic Applicant #8844',
    name: 'Elena Rostova (Synthetic #8844)',
    annualIncome: 28000,
    existingDebt: 34000,
    creditScore: 512,
    loanAmountRequested: 55000,
    collateralValue: 0,
    employmentYears: 0.8,
  },
];

export function runCreditModel(applicant: ApplicantInput): CreditEvaluationResult {
  const monthlyIncome = applicant.annualIncome / 12;
  const dtiRatio = (applicant.existingDebt / applicant.annualIncome) * 100;
  const riskFactors: string[] = [];

  let decision: DecisionResult = 'APPROVED';
  let confidenceScore = 0.94;
  let recommendationReason = 'Exceptional credit profile with strong Debt-To-Income buffer.';

  if (dtiRatio > 40) {
    riskFactors.push(`High Debt-to-Income ratio (${dtiRatio.toFixed(1)}% > 40%)`);
  }
  if (applicant.creditScore < 650) {
    riskFactors.push(`Subprime credit score (${applicant.creditScore} < 650)`);
  }
  if (applicant.employmentYears < 2) {
    riskFactors.push(`Limited employment history (${applicant.employmentYears} years < 2 years)`);
  }
  if (applicant.loanAmountRequested > applicant.annualIncome * 0.8) {
    riskFactors.push(`High loan-to-income request ratio`);
  }

  if (applicant.creditScore >= 720 && dtiRatio <= 30) {
    decision = 'APPROVED';
    confidenceScore = 0.96;
    recommendationReason = 'Instant Approval: Outstanding credit rating and low leverage.';
  } else if (applicant.creditScore < 580 || dtiRatio > 55) {
    decision = 'REJECTED';
    confidenceScore = 0.91;
    recommendationReason = 'Declined: Credit score or debt-to-income ratio exceeds institutional risk tolerance.';
  } else {
    decision = 'MANUAL_REVIEW';
    confidenceScore = 0.78;
    recommendationReason = 'Escalated to Credit Officer: Mixed credit indicators require secondary underwriter assessment.';
  }

  return {
    decision,
    modelId: 'CreditRisk-v3',
    modelVersion: '3.4.1-prod',
    metadata: {
      creditScore: applicant.creditScore,
      monthlyIncome: Math.round(monthlyIncome),
      existingDebt: applicant.existingDebt,
      dtiRatio: parseFloat(dtiRatio.toFixed(1)),
      loanAmount: applicant.loanAmountRequested,
      confidenceScore,
      riskFactors,
      recommendationReason,
    },
  };
}
