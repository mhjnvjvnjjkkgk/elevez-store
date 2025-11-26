import React, { useState, useMemo } from 'react';
import { auditService, AuditLog } from '../services/auditService';
import '../styles/audit-log-viewer.css';

interface AuditLogViewerProps {
  onExport?: (data: string, format: 'csv' | 'json') => void;
}

export const AuditLogViewer: React.FC<AuditLogViewerProps> = ({ onExport }) => {
  const [filterAdmin, setFilterAdmin] = useState<string>('');
  const [filterAction, setFilterAction] = useState<string>('');
  const [filterDataType, setFilterDataType] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [startDate, setStartDate] = useState<string>(
    new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [endDate, setEndDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [showSummary, setShowSummary] = useState(false);
  const [showCompliance, setShowCompliance] = useState(false);

  const logs = useMemo(() => {
    return auditService.getAuditLogs({
      adminId: filterAdmin || undefined,
      action: filterAction || undefined,
      dataType: (filterDataType as any) || undefined,
      status: (filterStatus as any) || undefined,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      limit: 1000,
    });
  }, [filterAdmin, filterAction, filterDataType, filterStatus, startDate, endDate]);

  const summary = useMemo(() => {
    return auditService.getAuditSummary(new Date(startDate), new Date(endDate));
  }, [startDate, endDate]);

  const compliance = useMemo(() => {
    return auditService.generateComplianceReport(new Date(startDate), new Date(endDate));
  }, [startDate, endDate]);

  const handleExportCSV = () => {
    const csv = auditService.exportToCSV({
      adminId: filterAdmin || undefined,
      action: filterAction || undefined,
      dataType: (filterDataType as any) || undefined,
      status: (filterStatus as any) || undefined,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit_logs_${Date.now()}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    onExport?.(csv, 'csv');
  };

  const handleExportJSON = () => {
    const json = auditService.exportToJSON({
      adminId: filterAdmin || undefined,
      action: filterAction || undefined,
      dataType: (filterDataType as any) || undefined,
      status: (filterStatus as any) || undefined,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
    });

    const blob = new Blob([json], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit_logs_${Date.now()}.json`;
    a.click();
    window.URL.revokeObjectURL(url);

    onExport?.(json, 'json');
  };

  const getStatusColor = (status: string) => {
    return status === 'success' ? '#10b981' : '#ef4444';
  };

  return (
    <div className="audit-log-viewer">
      <div className="panel-header">
        <h2>Audit Log Viewer</h2>
        <div className="header-actions">
          <button onClick={() => setShowSummary(!showSummary)} className="btn-secondary">
            {showSummary ? 'Hide' : 'Show'} Summary
          </button>
          <button onClick={() => setShowCompliance(!showCompliance)} className="btn-secondary">
            {showCompliance ? 'Hide' : 'Show'} Compliance
          </button>
          <button onClick={handleExportCSV} className="btn-secondary">
            Export CSV
          </button>
          <button onClick={handleExportJSON} className="btn-secondary">
            Export JSON
          </button>
        </div>
      </div>

      {showSummary && (
        <div className="summary-section">
          <h3>Audit Summary</h3>
          <div className="summary-grid">
            <div className="summary-item">
              <span className="label">Total Actions</span>
              <span className="value">{summary.totalActions}</span>
            </div>
            <div className="summary-item">
              <span className="label">Successful</span>
              <span className="value" style={{ color: '#10b981' }}>
                {summary.successCount}
              </span>
            </div>
            <div className="summary-item">
              <span className="label">Failed</span>
              <span className="value" style={{ color: '#ef4444' }}>
                {summary.failureCount}
              </span>
            </div>
            <div className="summary-item">
              <span className="label">Failure Rate</span>
              <span className="value">{summary.failureRate.toFixed(2)}%</span>
            </div>
          </div>

          <div className="summary-details">
            <div className="detail-section">
              <h4>Top Actions</h4>
              <ul>
                {summary.topActions.map((item) => (
                  <li key={item.action}>
                    {item.action}: <strong>{item.count}</strong>
                  </li>
                ))}
              </ul>
            </div>

            <div className="detail-section">
              <h4>Top Admins</h4>
              <ul>
                {summary.topAdmins.map((item) => (
                  <li key={item.admin}>
                    {item.admin}: <strong>{item.count}</strong>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {showCompliance && (
        <div className="compliance-section">
          <h3>Compliance Report</h3>
          <div className="compliance-status">
            <span className={`status ${compliance.complianceStatus}`}>
              Status: {compliance.complianceStatus.toUpperCase()}
            </span>
          </div>

          <div className="compliance-metrics">
            <div className="metric">
              <span className="label">Total Actions</span>
              <span className="value">{compliance.totalActions}</span>
            </div>
            <div className="metric">
              <span className="label">Data Modifications</span>
              <span className="value">{compliance.dataModifications}</span>
            </div>
            <div className="metric">
              <span className="label">Deletions</span>
              <span className="value">{compliance.deletions}</span>
            </div>
            <div className="metric">
              <span className="label">Exports</span>
              <span className="value">{compliance.exports}</span>
            </div>
          </div>

          {compliance.recommendations.length > 0 && (
            <div className="recommendations">
              <h4>Recommendations</h4>
              <ul>
                {compliance.recommendations.map((rec, i) => (
                  <li key={i}>{rec}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      <div className="filters-section">
        <h3>Filters</h3>
        <div className="filters-grid">
          <div className="filter-group">
            <label>Admin Email</label>
            <input
              type="text"
              value={filterAdmin}
              onChange={(e) => setFilterAdmin(e.target.value)}
              placeholder="Filter by admin"
            />
          </div>

          <div className="filter-group">
            <label>Action</label>
            <select value={filterAction} onChange={(e) => setFilterAction(e.target.value)}>
              <option value="">All Actions</option>
              <option value="create">Create</option>
              <option value="update">Update</option>
              <option value="delete">Delete</option>
              <option value="export">Export</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Data Type</label>
            <select value={filterDataType} onChange={(e) => setFilterDataType(e.target.value)}>
              <option value="">All Types</option>
              <option value="discount">Discount</option>
              <option value="points">Points</option>
              <option value="user">User</option>
              <option value="system">System</option>
              <option value="report">Report</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Status</label>
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
              <option value="">All Status</option>
              <option value="success">Success</option>
              <option value="failure">Failure</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>

          <div className="filter-group">
            <label>End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="logs-section">
        <h3>Audit Logs ({logs.length})</h3>
        <div className="logs-table">
          <table>
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Admin</th>
                <th>Action</th>
                <th>Data Type</th>
                <th>Resource</th>
                <th>Status</th>
                <th>Duration</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr
                  key={log.id}
                  onClick={() => setSelectedLog(log)}
                  className={selectedLog?.id === log.id ? 'selected' : ''}
                >
                  <td>{log.timestamp.toLocaleString()}</td>
                  <td>{log.adminEmail}</td>
                  <td>{log.action}</td>
                  <td>{log.dataType}</td>
                  <td>{log.resourceName}</td>
                  <td>
                    <span
                      className={`status ${log.status}`}
                      style={{ color: getStatusColor(log.status) }}
                    >
                      {log.status}
                    </span>
                  </td>
                  <td>{log.duration}ms</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedLog && (
        <div className="log-details">
          <h3>Log Details</h3>
          <div className="details-grid">
            <div className="detail-item">
              <span className="label">Admin</span>
              <span className="value">{selectedLog.adminEmail}</span>
            </div>
            <div className="detail-item">
              <span className="label">Action</span>
              <span className="value">{selectedLog.action}</span>
            </div>
            <div className="detail-item">
              <span className="label">Resource</span>
              <span className="value">{selectedLog.resourceName}</span>
            </div>
            <div className="detail-item">
              <span className="label">Status</span>
              <span className="value" style={{ color: getStatusColor(selectedLog.status) }}>
                {selectedLog.status}
              </span>
            </div>
            <div className="detail-item">
              <span className="label">Duration</span>
              <span className="value">{selectedLog.duration}ms</span>
            </div>
            <div className="detail-item">
              <span className="label">IP Address</span>
              <span className="value">{selectedLog.ipAddress}</span>
            </div>
          </div>

          {selectedLog.changes && (
            <div className="changes-section">
              <h4>Changes</h4>
              <div className="changes-grid">
                {selectedLog.changes.before && (
                  <div className="change-item">
                    <h5>Before</h5>
                    <pre>{JSON.stringify(selectedLog.changes.before, null, 2)}</pre>
                  </div>
                )}
                {selectedLog.changes.after && (
                  <div className="change-item">
                    <h5>After</h5>
                    <pre>{JSON.stringify(selectedLog.changes.after, null, 2)}</pre>
                  </div>
                )}
              </div>
            </div>
          )}

          {selectedLog.errorMessage && (
            <div className="error-section">
              <h4>Error</h4>
              <p>{selectedLog.errorMessage}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
