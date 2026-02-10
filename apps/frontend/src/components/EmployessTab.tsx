// src/components/EmployeesTab.tsx
import { useCallback, useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Users } from 'lucide-react';
import { employeeApi, Employee } from '../api/employee';
import { useAppDispatch } from '../store/hooks';
import { addToast } from '../store/slices/uiSlice';
import EmployeeModal from './EmployeeModal';
import { useSocket } from '../hooks/useSocket';

export default function EmployeesTab() {
    const dispatch = useAppDispatch();
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [loading, setLoading] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState<Employee | null>(null);

    useSocket((payload: any) => {
        dispatch(
            addToast({
                title: 'Profile Updated',
                message: `Employee: ${payload.employee?.id} - ${payload.employee?.name}`,
                type: 'info',
            })
        );
        loadEmployees();
    });

    const loadEmployees = useCallback(async () => {
        setLoading(true);
        try {
            const res = await employeeApi.getAll({ page: 1, limit: 100 });
            setEmployees(res.data.data || []);
        } catch {
            dispatch(addToast({ message: 'Failed to load employees', type: 'error' }));
        } finally {
            setLoading(false);
        }
    }, [dispatch]);

    useEffect(() => {
        loadEmployees();
    }, []);

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this employee?')) return;
        try {
            await employeeApi.delete(id);
            dispatch(addToast({ message: 'Employee deleted', type: 'success' }));
            loadEmployees();
        } catch {
            dispatch(addToast({ message: 'Delete failed', type: 'error' }));
        }
    };

    return (
        <>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold">Employee List</h2>
                <button
                    onClick={() => {
                        setEditing(null);
                        setModalOpen(true);
                    }}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500"
                >
                    <Plus className="w-5 h-5" />
                    Add Employee
                </button>
            </div>

            {loading ? (
                <p className="text-slate-500">Loading...</p>
            ) : (
                <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-slate-700/50">
                                <th className="px-4 py-3 text-left">Name</th>
                                <th className="px-4 py-3 text-left">Email</th>
                                <th className="px-4 py-3 text-left">Position</th>
                                <th className="px-4 py-3 text-left">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {employees.map((e) => (
                                <tr key={e.id} className="border-t border-slate-700">
                                    <td className="px-4 py-3 flex items-center gap-3">
                                        {e.photoUrl ? (
                                            <img src={e.photoUrl} className="w-8 h-8 rounded-full" />
                                        ) : (
                                            <Users className="w-5 h-5 text-slate-400" />
                                        )}
                                        {e.name}
                                    </td>
                                    <td className="px-4 py-3 text-slate-400">{e.email}</td>
                                    <td className="px-4 py-3 capitalize">{e.position}</td>
                                    <td className="px-4 py-3 flex gap-2">
                                        <button
                                            onClick={() => {
                                                setEditing(e);
                                                setModalOpen(true);
                                            }}
                                            className="p-2 rounded-lg hover:bg-slate-600 text-slate-400 hover:text-yellow-400"
                                        >
                                            <Pencil className="w-4 h-4" />
                                        </button>
                                        <button onClick={() => handleDelete(e.id)} className="p-2 rounded-lg hover:bg-red-900/50 text-slate-400 hover:text-red-400">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <EmployeeModal
                open={modalOpen}
                editing={editing}
                onClose={() => {
                    setModalOpen(false);
                    setEditing(null);
                }}
                onSave={() => {
                    setModalOpen(false);
                    setEditing(null);
                    loadEmployees();
                }}
            />
        </>
    );
}