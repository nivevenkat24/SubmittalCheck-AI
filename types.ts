export enum ReviewStatus {
  APPROVED = "APPROVED",
  APPROVED_AS_NOTED = "APPROVED AS NOTED",
  REVISE_AND_RESUBMIT = "REVISE AND RESUBMIT",
  REJECT = "REJECT"
}

export interface CompletenessCheck {
  isComplete: boolean;
  missingFiles: string[];
  missingDetails: string[];
}

export interface ComplianceCheck {
  isCompliant: boolean;
  conflicts: string[];
  applicableClauses: string[];
}

export interface SubmittalData {
  submittalNumber: string;
  contractNumber: string;
  specSection: string;
  description: string;
  manufacturer: string;
  requiredAttachments: string;
  completeness: CompletenessCheck;
  compliance: ComplianceCheck;
  issues: string[];
  recommendedStatus: ReviewStatus;
  draftResponse: string;
  nextSteps: string;
}

export interface SubmittalFile {
  id: string;
  name: string;
  uploadDate: Date;
  status: 'processing' | 'completed' | 'error';
  data?: SubmittalData;
  fileData?: string; // base64
  mimeType?: string;
}