// src/components/MonitoringTab.tsx
import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchMonitoring } from '../store/slices/attendanceSlice';
import Pagination from './layout/Pagination';

export default function MonitoringTab() {
    const dispatch = useAppDispatch();
    const { monitoring, loading, metaMonitoring } = useAppSelector((s) => s.attendance);
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const totalPages = metaMonitoring?.totalPages || 1;
    const total = metaMonitoring?.total || 0;

    useEffect(() => {
        dispatch(fetchMonitoring({ page: page, limit: limit }));

    }, [dispatch, page, limit]);

    if (loading) return <p className="text-slate-500">Loading...</p>;

    return (
        <div>
            <h2 className="text-lg font-semibold mb-4">Attendance Stream</h2>
            <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
                <table className="w-full">
                    <thead>
                        <tr className="bg-slate-700/50">
                            <th className="px-4 py-3 text-left">Employee</th>
                            <th className="px-4 py-3 text-left">Type</th>
                            <th className="px-4 py-3 text-left">Timestamp</th>
                        </tr>
                    </thead>
                    <tbody>
                        {monitoring.length === 0 ? (
                            <tr>
                                <td colSpan={3} className="px-4 py-8 text-center text-slate-500">
                                    No records
                                </td>
                            </tr>
                        ) : (
                            monitoring.map((r) => (
                                <tr key={r.id} className="border-t border-slate-700">
                                    <td className="px-4 py-3">
                                        {r.employeeName || r.employeeId}
                                    </td>
                                    <td className="px-4 py-3 capitalize">
                                        <span className={`px-2 py-0.5 rounded text-sm ${r.type === 'in' ? 'text-emerald-400' : 'text-red-400'}`}>
                                            {r.type}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-slate-400">
                                        {format(new Date(r.timestamp), 'PPpp')}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
                {/* Pagination Controls */}
                <Pagination
                    page={page}
                    totalPages={totalPages}
                    totalItems={total}
                    limit={limit}
                    onPageChange={setPage}
                    onLimitChange={(newLimit) => {
                        setPage(1);
                        setLimit(newLimit);
                    }}
                />
            </div>
        </div>
    );
}