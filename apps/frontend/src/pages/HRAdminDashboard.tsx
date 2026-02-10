import { useState } from 'react';
import {
  Users, Monitor
} from 'lucide-react';
import MonitoringTab from '../components/MonitoringTab';
import EmployeesTab from '../components/EmployessTab';
import AppHeader from '../components/layout/AppHeader';

const TABS = [
  { id: 'employees', label: 'Employees', icon: Users },
  { id: 'monitoring', label: 'Attendance Monitor', icon: Monitor },
] as const;

export default function HRAdminDashboard() {
  const [tab, setTab] = useState<'employees' | 'monitoring'>('employees');

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <AppHeader title="Dexa - HR Admin Dashboard" />

      <div className="flex">
        <aside className="w-56 border-r border-slate-700 p-4">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`w-full flex items-center gap-2 px-4 py-3 rounded-lg mb-1 transition ${tab === t.id
                  ? 'bg-emerald-600 text-white'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
            >
              <t.icon className="w-5 h-5" />
              {t.label}
            </button>
          ))}
        </aside>

        <main className="flex-1 p-6">
          {tab === 'employees' && <EmployeesTab />}
          {tab === 'monitoring' && <MonitoringTab />}
        </main>
      </div>
    </div>
  );
}
