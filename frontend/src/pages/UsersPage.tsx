import React, { useEffect, useState } from 'react';
import { Users, UserPlus, Shield, Building2 } from 'lucide-react';
import { adminApi, hospitalApi } from '../services/api';
import { Hospital, User } from '../types';

export const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // New User Form State
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [role, setRole] = useState('ROLE_HOSPITAL_STAFF');
  const [hospitalId, setHospitalId] = useState<number | undefined>(1);
  const [formMsg, setFormMsg] = useState<{ text: string; error: boolean } | null>(null);

  useEffect(() => {
    loadUsers();
    loadHospitals();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getUsers();
      setUsers(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const loadHospitals = async () => {
    try {
      const data = await hospitalApi.getAll();
      setHospitals(data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormMsg(null);
    try {
      await adminApi.createUser({
        username,
        password,
        fullName,
        email: email || undefined,
        phoneNumber,
        role,
        hospitalId: role === 'ROLE_SUPER_ADMIN' ? undefined : hospitalId,
      });
      setFormMsg({ text: 'User created successfully', error: false });
      loadUsers();
      setTimeout(() => setShowModal(false), 1500);
    } catch (err: any) {
      setFormMsg({ text: err.response?.data?.message || 'Failed to create user', error: true });
    }
  };

  return (
    <div className="space-y-6">
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Hospital Staff & Administrator Accounts</h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Role-based access control (RBAC) management for Hospital OPD Desks and Administrative roles
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center px-4 py-2 text-xs font-semibold rounded-lg bg-teal-600 text-white hover:bg-teal-500 shadow-xs transition"
        >
          <UserPlus className="h-4 w-4 mr-1.5" />
          Add Staff / Admin
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400">Loading accounts...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold uppercase">
                <tr>
                  <th className="py-3 px-4">Full Name</th>
                  <th className="py-3 px-4">Username</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Assigned Facility</th>
                  <th className="py-3 px-4">Contact</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50 transition">
                    <td className="py-3 px-4 font-semibold text-slate-900">{u.fullName}</td>
                    <td className="py-3 px-4 font-mono text-slate-600">{u.username}</td>
                    <td className="py-3 px-4">
                      <span className="font-mono text-[10px] font-bold uppercase bg-slate-100 px-2 py-0.5 rounded text-slate-700">
                        {u.role.replace('ROLE_', '')}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-700">{u.hospitalName || 'System-Wide'}</td>
                    <td className="py-3 px-4 text-slate-500 font-mono">{u.phoneNumber}</td>
                    <td className="py-3 px-4">
                      <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        ACTIVE
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base font-bold text-slate-900">Create Staff / Admin Account</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                ✕
              </button>
            </div>

            {formMsg && (
              <div
                className={`p-3 rounded-lg text-xs mb-4 ${
                  formMsg.error ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                }`}
              >
                {formMsg.text}
              </div>
            )}

            <form onSubmit={handleCreateUser} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Username *</label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-hidden focus:ring-1 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Password *</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-hidden focus:ring-1 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-hidden focus:ring-1 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Phone Number *</label>
                <input
                  type="tel"
                  required
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-hidden focus:ring-1 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Role *</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-hidden"
                >
                  <option value="ROLE_HOSPITAL_STAFF">Hospital Staff (OPD Counter)</option>
                  <option value="ROLE_HOSPITAL_ADMIN">Hospital Administrator</option>
                  <option value="ROLE_SUPER_ADMIN">Super Administrator</option>
                </select>
              </div>

              {role !== 'ROLE_SUPER_ADMIN' && (
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Assigned Hospital *</label>
                  <select
                    value={hospitalId}
                    onChange={(e) => setHospitalId(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-hidden"
                  >
                    {hospitals.map((h) => (
                      <option key={h.id} value={h.id}>
                        {h.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="pt-3 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-3 py-2 rounded-lg text-slate-600 bg-slate-100 hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 font-semibold rounded-lg bg-teal-600 hover:bg-teal-500 text-white shadow-xs"
                >
                  Create Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
