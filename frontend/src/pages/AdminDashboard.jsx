import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import api from "../services/api";
import { X } from "lucide-react";

function AdminDashboard() {
    const [page, setPage] = useState(1);
    const [limit] = useState(50);
    const [selectedLog, setSelectedLog] = useState(null);

    const { data: logsData, isLoading, error } = useQuery({
        queryKey: ['logs', page],
        queryFn: async () => {
            const response = await api.get(`/logs?page=${page}&limit=${limit}`);
            return response.data;
        },
        keepPreviousData: true
    });

    const handleRowClick = (log) => {
        setSelectedLog(log);
    };

    const formatLogLevel = (log) => {
        if (log.type === 'request') {
            const statusCode = log.fingerprint.statusCode;
            if (statusCode < 300) return { level: 'SUCCESS', class: 'bg-green-100 text-green-800' };
            if (statusCode < 400) return { level: 'REDIRECT', class: 'bg-blue-100 text-blue-800' };
            if (statusCode < 500) return { level: 'CLIENT ERROR', class: 'bg-yellow-100 text-yellow-800' };
            return { level: 'SERVER ERROR', class: 'bg-red-100 text-red-800' };
        }
        
        return {
            level: log.level === 30 ? 'INFO' :
                   log.level === 40 ? 'WARN' :
                   log.level === 50 ? 'ERROR' : 'DEBUG',
            class: log.level === 30 ? 'bg-green-100 text-green-800' :
                   log.level === 40 ? 'bg-yellow-100 text-yellow-800' :
                   log.level === 50 ? 'bg-red-100 text-red-800' :
                   'bg-gray-100 text-gray-800'
        };
    };

    if (isLoading) return <div className="p-4">Loading logs...</div>;
    if (error) return <div className="p-4 text-red-500">Error loading logs: {error.message}</div>;

    return (
        <div className="space-y-6 relative">
            <h2 className="text-2xl font-bold text-gray-800">System Logs</h2>

            <div className="overflow-x-auto">
                <table className="min-w-full bg-white shadow-sm rounded-lg">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Level</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Message</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">IP</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User Agent</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {logsData?.data?.map((log, index) => (
                            <tr 
                                key={index}
                                onClick={() => handleRowClick(log)}
                                className="hover:bg-gray-50 cursor-pointer transition-colors"
                            >
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {new Date(log.time).toLocaleString()}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${formatLogLevel(log).class}`}>
                                        {formatLogLevel(log).level}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-500">
                                    {log.msg}
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-500">
                                    {log.fingerprint?.user ? (
                                        <div className="flex flex-col">
                                            <span className="font-medium">{log.fingerprint.user.email}</span>
                                            <span className="text-xs text-gray-400">
                                                {log.fingerprint.user.role}
                                            </span>
                                        </div>
                                    ) : (
                                        <span className="text-gray-400">Guest</span>
                                    )}
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-500">
                                    {log.fingerprint?.ip || 'N/A'}
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-500">
                                    {log.fingerprint?.location ? 
                                        `${log.fingerprint.location.city}, ${log.fingerprint.location.country}` 
                                        : 'N/A'}
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                                    {log.fingerprint?.userAgent || 'N/A'}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            <div className="flex justify-between items-center">
                <button
                    onClick={() => setPage(old => Math.max(old - 1, 1))}
                    disabled={page === 1}
                    className="px-4 py-2 border rounded-md disabled:opacity-50"
                >
                    Previous
                </button>
                <span>Page {page} of {logsData?.totalPages || 1}</span>
                <button
                    onClick={() => setPage(old => old + 1)}
                    disabled={page === logsData?.totalPages}
                    className="px-4 py-2 border rounded-md disabled:opacity-50"
                >
                    Next
                </button>
            </div>

            {/* Log Detail Modal */}
            {selectedLog && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[80vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-semibold text-gray-900">Log Details</h3>
                                <button
                                    onClick={() => setSelectedLog(null)}
                                    className="text-gray-500 hover:text-gray-700"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                            
                            <div className="space-y-4">
                                {/* Time */}
                                <div>
                                    <h4 className="text-sm font-medium text-gray-500">Timestamp</h4>
                                    <p className="mt-1">{new Date(selectedLog.time).toLocaleString()}</p>
                                </div>

                                {/* Level */}
                                <div>
                                    <h4 className="text-sm font-medium text-gray-500">Level</h4>
                                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${formatLogLevel(selectedLog).class}`}>
                                        {formatLogLevel(selectedLog).level}
                                    </span>
                                </div>

                                {/* Message */}
                                <div>
                                    <h4 className="text-sm font-medium text-gray-500">Message</h4>
                                    <p className="mt-1">{selectedLog.msg}</p>
                                </div>

                                {/* User Info */}
                                <div>
                                    <h4 className="text-sm font-medium text-gray-500">User Information</h4>
                                    {selectedLog.fingerprint?.user ? (
                                        <div className="mt-1">
                                            <p>Email: {selectedLog.fingerprint.user.email}</p>
                                            <p>Role: {selectedLog.fingerprint.user.role}</p>
                                            <p>ID: {selectedLog.fingerprint.user.id}</p>
                                        </div>
                                    ) : (
                                        <p className="mt-1 text-gray-500">Guest User</p>
                                    )}
                                </div>

                                {/* Request Details */}
                                <div>
                                    <h4 className="text-sm font-medium text-gray-500">Request Details</h4>
                                    <div className="mt-1 space-y-2">
                                        <p>Method: {selectedLog.fingerprint?.method}</p>
                                        <p>URL: {selectedLog.fingerprint?.url}</p>
                                        <p>Status: {selectedLog.fingerprint?.statusCode}</p>
                                        <p>Response Time: {selectedLog.fingerprint?.responseTime}ms</p>
                                        <p>IP: {selectedLog.fingerprint?.ip}</p>
                                        <p>User Agent: {selectedLog.fingerprint?.userAgent}</p>
                                    </div>
                                </div>

                                {/* Location */}
                                {selectedLog.fingerprint?.location && (
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-500">Location</h4>
                                        <div className="mt-1">
                                            <p>City: {selectedLog.fingerprint.location.city}</p>
                                            <p>Region: {selectedLog.fingerprint.location.region}</p>
                                            <p>Country: {selectedLog.fingerprint.location.country}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AdminDashboard; 