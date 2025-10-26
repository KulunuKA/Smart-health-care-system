import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  FileText, 
  Download, 
  Plus,
  Filter,
  Search,
  Eye,
  Edit,
  Trash2,
  Calendar,
  Users,
  DollarSign,
  Activity,
  TrendingUp,
  BarChart3,
  Clock,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  Settings,
  Copy
} from 'lucide-react';
import Card from '../components/common/Card';
import Loader from '../components/common/Loader';
import Modal from '../components/common/Modal';
import ReportsService from '../services/reportsService';

/**
 * Reports Management Page Component
 * Comprehensive report generation, management, and export functionality
 */
const ReportsManagement = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [reports, setReports] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  // Report generation form state
  const [reportForm, setReportForm] = useState({
    title: '',
    description: '',
    reportType: 'patient_summary',
    dateRange: {
      startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0]
    },
    filters: {
      doctorId: '',
      gender: '',
      status: ''
    },
    format: 'json',
    accessLevel: 'private',
    tags: []
  });

  useEffect(() => {
    fetchReports();
    fetchTemplates();
  }, []);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const response = await ReportsService.getAllReports({
        search: searchTerm,
        reportType: filterType,
        status: filterStatus,
        limit: 50
      });
      setReports(response.data.reports || []);
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTemplates = async () => {
    try {
      const response = await ReportsService.getReportTemplates();
      setTemplates(response.data || []);
    } catch (error) {
      console.error('Error fetching templates:', error);
    }
  };

  const generateReport = async () => {
    setGenerating(true);
    try {
      const reportData = ReportsService.formatReportParameters({
        reportType: reportForm.reportType,
        dateRange: reportForm.dateRange,
        filters: reportForm.filters,
        groupBy: 'month',
        sortBy: { field: 'date', order: 'desc' }
      });

      const response = await ReportsService.generateReport({
        title: reportForm.title,
        description: reportForm.description,
        ...reportData,
        format: reportForm.format,
        accessLevel: reportForm.accessLevel,
        tags: reportForm.tags
      });

      setReports(prev => [response.data, ...prev]);
      setShowGenerateModal(false);
      resetForm();
    } catch (error) {
      console.error('Error generating report:', error);
      alert('Failed to generate report: ' + error.message);
    } finally {
      setGenerating(false);
    }
  };

  const viewReport = async (reportId) => {
    try {
      const response = await ReportsService.getReportById(reportId);
      setSelectedReport(response.data);
      setShowViewModal(true);
    } catch (error) {
      console.error('Error fetching report:', error);
      alert('Failed to fetch report: ' + error.message);
    }
  };

  const exportReport = async (reportId, format) => {
    try {
      const response = await ReportsService.exportReport(reportId, format);
      
      if (format === 'json') {
        const blob = new Blob([JSON.stringify(response, null, 2)], { type: 'application/json' });
        ReportsService.downloadFile(blob, `report-${reportId}.json`, 'application/json');
      } else {
        ReportsService.downloadFile(response, `report-${reportId}.${format}`, 'text/csv');
      }
    } catch (error) {
      console.error('Error exporting report:', error);
      alert('Failed to export report: ' + error.message);
    }
  };

  const deleteReport = async (reportId) => {
    if (window.confirm('Are you sure you want to delete this report?')) {
      try {
        await ReportsService.deleteReport(reportId);
        setReports(prev => prev.filter(report => report._id !== reportId));
      } catch (error) {
        console.error('Error deleting report:', error);
        alert('Failed to delete report: ' + error.message);
      }
    }
  };

  const duplicateReport = async (report) => {
    setReportForm({
      title: `${report.title} (Copy)`,
      description: report.description,
      reportType: report.reportType,
      dateRange: report.parameters?.dateRange || {
        startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0]
      },
      filters: report.parameters?.filters || {},
      format: report.format,
      accessLevel: report.accessLevel,
      tags: report.tags || []
    });
    setShowGenerateModal(true);
  };

  const resetForm = () => {
    setReportForm({
      title: '',
      description: '',
      reportType: 'patient_summary',
      dateRange: {
        startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0]
      },
      filters: {
        doctorId: '',
        gender: '',
        status: ''
      },
      format: 'json',
      accessLevel: 'private',
      tags: []
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100';
      case 'generating': return 'text-yellow-600 bg-yellow-100';
      case 'failed': return 'text-red-600 bg-red-100';
      case 'pending': return 'text-blue-600 bg-blue-100';
      case 'cancelled': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'generating': return <Clock className="w-4 h-4" />;
      case 'failed': return <AlertTriangle className="w-4 h-4" />;
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'cancelled': return <AlertTriangle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getReportTypeIcon = (type) => {
    switch (type) {
      case 'patient_summary': return <Users className="w-4 h-4" />;
      case 'appointment_summary': return <Calendar className="w-4 h-4" />;
      case 'financial_summary': return <DollarSign className="w-4 h-4" />;
      case 'doctor_performance': return <Activity className="w-4 h-4" />;
      case 'medical_trends': return <TrendingUp className="w-4 h-4" />;
      case 'system_usage': return <BarChart3 className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const filteredReports = reports.filter(report => {
    const matchesSearch = report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = !filterType || report.reportType === filterType;
    const matchesStatus = !filterStatus || report.status === filterStatus;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader size="lg" text="Loading reports..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Reports Management</h1>
            <p className="text-gray-600 mt-2">Generate, manage, and export comprehensive reports</p>
          </div>
          <div className="flex space-x-2 mt-4 sm:mt-0">
            <button
              onClick={() => setShowTemplateModal(true)}
              className="btn-outline flex items-center"
            >
              <Settings className="w-4 h-4 mr-2" />
              Templates
            </button>
            <button
              onClick={() => setShowGenerateModal(true)}
              className="btn-primary flex items-center"
            >
              <Plus className="w-4 h-4 mr-2" />
              Generate Report
            </button>
          </div>
        </div>

        {/* Filters */}
        <Card className="p-6 mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="label">Search Reports</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search by title or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input-field pl-10"
                />
              </div>
            </div>
            <div className="sm:w-48">
              <label className="label">Report Type</label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="input-field"
              >
                <option value="">All Types</option>
                {ReportsService.getReportTypes().map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>
            <div className="sm:w-48">
              <label className="label">Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="input-field"
              >
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="generating">Generating</option>
                <option value="completed">Completed</option>
                <option value="failed">Failed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={fetchReports}
                className="btn-outline flex items-center"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </button>
            </div>
          </div>
        </Card>

        {/* Reports Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {filteredReports.map((report) => (
            <Card key={report._id} className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                    {getReportTypeIcon(report.reportType)}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 truncate">{report.title}</h3>
                    <p className="text-sm text-gray-600">{report.description}</p>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center ${getStatusColor(report.status)}`}>
                  {getStatusIcon(report.status)}
                  <span className="ml-1">{report.status}</span>
                </span>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="w-4 h-4 mr-2" />
                  <span>Created: {new Date(report.createdAt).toLocaleDateString()}</span>
                </div>
                {report.generatedAt && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Clock className="w-4 h-4 mr-2" />
                    <span>Generated: {new Date(report.generatedAt).toLocaleDateString()}</span>
                  </div>
                )}
                <div className="flex items-center text-sm text-gray-600">
                  <Eye className="w-4 h-4 mr-2" />
                  <span>{report.statistics?.views || 0} views</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex space-x-2">
                  <button
                    onClick={() => viewReport(report._id)}
                    className="p-2 text-blue-400 hover:text-blue-600"
                    title="View Report"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => duplicateReport(report)}
                    className="p-2 text-green-400 hover:text-green-600"
                    title="Duplicate Report"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => exportReport(report._id, report.format)}
                    className="p-2 text-purple-400 hover:text-purple-600"
                    title="Export Report"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
                <button
                  onClick={() => deleteReport(report._id)}
                  className="p-2 text-red-400 hover:text-red-600"
                  title="Delete Report"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {report.tags && report.tags.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex flex-wrap gap-1">
                    {report.tags.map((tag, index) => (
                      <span key={index} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>

        {filteredReports.length === 0 && (
          <Card className="p-12 text-center">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Reports Found</h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || filterType || filterStatus 
                ? 'No reports match your current filters.' 
                : 'Generate your first report to get started.'}
            </p>
            <button
              onClick={() => setShowGenerateModal(true)}
              className="btn-primary"
            >
              Generate Report
            </button>
          </Card>
        )}

        {/* Generate Report Modal */}
        <Modal
          isOpen={showGenerateModal}
          onClose={() => {
            setShowGenerateModal(false);
            resetForm();
          }}
          title="Generate New Report"
          size="lg"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Report Title</label>
                <input
                  type="text"
                  value={reportForm.title}
                  onChange={(e) => setReportForm(prev => ({ ...prev, title: e.target.value }))}
                  className="input-field"
                  placeholder="Enter report title"
                  required
                />
              </div>
              <div>
                <label className="label">Report Type</label>
                <select
                  value={reportForm.reportType}
                  onChange={(e) => setReportForm(prev => ({ ...prev, reportType: e.target.value }))}
                  className="input-field"
                >
                  {ReportsService.getReportTypes().map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="label">Description</label>
              <textarea
                value={reportForm.description}
                onChange={(e) => setReportForm(prev => ({ ...prev, description: e.target.value }))}
                className="input-field"
                rows={3}
                placeholder="Enter report description"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Start Date</label>
                <input
                  type="date"
                  value={reportForm.dateRange.startDate}
                  onChange={(e) => setReportForm(prev => ({ 
                    ...prev, 
                    dateRange: { ...prev.dateRange, startDate: e.target.value }
                  }))}
                  className="input-field"
                />
              </div>
              <div>
                <label className="label">End Date</label>
                <input
                  type="date"
                  value={reportForm.dateRange.endDate}
                  onChange={(e) => setReportForm(prev => ({ 
                    ...prev, 
                    dateRange: { ...prev.dateRange, endDate: e.target.value }
                  }))}
                  className="input-field"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Format</label>
                <select
                  value={reportForm.format}
                  onChange={(e) => setReportForm(prev => ({ ...prev, format: e.target.value }))}
                  className="input-field"
                >
                  {ReportsService.getExportFormats().map(format => (
                    <option key={format.value} value={format.value}>{format.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Access Level</label>
                <select
                  value={reportForm.accessLevel}
                  onChange={(e) => setReportForm(prev => ({ ...prev, accessLevel: e.target.value }))}
                  className="input-field"
                >
                  <option value="public">Public</option>
                  <option value="private">Private</option>
                  <option value="restricted">Restricted</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                onClick={() => {
                  setShowGenerateModal(false);
                  resetForm();
                }}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={generateReport}
                disabled={generating || !reportForm.title}
                className="btn-primary"
              >
                {generating ? 'Generating...' : 'Generate Report'}
              </button>
            </div>
          </div>
        </Modal>

        {/* View Report Modal */}
        <Modal
          isOpen={showViewModal}
          onClose={() => setShowViewModal(false)}
          title={selectedReport?.title || 'Report Details'}
          size="xl"
        >
          {selectedReport && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Report Type</label>
                  <p className="text-gray-900">{selectedReport.reportType}</p>
                </div>
                <div>
                  <label className="label">Status</label>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center w-fit ${getStatusColor(selectedReport.status)}`}>
                    {getStatusIcon(selectedReport.status)}
                    <span className="ml-1">{selectedReport.status}</span>
                  </span>
                </div>
              </div>

              <div>
                <label className="label">Description</label>
                <p className="text-gray-900">{selectedReport.description}</p>
              </div>

              {selectedReport.content && (
                <div>
                  <label className="label">Report Content</label>
                  <div className="bg-gray-50 p-4 rounded-lg max-h-96 overflow-y-auto">
                    <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                      {JSON.stringify(selectedReport.content, null, 2)}
                    </pre>
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  onClick={() => exportReport(selectedReport._id, selectedReport.format)}
                  className="btn-outline flex items-center"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </button>
                <button
                  onClick={() => setShowViewModal(false)}
                  className="btn-secondary"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </Modal>

        {/* Templates Modal */}
        <Modal
          isOpen={showTemplateModal}
          onClose={() => setShowTemplateModal(false)}
          title="Report Templates"
          size="lg"
        >
          <div className="space-y-4">
            {templates.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {templates.map((template) => (
                  <div key={template._id} className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors cursor-pointer">
                    <h4 className="font-medium text-gray-900 mb-1">{template.title}</h4>
                    <p className="text-sm text-gray-600 mb-2">{template.description}</p>
                    <div className="flex items-center text-xs text-gray-500">
                      <span className="mr-2">{template.reportType}</span>
                      <span>Created by {template.createdBy?.firstName}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Settings className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Templates Available</h3>
                <p className="text-gray-600">Create your first report template to get started.</p>
              </div>
            )}
            <div className="flex justify-end pt-4">
              <button
                onClick={() => setShowTemplateModal(false)}
                className="btn-secondary"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default ReportsManagement;
