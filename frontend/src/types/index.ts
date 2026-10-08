export type Role = 'ROLE_SUPER_ADMIN' | 'ROLE_HOSPITAL_ADMIN' | 'ROLE_HOSPITAL_STAFF' | 'ROLE_PATIENT';

export interface User {
  id: number;
  username: string;
  fullName: string;
  email?: string;
  phoneNumber: string;
  role: Role;
  hospitalId?: number;
  hospitalName?: string;
  isActive?: boolean;
}

export interface LoginResponse {
  token: string;
  type: string;
  id: number;
  username: string;
  fullName: string;
  email?: string;
  role: Role;
  hospitalId?: number;
  hospitalName?: string;
}

export interface Hospital {
  id: number;
  name: string;
  code: string;
  type: string;
  address: string;
  district: string;
  state: string;
  contactNumber: string;
  isActive: boolean;
}

export interface Department {
  id: number;
  name: string;
  code: string;
  description?: string;
  isActive: boolean;
}

export interface HospitalDepartment {
  id: number;
  hospitalId: number;
  hospitalName: string;
  departmentId: number;
  departmentName: string;
  departmentCode: string;
  dailyTokenLimit: number;
  opdStartTime: string;
  opdEndTime: string;
  slotDurationMinutes: number;
  bookedCount: number;
  availableCount: number;
  isAvailable: boolean;
}

export interface AvailabilityResponse {
  hospitalId: number;
  hospitalName: string;
  departmentId: number;
  departmentName: string;
  date: string;
  totalCapacity: number;
  bookedCount: number;
  remainingCount: number;
  isAvailable: boolean;
  opdOpen: boolean;
  nextEstimatedTime: string;
}

export type TokenStatus = 
  | 'BOOKED' 
  | 'CONFIRMED' 
  | 'CALLED' 
  | 'COMPLETED' 
  | 'CANCELLED' 
  | 'RESCHEDULED' 
  | 'EXPIRED' 
  | 'NO_SHOW';

export interface Token {
  id: number;
  tokenNumber: string;
  patientId: number;
  patientName: string;
  patientMobile: string;
  abhaId?: string;
  hospitalId: number;
  hospitalName: string;
  departmentId: number;
  departmentName: string;
  departmentCode: string;
  bookingDate: string;
  bookingTime: string;
  estimatedTime: string;
  status: TokenStatus;
  triageSeverity?: string;
  chiefComplaint?: string;
  smsSent: boolean;
  channel?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Patient {
  id: number;
  mobileNumber: string;
  fullName: string;
  gender: string;
  dateOfBirth?: string;
  yearOfBirth?: string;
  address?: string;
  abhaId?: string;
  isVerified: boolean;
  createdAt: string;
}

export interface IvrCall {
  id: number;
  callSid: string;
  callerNumberHash: string;
  callerNumber: string;
  language: string;
  startTime: string;
  endTime?: string;
  currentState: string;
  callStatus: 'IN_PROGRESS' | 'COMPLETED' | 'FAILED' | 'ABANDONED';
  failureReason?: string;
  hospital?: Hospital;
  department?: Department;
  token?: Token;
}

export interface SmsLog {
  id: number;
  recipientPhone: string;
  messageText: string;
  status: 'PENDING' | 'SENT' | 'DELIVERED' | 'FAILED';
  provider: string;
  externalMessageId?: string;
  errorMessage?: string;
  createdAt: string;
}

export interface AuditLog {
  id: number;
  userId: string;
  action: string;
  entityType: string;
  entityId: string;
  ipAddress: string;
  metadata: string;
  timestamp: string;
}

export interface SystemSetting {
  id: number;
  settingKey: string;
  settingValue: string;
  description?: string;
  updatedAt: string;
}

export interface AdminStats {
  totalTokensToday: number;
  bookedToday: number;
  completedToday: number;
  cancelledToday: number;
  noShowToday: number;
  activeHospitals: number;
  activeDepartments: number;
  totalIvrCalls: number;
  successfulIvrCalls: number;
  failedIvrCalls: number;
  tokensByDepartment: { name: string; count: number }[];
  tokensByHospital: { name: string; count: number }[];
  tokensByStatus: { status: string; count: number }[];
  tokensByHour: { hour: string; count: number }[];
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  errorCode?: string;
  data: T;
  timestamp: string;
}

export interface SymptomTriageRequest {
  symptoms: string;
  language?: string;
  patientMobile?: string;
  callSid?: string;
  hospitalId?: number;
}

export interface SymptomTriageResponse {
  recommendedDepartmentId: number;
  recommendedDepartmentName: string;
  recommendedDepartmentCode: string;
  severityLevel: 'ROUTINE' | 'PRIORITY' | 'EMERGENCY' | string;
  confidenceScore: number;
  clinicalRationale: string;
  patientFriendlyAdvice: string;
  isEmergencyRedFlag: boolean;
  emergencyInstructions?: string;
  aiEngine: string;
  latencyMs: number;
}

export interface QueuePredictionRequest {
  hospitalId: number;
  departmentId: number;
  tokenSequenceNumber?: number;
  tokenNumber?: string;
}

export interface QueuePredictionResponse {
  estimatedWindowStart: string;
  estimatedWindowEnd: string;
  estimatedWaitMinutes: number;
  patientsAheadInQueue: number;
  departmentAvgMinutesPerPatient: number;
  crowdStatus: 'NORMAL' | 'MODERATE' | 'SURGE' | string;
  confidenceScore: number;
  predictionAlgorithm: string;
}

export interface AiModelStatus {
  isOllamaConnected: boolean;
  ollamaBaseUrl: string;
  configuredModel: string;
  activeEngine: string;
  operationalMode: string;
  availableLocalModels: string[];
  totalTriageRequestsLogged: number;
  emergencyCasesIdentified: number;
  averageLatencyMs: number;
  systemHealth: string;
  complianceNote: string;
}

export interface DoctorClinicalBrief {
  tokenNumber: string;
  patientName: string;
  patientMobile: string;
  abhaId?: string;
  department: string;
  chiefComplaint: string;
  urgencyLevel: string;
  aiTriageEngine: string;
  clinicalRationale: string;
  confidenceScore: number;
  suggestedDoctorQuestions: string[];
  draftFhirNote: string;
}

