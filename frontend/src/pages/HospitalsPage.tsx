import React, { useEffect, useState } from 'react';
import { Building2, Stethoscope, Clock, Phone, MapPin, CheckCircle } from 'lucide-react';
import { hospitalApi } from '../services/api';
import { Hospital, HospitalDepartment } from '../types';

export const HospitalsPage: React.FC = () => {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(null);
  const [departments, setDepartments] = useState<HospitalDepartment[]>([]);
  const [loading, setLoading] = useState(true);
  const [deptLoading, setDeptLoading] = useState(false);

  useEffect(() => {
    loadHospitals();
  }, []);

  const loadHospitals = async () => {
    try {
      setLoading(true);
      const data = await hospitalApi.getAll();
      setHospitals(data);
      if (data.length > 0) {
        selectHospital(data[0]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const selectHospital = async (h: Hospital) => {
    setSelectedHospital(h);
    try {
      setDeptLoading(true);
      const depts = await hospitalApi.getDepartments(h.id);
      setDepartments(depts);
    } catch (e) {
      console.error(e);
    } finally {
      setDeptLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Government Hospitals Directory</h2>
        <p className="text-xs sm:text-sm text-slate-500">
          Integrated hospital healthcare facilities with active IVR OPD booking quotas and department schedules
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Hospital Cards List (Cols 5) */}
        <div className="lg:col-span-5 space-y-3">
          {hospitals.map((h) => {
            const isSelected = selectedHospital?.id === h.id;
            return (
              <div
                key={h.id}
                onClick={() => selectHospital(h)}
                className={`p-4 rounded-xl border cursor-pointer transition ${
                  isSelected
                    ? 'bg-white border-teal-500 ring-2 ring-teal-500/20 shadow-md'
                    : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="font-mono text-xs font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                    {h.code}
                  </span>
                  <span className="text-[11px] font-medium text-slate-500">{h.type}</span>
                </div>
                <h3 className="text-sm font-bold text-slate-900">{h.name}</h3>
                <p className="text-xs text-slate-500 flex items-center mt-1">
                  <MapPin className="h-3.5 w-3.5 mr-1 shrink-0 text-slate-400" />
                  {h.address}
                </p>
                <div className="flex items-center justify-between text-xs text-slate-600 mt-3 pt-2 border-t border-slate-100">
                  <span className="flex items-center">
                    <Phone className="h-3 w-3 mr-1 text-slate-400" />
                    {h.contactNumber}
                  </span>
                  <span className="text-emerald-700 font-medium flex items-center text-[11px]">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    IVR Connected
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Hospital Department Quota View (Cols 7) */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 shadow-xs p-5">
          {selectedHospital && (
            <div>
              <div className="border-b border-slate-100 pb-3 mb-4">
                <span className="text-xs font-semibold text-teal-600 uppercase tracking-wider">Facility Quota & OPD Hours</span>
                <h3 className="text-base font-bold text-slate-900">{selectedHospital.name}</h3>
                <p className="text-xs text-slate-500">{selectedHospital.district}, {selectedHospital.state}</p>
              </div>

              {deptLoading ? (
                <div className="py-8 text-center text-xs text-slate-400">Loading department quotas...</div>
              ) : (
                <div className="space-y-3">
                  {departments.map((d) => (
                    <div key={d.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 rounded-lg bg-teal-100/60 text-teal-800">
                          <Stethoscope className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-900">{d.departmentName}</p>
                          <p className="text-[11px] text-slate-500 flex items-center">
                            <Clock className="h-3 w-3 mr-1 text-slate-400" />
                            {d.opdStartTime} - {d.opdEndTime} ({d.slotDurationMinutes} mins/slot)
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-bold text-slate-900">{d.availableCount} available</p>
                        <p className="text-[10px] text-slate-400">Daily limit: {d.dailyTokenLimit}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
