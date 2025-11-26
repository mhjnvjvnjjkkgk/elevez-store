import React, { useState } from 'react';
import { reportService, ReportData } from '../services/reportService';
import '../styles/report-generator.css';

interface ReportGeneratorProps {
  onReportGenerated?: (report: ReportData) => void;
}

export const ReportGenerator: React.FC<ReportGeneratorProps> = ({ onReportGenerated }) => {
  const [reportType, setReportType] = useState<'revenue' | 'user' | 'discount' | 'performance'>(
    'revenue'
  );
  const [startDate, setStartDate] = useState<string>(
    new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [endDate, setEndDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reports, setReports] = useState<ReportData[]>([]);
  const [selectedReport, setSelectedReport] = useState<ReportData | null>(null);

  const handleGenerateReport = async () => {
    setLoading(true);
    setError(null);

    try {
      const start = new Date(startDate);
      const end = new Date(endDate);

      let report: ReportData;

      switch (reportType) {
        case 'revenue':
          report = await reportService.generateRevenueReport(start, end);
          break;
        case 'user':
          report = await reportService.generateUserReport(start, end);
          break;
        case 'discount':
          report = await reportService.generateDiscountReport(start, end);
          break;
        case 'performance':
          report = await reportService.generatePerformanceReport();
          break;
        default:
          throw new Error('Invalid report type');
      }

      setReports((prev) => [report, ...prev]);
      setSelectedReport(report);
      onReportGenerated?.(report);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  const handleExportJSON = () => {
    if (!selectedReport) return;
    try {
      const json = reportService.exportToJSON(selectedReport.id);
      const blob = new Blob([json], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${selectedReport.type}_report_${Date.now()}.json`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to export report');
    }
  };

  const handleExportCSV = () => {
    if (!selectedReport) return;
    try {
      const csv = reportService.exportToCSV(selectedReport.id);
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${selectedReport.type}_report_${Date.now()}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to export report');
    }
  };

  const handleDeleteReport = (reportId: string) => {
    reportService.deleteReport(reportId);
    setReports((prev) => prev.filter((r) => r.id !== reportId));
    if (selectedReport?.id === reportId) {
      setSelectedReport(null);
    }
  };

  return (
    <div className="report-generator">
      <div className="panel-header">
        <h2>Report Generator</h2>
        <p>Generate and analyze business reports</p>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="report-controls">
        <div className="control-group">
          <label>Report Type</label>
          <select value={reportType} onChange={(e) => setReportType(e.target.value as any)}>
            <option value="revenue">Revenue Report</option>
            <option value="user">User Report</option>
            <option value="discount">Discount Report</option>
            <option value="performance">Performance Report</option>
          </select>
        </div>

        {reportType !== 'performance' && (
          <>
            <div className="control-group">
              <label>Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>

            <div className="control-group">
              <label>End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </>
        )}

        <button
          onClick={handleGenerateReport}
          disabled={loading}
          className="btn-primary"
        >
          {loading ? 'Generating...' : 'Generate Report'}
        </button>
      </div>

      <div className="report-container">
        <div className="reports-list">
          <h3>Recent Reports</h3>
          {reports.length === 0 ? (
            <p className="empty-state">No reports generated yet</p>
          ) : (
            <div className="reports">
              {reports.map((report) => (
                <div
                  key={report.id}
                  className={`report-item ${selectedReport?.id === report.id ? 'selected' : ''}`}
                  onClick={() => setSelectedReport(report)}
                >
                  <div className="report-title">{report.title}</div>
                  <div className="report-meta">
                    <span className="report-type">{report.type}</span>
                    <span className="report-date">
                      {report.generatedAt.toLocaleDateString()}
                    </span>
                  </div>
                  <button
                    className="btn-delete"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteReport(report.id);
                    }}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="report-details">
          {selectedReport ? (
            <>
              <div className="report-header">
                <h3>{selectedReport.title}</h3>
                <div className="report-actions">
                  <button onClick={handleExportJSON} className="btn-secondary">
                    Export JSON
                  </button>
                  <button onClick={handleExportCSV} className="btn-secondary">
                    Export CSV
                  </button>
                </div>
              </div>

              <div className="report-summary">
                <h4>Summary</h4>
                <div className="summary-grid">
                  {Object.entries(selectedReport.summary).map(([key, value]) => {
                    if (typeof value === 'object') return null;
                    return (
                      <div key={key} className="summary-item">
                        <span className="label">{key}</span>
                        <span className="value">
                          {typeof value === 'number' ? value.toFixed(2) : String(value)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {selectedReport.type === 'revenue' && (
                <div className="report-section">
                  <h4>Top Discounts</h4>
                  <div className="table-wrapper">
                    <table>
                      <thead>
                        <tr>
                          <th>Code</th>
                          <th>Revenue</th>
                          <th>Usage</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(selectedReport.summary.topDiscounts || []).map((discount: any) => (
                          <tr key={discount.code}>
                            <td>{discount.code}</td>
                            <td>${discount.revenue.toFixed(2)}</td>
                            <td>{discount.usageCount}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {selectedReport.type === 'user' && (
                <div className="report-section">
                  <h4>Users by Tier</h4>
                  <div className="table-wrapper">
                    <table>
                      <thead>
                        <tr>
                          <th>Tier</th>
                          <th>Count</th>
                          <th>Avg Points</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(selectedReport.summary.usersByTier || []).map((tier: any) => (
                          <tr key={tier.tier}>
                            <td>{tier.tier}</td>
                            <td>{tier.count}</td>
                            <td>{tier.averagePoints.toFixed(0)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {selectedReport.type === 'discount' && (
                <div className="report-section">
                  <h4>Top Performers</h4>
                  <div className="table-wrapper">
                    <table>
                      <thead>
                        <tr>
                          <th>Code</th>
                          <th>Usage</th>
                          <th>Revenue</th>
                          <th>ROI</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(selectedReport.summary.topPerformers || []).map((performer: any) => (
                          <tr key={performer.code}>
                            <td>{performer.code}</td>
                            <td>{performer.usage}</td>
                            <td>${performer.revenue.toFixed(2)}</td>
                            <td>{performer.roi.toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {selectedReport.type === 'performance' && (
                <div className="report-section">
                  <h4>Recommendations</h4>
                  <ul className="recommendations">
                    {(selectedReport.summary.recommendations || []).map((rec: string, i: number) => (
                      <li key={i}>{rec}</li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          ) : (
            <div className="empty-state">
              <p>Select a report to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
