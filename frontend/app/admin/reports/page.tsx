"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  FileText, 
  Download, 
  Calendar,
  Users,
  BarChart3,
  CreditCard,
  Shield,
  TrendingUp,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose, DialogDescription } from "@/components/ui/dialog";
import { saveAs } from "file-saver";

interface ReportType {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<any>;
  format: string[];
}

interface GeneratedReport {
  id: string;
  name: string;
  type: string;
  format: string;
  generatedAt: string;
  status: 'completed' | 'processing' | 'failed';
  downloadUrl?: string;
}

const reportTypes: ReportType[] = [
  {
    id: 'user-activity',
    name: 'User Activity Report',
    description: 'Detailed user engagement and activity metrics',
    icon: Users,
    format: ['CSV', 'PDF', 'Excel']
  },
  {
    id: 'revenue-analytics',
    name: 'Revenue Analytics',
    description: 'Comprehensive revenue and subscription data',
    icon: CreditCard,
    format: ['CSV', 'PDF', 'Excel']
  },
  {
    id: 'content-moderation',
    name: 'Content Moderation Report',
    description: 'Flagged content and moderation actions',
    icon: Shield,
    format: ['CSV', 'PDF']
  },
  {
    id: 'growth-metrics',
    name: 'Growth Metrics',
    description: 'User growth, retention, and acquisition data',
    icon: TrendingUp,
    format: ['CSV', 'PDF', 'Excel']
  },
  {
    id: 'session-analytics',
    name: 'Session Analytics',
    description: 'Design session creation and usage patterns',
    icon: BarChart3,
    format: ['CSV', 'PDF']
  },
  {
    id: 'subscription-report',
    name: 'Subscription Report',
    description: 'Subscription status and payment information',
    icon: CreditCard,
    format: ['CSV', 'PDF', 'Excel']
  }
];

// Helper to convert array of objects to CSV
function arrayToCSV(data: any[], columns: string[]): string {
  const header = columns.join(",");
  const rows = data.map(row => columns.map(col => JSON.stringify(row[col] ?? "")).join(","));
  return [header, ...rows].join("\n");
}

export default function ReportsPage() {
  const [selectedReport, setSelectedReport] = useState<string>('');
  const [selectedFormat, setSelectedFormat] = useState<string>('');
  const [dateRange, setDateRange] = useState<string>('30');
  const [generating, setGenerating] = useState(false);
  const [generatedReports, setGeneratedReports] = useState<GeneratedReport[]>([
    {
      id: '1',
      name: 'User Activity Report',
      type: 'user-activity',
      format: 'PDF',
      generatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      status: 'completed',
      downloadUrl: '#'
    },
    {
      id: '2',
      name: 'Revenue Analytics',
      type: 'revenue-analytics',
      format: 'Excel',
      generatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      status: 'completed',
      downloadUrl: '#'
    },
    {
      id: '3',
      name: 'Content Moderation Report',
      type: 'content-moderation',
      format: 'PDF',
      generatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'completed',
      downloadUrl: '#'
    }
  ]);
  const [previewReport, setPreviewReport] = useState<GeneratedReport | null>(null);
  const [reportData, setReportData] = useState<any>(null);
  const [reportLoading, setReportLoading] = useState(false);
  const [reportError, setReportError] = useState<string | null>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  // Fetch real data for preview when previewReport changes
  useEffect(() => {
    if (!previewReport) return;
    setReportData(null);
    setReportError(null);
    const token = localStorage.getItem("token");
    if (previewReport.type === 'user-activity') {
      setReportLoading(true);
      fetch(`${API_URL}/admin/reports/user-activity`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
        .then((res) => res.json())
        .then((data) => {
          setReportData(data);
          setReportLoading(false);
        })
        .catch((err) => {
          setReportError('Failed to load user activity report');
          setReportLoading(false);
        });
    } else if (previewReport.type === 'session-analytics') {
      setReportLoading(true);
      fetch(`${API_URL}/admin/reports/session-analytics`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
        .then((res) => res.json())
        .then((data) => {
          setReportData(data);
          setReportLoading(false);
        })
        .catch((err) => {
          setReportError('Failed to load session analytics report');
          setReportLoading(false);
        });
    }
  }, [previewReport]);

  const handleGenerateReport = async () => {
    if (!selectedReport || !selectedFormat) {
      alert('Please select a report type and format');
      return;
    }

    setGenerating(true);
    
    try {
      const token = localStorage.getItem("token");
      const reportType = reportTypes.find(r => r.id === selectedReport);
      
      // Create a new report entry
      const newReport: GeneratedReport = {
        id: Date.now().toString(),
        name: reportType?.name || selectedReport,
        type: selectedReport,
        format: selectedFormat,
        generatedAt: new Date().toISOString(),
        status: 'processing'
      };
      
      setGeneratedReports(prev => [newReport, ...prev]);
      
      // Simulate report generation
      setTimeout(() => {
        setGeneratedReports(prev => 
          prev.map(report => 
            report.id === newReport.id 
              ? { ...report, status: 'completed', downloadUrl: '#' }
              : report
          )
        );
        setGenerating(false);
        alert('Report generated successfully!');
      }, 3000);
      
    } catch (error) {
      console.error('Report generation error:', error);
      setGenerating(false);
      alert('Failed to generate report. Please try again.');
    }
  };

  const handlePreviewReport = (report: GeneratedReport) => {
    setPreviewReport(report);
  };

  const handleUseTemplate = (templateName: string) => {
    alert(`Template "${templateName}" selected. This would pre-fill the report configuration.`);
  };

  const getAvailableFormats = () => {
    const report = reportTypes.find(r => r.id === selectedReport);
    return report?.format || [];
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="default" className="bg-green-600"><CheckCircle className="h-3 w-3 mr-1" />Completed</Badge>;
      case 'processing':
        return <Badge variant="secondary"><div className="animate-spin rounded-full h-3 w-3 border-b-2 border-gray-600 mr-1"></div>Processing</Badge>;
      case 'failed':
        return <Badge variant="destructive"><AlertCircle className="h-3 w-3 mr-1" />Failed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${diffInHours} hours ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays} days ago`;
    }
  };

  // Mock data for each report type
  const getMockReportData = (report: GeneratedReport) => {
    if (report.type === 'user-activity' && reportData) {
      return (
        <div>
          <h3 className="font-bold mb-2">User Activity Data</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full text-xs border">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-2 border">ID</th>
                  <th className="p-2 border">Name</th>
                  <th className="p-2 border">Email</th>
                  <th className="p-2 border">Last Login</th>
                  <th className="p-2 border">Active</th>
                </tr>
              </thead>
              <tbody>
                {reportData?.users && reportData.users.length > 0 ? (
                  reportData.users.map((u: any) => (
                    <tr key={u.id}>
                      <td className="p-2 border">{u.id}</td>
                      <td className="p-2 border">{u.name}</td>
                      <td className="p-2 border">{u.email}</td>
                      <td className="p-2 border">{u.last_login ? new Date(u.last_login).toLocaleString() : '-'}</td>
                      <td className="p-2 border">{u.is_active ? 'Yes' : 'No'}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5}>No users found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      );
    }
    if (report.type === 'session-analytics' && reportData) {
      return (
        <div className="space-y-4">
          <div>
            <h3 className="font-bold mb-2">Sessions Per User</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full text-xs border">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="p-2 border">User</th>
                    <th className="p-2 border">Email</th>
                    <th className="p-2 border">Session Count</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.sessionsPerUser && reportData.sessionsPerUser.length > 0 ? (
                    reportData.sessionsPerUser.map((u: any) => (
                      <tr key={u.id}>
                        <td className="p-2 border">{u.name}</td>
                        <td className="p-2 border">{u.email}</td>
                        <td className="p-2 border">{u.session_count}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3}>No session data found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
          <div>
            <h3 className="font-bold mb-2">Recent Sessions</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full text-xs border">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="p-2 border">Session ID</th>
                    <th className="p-2 border">User ID</th>
                    <th className="p-2 border">Name</th>
                    <th className="p-2 border">Updated At</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.recentSessions && reportData.recentSessions.length > 0 ? (
                    reportData.recentSessions.map((s: any) => (
                      <tr key={s.id}>
                        <td className="p-2 border">{s.id}</td>
                        <td className="p-2 border">{s.user_id}</td>
                        <td className="p-2 border">{s.name}</td>
                        <td className="p-2 border">{s.updated_at ? new Date(s.updated_at).toLocaleString() : '-'}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4}>No recent sessions found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      );
    }
    switch (report.type) {
      case 'revenue-analytics':
        return (
          <div>
            <h3 className="font-bold mb-2">Revenue Analytics</h3>
            <ul className="text-sm list-disc pl-5">
              <li>Total revenue: $2,500</li>
              <li>New subscriptions: 8</li>
              <li>Renewals: 12</li>
              <li>Churn rate: 3%</li>
            </ul>
          </div>
        );
      case 'content-moderation':
        return (
          <div>
            <h3 className="font-bold mb-2">Content Moderation</h3>
            <ul className="text-sm list-disc pl-5">
              <li>Flagged posts: 4</li>
              <li>Removed content: 2</li>
              <li>Warnings issued: 3</li>
            </ul>
          </div>
        );
      case 'growth-metrics':
        return (
          <div>
            <h3 className="font-bold mb-2">Growth Metrics</h3>
            <ul className="text-sm list-disc pl-5">
              <li>New users: 30</li>
              <li>Retention rate: 85%</li>
              <li>Referral signups: 7</li>
            </ul>
          </div>
        );
      case 'subscription-report':
        return (
          <div>
            <h3 className="font-bold mb-2">Subscription Report</h3>
            <ul className="text-sm list-disc pl-5">
              <li>Active subscriptions: 40</li>
              <li>Expired: 5</li>
              <li>Upcoming renewals: 6</li>
            </ul>
          </div>
        );
      default:
        return <div>No data available for this report.</div>;
    }
  };

  const handleDownloadCSV = () => {
    if (!previewReport || !reportData) return;
    let csv = "";
    let filename = "report-" + previewReport.type + "-" + new Date().toISOString() + ".csv";
    if (previewReport.type === 'user-activity' && reportData.users) {
      csv = arrayToCSV(reportData.users, ["id", "name", "email", "last_login", "is_active"]);
    } else if (previewReport.type === 'session-analytics') {
      let csvParts: string[] = [];
      if (reportData.sessionsPerUser) {
        csvParts.push('Sessions Per User');
        csvParts.push(arrayToCSV(reportData.sessionsPerUser, ["id", "name", "email", "session_count"]));
      }
      if (reportData.recentSessions) {
        csvParts.push(''); // blank line
        csvParts.push('Recent Sessions');
        csvParts.push(arrayToCSV(reportData.recentSessions, ["id", "name", "user_id", "updated_at"]));
      }
      csv = csvParts.join("\n");
    } else {
      return;
    }
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, filename);
  };

  // Add a new handler to fetch and download report data from the list
  const handleDownloadCSVFromList = async (report: GeneratedReport) => {
    let endpoint = "";
    let filename = "report-" + report.type + "-" + new Date().toISOString() + ".csv";
    if (report.type === 'user-activity') {
      endpoint = `${API_URL}/admin/reports/user-activity`;
    } else if (report.type === 'session-analytics') {
      endpoint = `${API_URL}/admin/reports/session-analytics`;
    } else {
      return;
    }
    const token = localStorage.getItem("token");
    const res = await fetch(endpoint, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();
    let csv = "";
    if (report.type === 'user-activity' && data.users) {
      csv = arrayToCSV(data.users, ["id", "name", "email", "last_login", "is_active"]);
    } else if (report.type === 'session-analytics') {
      let csvParts: string[] = [];
      if (data.sessionsPerUser) {
        csvParts.push('Sessions Per User');
        csvParts.push(arrayToCSV(data.sessionsPerUser, ["id", "name", "email", "session_count"]));
      }
      if (data.recentSessions) {
        csvParts.push(''); // blank line
        csvParts.push('Recent Sessions');
        csvParts.push(arrayToCSV(data.recentSessions, ["id", "name", "user_id", "updated_at"]));
      }
      csv = csvParts.join("\n");
    }
    if (csv) {
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      saveAs(blob, filename);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFF8E1] via-[#FFF3E0] to-[#FDEBD0] flex flex-col">
      <div className="max-w-7xl w-full py-12 px-4 mx-auto space-y-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-extrabold text-gray-900 drop-shadow mb-2">Reports & Analytics</h1>
          {/* Add any top-level actions here if needed */}
        </div>

        {/* Report Types */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reportTypes.map((report) => {
            const Icon = report.icon;
            const isSelected = selectedReport === report.id;
            
            return (
              <Card 
                key={report.id} 
                className={`cursor-pointer transition-all ${
                  isSelected ? 'ring-2 ring-indigo-500 bg-indigo-50' : 'hover:shadow-md'
                }`}
                onClick={() => setSelectedReport(report.id)}
              >
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${
                      isSelected ? 'bg-indigo-100' : 'bg-gray-100'
                    }`}>
                      <Icon className={`h-5 w-5 ${
                        isSelected ? 'text-indigo-600' : 'text-gray-600'
                      }`} />
                    </div>
                    <div>
                      <CardTitle className="text-base">{report.name}</CardTitle>
                      <p className="text-sm text-gray-500">{report.description}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-1">
                    {report.format.map((format) => (
                      <span 
                        key={format} 
                        className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded"
                      >
                        {format}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Report Configuration */}
        {selectedReport && (
          <Card className="rounded-2xl shadow-2xl bg-gradient-to-br from-white via-[#FFF8E1] to-[#FDEBD0] border-2 border-[#FFD700]/30">
            <CardHeader>
              <CardTitle>Generate Report</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Report Type
                  </label>
                  <Select value={selectedReport} onValueChange={setSelectedReport}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {reportTypes.map((report) => (
                        <SelectItem key={report.id} value={report.id}>
                          {report.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Format
                  </label>
                  <Select value={selectedFormat} onValueChange={setSelectedFormat}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select format" />
                    </SelectTrigger>
                    <SelectContent>
                      {getAvailableFormats().map((format) => (
                        <SelectItem key={format} value={format}>
                          {format}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date Range
                  </label>
                  <Select value={dateRange} onValueChange={setDateRange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7">Last 7 days</SelectItem>
                      <SelectItem value="30">Last 30 days</SelectItem>
                      <SelectItem value="90">Last 90 days</SelectItem>
                      <SelectItem value="365">Last year</SelectItem>
                      <SelectItem value="all">All time</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="mt-6">
                <Button 
                  onClick={handleGenerateReport}
                  disabled={!selectedReport || !selectedFormat || generating}
                  className="flex items-center gap-2"
                >
                  {generating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Generating...
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4" />
                      Generate Report
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recent Reports */}
        <Card className="rounded-2xl shadow-2xl bg-gradient-to-br from-white via-[#FFF8E1] to-[#FDEBD0] border-2 border-[#FFD700]/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Recent Reports
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {generatedReports.map((report) => (
                <div key={report.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-blue-600" />
                    <div>
                      <div className="font-semibold">{report.name}</div>
                      <div className="text-xs text-muted-foreground">{report.generatedAt}</div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                      onClick={() => setPreviewReport(report)}
                    >
                      Preview
                    </button>
                    <button
                      className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition"
                      onClick={() => handleDownloadCSVFromList(report)}
                      type="button"
                    >
                      Download
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Report Preview Modal */}
        <Dialog open={!!previewReport} onOpenChange={() => setPreviewReport(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Report Preview</DialogTitle>
              <DialogDescription>
                This modal previews the selected admin report with real data.
              </DialogDescription>
            </DialogHeader>
            {previewReport && (
              <div className="space-y-2">
                <div className="font-semibold">{previewReport.name} ({previewReport.format})</div>
                <div className="text-xs text-gray-500 mb-2">Generated {formatDate(previewReport.generatedAt)}</div>
                {reportLoading && <div className="text-center py-4">Loading...</div>}
                {reportError && <div className="text-center text-red-600 py-4">{reportError}</div>}
                {!reportLoading && !reportError && getMockReportData(previewReport)}
                <DialogClose asChild>
                  <Button variant="outline" className="mt-4 w-full">Close</Button>
                </DialogClose>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Report Templates */}
        <Card className="rounded-2xl shadow-2xl bg-gradient-to-br from-white via-[#FFF8E1] to-[#FDEBD0] border-2 border-[#FFD700]/30">
          <CardHeader>
            <CardTitle>Report Templates</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border rounded-lg p-4">
                <h4 className="font-medium mb-2">Monthly Executive Summary</h4>
                <p className="text-sm text-gray-600 mb-3">
                  High-level overview of key metrics for executive review
                </p>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleUseTemplate('Monthly Executive Summary')}
                >
                  Use Template
                </Button>
              </div>

              <div className="border rounded-lg p-4">
                <h4 className="font-medium mb-2">Weekly Operations Report</h4>
                <p className="text-sm text-gray-600 mb-3">
                  Detailed operational metrics and user activity
                </p>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleUseTemplate('Weekly Operations Report')}
                >
                  Use Template
                </Button>
              </div>

              <div className="border rounded-lg p-4">
                <h4 className="font-medium mb-2">Quarterly Business Review</h4>
                <p className="text-sm text-gray-600 mb-3">
                  Comprehensive quarterly performance analysis
                </p>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleUseTemplate('Quarterly Business Review')}
                >
                  Use Template
                </Button>
              </div>

              <div className="border rounded-lg p-4">
                <h4 className="font-medium mb-2">Custom Report Builder</h4>
                <p className="text-sm text-gray-600 mb-3">
                  Create custom reports with specific metrics
                </p>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleUseTemplate('Custom Report Builder')}
                >
                  Create Custom
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 