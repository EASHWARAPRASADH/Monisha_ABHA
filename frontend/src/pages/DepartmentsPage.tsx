import React, { useEffect, useState } from 'react';
import { Stethoscope, CheckCircle, Shield } from 'lucide-react';
import { departmentApi } from '../services/api';
import { Department } from '../types';

export const DepartmentsPage: React.FC = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDepartments();
  }, []);

  const loadDepartments = async () => {
    try {
      setLoading(true);
      const data = await departmentApi.getAll();
      setDepartments(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Clinical OPD Departments</h2>
        <p className="text-xs sm:text-sm text-slate-500">
          Medical specialties configured in the IVR menu for caller keypress selection
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {departments.map((d, index) => (
          <div key={d.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs relative">
            <div className="flex justify-between items-start mb-3">
              <span className="h-7 w-7 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center font-bold text-xs border border-teal-200">
                {index + 1}
              </span>
              <span className="font-mono text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                Code: {d.code}
              </span>
            </div>

            <h3 className="text-sm font-bold text-slate-900">{d.name}</h3>
            <p className="text-xs text-slate-500 mt-1 min-h-[36px]">{d.description}</p>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-600">
              <span className="flex items-center text-teal-700 font-medium">
                <CheckCircle className="h-3.5 w-3.5 mr-1 text-teal-600" />
                IVR Key: Press {index + 1}
              </span>
              <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-semibold border border-emerald-100">
                ACTIVE
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
