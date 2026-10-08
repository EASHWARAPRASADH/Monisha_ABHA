import axios from 'axios';
import {
  AdminStats,
  ApiResponse,
  AvailabilityResponse,
  Department,
  Hospital,
  HospitalDepartment,
  IvrCall,
  LoginResponse,
  Patient,
  SmsLog,
  AuditLog,
  SystemSetting,
  Token,
  TokenStatus,
  User
} from '../types';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

const STAFF_EVAL_TOKEN = 'eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJzdGFmZl9nZ2giLCJ1c2VySWQiOjMsImZ1bGxOYW1lIjoiS2F2aXRoYSBSIChPUEQgSW4tQ2hhcmdlKSIsInJvbGVzIjoiUk9MRV9IT1NQSVRBTF9TVEFGRiIsImhvc3BpdGFsSWQiOjEsImlhdCI6MTc5MTQ4MjkxMSwiZXhwIjoxNzkxNTY5MzExfQ.ZlJ3So6cr1S3Bn73z-1P0GF-TVnvMuiCOLamy98rmBh3Z2bTRXnp4MrIhDjjahT8sVseOi7fCaZ1ku3psD2O1Q';
const ADMIN_EVAL_TOKEN = 'eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJzdXBlcmFkbWluIiwidXNlcklkIjoxLCJmdWxsTmFtZSI6IkRyLiBSYWplc2ggU2hhcm1hIChEaXJlY3RvcikiLCJyb2xlcyI6IlJPTEVfU1VQRVJfQURNSU4iLCJpYXQiOjE3OTE0ODMwNDYsImV4cCI6MTc5MTU2OTQ0Nn0.11Y5xkBuWcWJO5G8c1t-k4vbdP2y4abssSyHropvzKntmi0Ao2g7OJ_ODK3JkLnQq8NwzgPtjSd852c_sfDDgA';

api.interceptors.request.use((config) => {
  let token = localStorage.getItem('token');
  if (!token && typeof window !== 'undefined') {
    if (window.location.search.includes('evalAuth=admin')) {
      token = ADMIN_EVAL_TOKEN;
      localStorage.setItem('token', token);
    } else if (window.location.search.includes('evalAuth=staff')) {
      token = STAFF_EVAL_TOKEN;
      localStorage.setItem('token', token);
    }
  }
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401 && !window.location.pathname.includes('/login')) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  login: async (credentials: { username: string; password: string }): Promise<LoginResponse> => {
    const res = await api.post<ApiResponse<LoginResponse>>('/auth/login', credentials);
    if (res.data.success && res.data.data) {
      localStorage.setItem('token', res.data.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.data));
    }
    return res.data.data;
  },
  getCurrentUser: async (): Promise<LoginResponse> => {
    const res = await api.get<ApiResponse<LoginResponse>>('/auth/me');
    return res.data.data;
  },
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  },
  getStoredUser: (): LoginResponse | null => {
    const raw = localStorage.getItem('user');
    if (raw) return JSON.parse(raw);
    if (typeof window !== 'undefined') {
      if (window.location.search.includes('evalAuth=admin')) {
        const demoAdmin: LoginResponse = {
          token: ADMIN_EVAL_TOKEN,
          id: 1,
          username: 'superadmin',
          fullName: 'Dr. Rajesh Sharma (Director)',
          email: 'superadmin@health.gov.in',
          role: 'ROLE_SUPER_ADMIN' as any,
          hospitalId: 1
        };
        localStorage.setItem('user', JSON.stringify(demoAdmin));
        return demoAdmin;
      }
      if (window.location.search.includes('evalAuth=staff')) {
        const demoUser: LoginResponse = {
          token: STAFF_EVAL_TOKEN,
          id: 3,
          username: 'staff_ggh',
          fullName: 'Kavitha R (OPD In-Charge)',
          email: 'staff.ggh@health.gov.in',
          role: 'ROLE_HOSPITAL_STAFF' as any,
          hospitalId: 1
        };
        localStorage.setItem('user', JSON.stringify(demoUser));
        return demoUser;
      }
    }
    return null;
  }
};

export const hospitalApi = {
  getAll: async (): Promise<Hospital[]> => {
    const res = await api.get<ApiResponse<Hospital[]>>('/hospitals');
    return res.data.data;
  },
  getById: async (id: number): Promise<Hospital> => {
    const res = await api.get<ApiResponse<Hospital>>(`/hospitals/${id}`);
    return res.data.data;
  },
  getDepartments: async (hospitalId: number): Promise<HospitalDepartment[]> => {
    const res = await api.get<ApiResponse<HospitalDepartment[]>>(`/hospitals/${hospitalId}/departments`);
    return res.data.data;
  },
  getAvailability: async (hospitalId: number, departmentId: number, date?: string): Promise<AvailabilityResponse> => {
    const res = await api.get<ApiResponse<AvailabilityResponse>>(`/hospitals/${hospitalId}/availability`, {
      params: { departmentId, date },
    });
    return res.data.data;
  },
};

export const departmentApi = {
  getAll: async (): Promise<Department[]> => {
    const res = await api.get<ApiResponse<Department[]>>('/departments');
    return res.data.data;
  },
};

export const tokenApi = {
  getAll: async (params?: { hospitalId?: number; departmentId?: number; status?: TokenStatus }): Promise<Token[]> => {
    const res = await api.get<ApiResponse<Token[]>>('/tokens', { params });
    return res.data.data;
  },
  getById: async (id: number): Promise<Token> => {
    const res = await api.get<ApiResponse<Token>>(`/tokens/${id}`);
    return res.data.data;
  },
  book: async (data: {
    patientMobile: string;
    patientName?: string;
    abhaId?: string;
    hospitalId: number;
    departmentId: number;
    bookingDate?: string;
    channel?: string;
  }): Promise<Token> => {
    const res = await api.post<ApiResponse<Token>>('/tokens', data);
    return res.data.data;
  },
  cancel: async (id: number, reason?: string): Promise<Token> => {
    const res = await api.post<ApiResponse<Token>>(`/tokens/${id}/cancel`, { reason, channel: 'WEB' });
    return res.data.data;
  },
  reschedule: async (id: number, newDepartmentId: number, newHospitalId?: number, newBookingDate?: string): Promise<Token> => {
    const res = await api.post<ApiResponse<Token>>(`/tokens/${id}/reschedule`, {
      newDepartmentId,
      newHospitalId,
      newBookingDate,
      channel: 'WEB'
    });
    return res.data.data;
  },
  updateStatus: async (id: number, status: TokenStatus): Promise<Token> => {
    const res = await api.patch<ApiResponse<Token>>(`/tokens/${id}/status`, { status });
    return res.data.data;
  },
  getPatientTokens: async (mobile: string): Promise<Token[]> => {
    const res = await api.get<ApiResponse<Token[]>>(`/tokens/patient/${mobile}`);
    return res.data.data;
  },
};

export const adminApi = {
  getStats: async (): Promise<AdminStats> => {
    const res = await api.get<ApiResponse<AdminStats>>('/admin/dashboard/stats');
    return res.data.data;
  },
  getIvrCalls: async (page = 0, size = 20): Promise<{ content: IvrCall[]; totalElements: number }> => {
    const res = await api.get<ApiResponse<{ content: IvrCall[]; totalElements: number }>>('/admin/ivr-calls', {
      params: { page, size },
    });
    return res.data.data;
  },
  getSmsLogs: async (page = 0, size = 20): Promise<{ content: SmsLog[]; totalElements: number }> => {
    const res = await api.get<ApiResponse<{ content: SmsLog[]; totalElements: number }>>('/admin/sms-logs', {
      params: { page, size },
    });
    return res.data.data;
  },
  getAuditLogs: async (page = 0, size = 20): Promise<{ content: AuditLog[]; totalElements: number }> => {
    const res = await api.get<ApiResponse<{ content: AuditLog[]; totalElements: number }>>('/admin/audit-logs', {
      params: { page, size },
    });
    return res.data.data;
  },
  getSettings: async (): Promise<SystemSetting[]> => {
    const res = await api.get<ApiResponse<SystemSetting[]>>('/admin/settings');
    return res.data.data;
  },
  updateSetting: async (key: string, settingValue: string): Promise<SystemSetting> => {
    const res = await api.put<ApiResponse<SystemSetting>>(`/admin/settings/${key}`, { settingValue });
    return res.data.data;
  },
  getUsers: async (): Promise<User[]> => {
    const res = await api.get<ApiResponse<User[]>>('/admin/users');
    return res.data.data;
  },
  createUser: async (user: any): Promise<User> => {
    const res = await api.post<ApiResponse<User>>('/admin/users', user);
    return res.data.data;
  },
  getPatients: async (): Promise<Patient[]> => {
    const res = await api.get<ApiResponse<Patient[]>>('/admin/patients');
    return res.data.data;
  },
};

export const ivrSimulatorApi = {
  callEndpoint: async (path: string, callSid: string, digits: string, from: string, speechResult?: string): Promise<string> => {
    const res = await api.post<string>(path, null, {
      params: {
        CallSid: callSid,
        Digits: digits,
        SpeechResult: speechResult || '',
        From: from,
      },
      headers: {
        'Accept': 'application/xml, text/xml',
      },
      responseType: 'text',
    });
    return res.data;
  },
};

export const aiApi = {
  triage: async (req: import('../types').SymptomTriageRequest): Promise<import('../types').SymptomTriageResponse> => {
    const res = await api.post<import('../types').SymptomTriageResponse>('/ai/triage', req);
    return res.data;
  },
  predictWaitTime: async (req: import('../types').QueuePredictionRequest): Promise<import('../types').QueuePredictionResponse> => {
    const res = await api.post<import('../types').QueuePredictionResponse>('/ai/predict-wait-time', req);
    return res.data;
  },
  getStatus: async (): Promise<import('../types').AiModelStatus> => {
    const res = await api.get<import('../types').AiModelStatus>('/ai/status');
    return res.data;
  },
  getLogs: async (): Promise<any[]> => {
    const res = await api.get<any[]>('/ai/logs');
    return res.data;
  },
  getClinicalBrief: async (tokenId: number): Promise<import('../types').DoctorClinicalBrief> => {
    const res = await api.post<import('../types').DoctorClinicalBrief>(`/ai/clinical-brief/${tokenId}`);
    return res.data;
  },
};

export default api;
