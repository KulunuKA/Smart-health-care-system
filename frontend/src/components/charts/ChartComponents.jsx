import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
} from 'chart.js';
import { Bar, Pie, Line, Doughnut } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

// Chart configuration
const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top',
    },
    title: {
      display: true,
      font: {
        size: 16,
        weight: 'bold'
      }
    },
  },
  scales: {
    y: {
      beginAtZero: true,
    },
  },
};

// Patient Demographics Pie Chart
export const PatientDemographicsChart = ({ data }) => {
  if (!data || !data.patientMetrics?.genderDistribution) {
    // Fallback data for demonstration
    const fallbackData = {
      labels: ['Male', 'Female', 'Other'],
      datasets: [
        {
          data: [45, 50, 5],
          backgroundColor: [
            '#3B82F6', // Blue for male
            '#EC4899', // Pink for female
            '#10B981', // Green for other
          ],
          borderColor: [
            '#1E40AF',
            '#BE185D',
            '#059669',
          ],
          borderWidth: 2,
        },
      ],
    };
    return (
      <div className="h-64">
        <Pie data={fallbackData} options={chartOptions} />
      </div>
    );
  }

  const chartData = {
    labels: Object.keys(data.patientMetrics.genderDistribution),
    datasets: [
      {
        data: Object.values(data.patientMetrics.genderDistribution),
        backgroundColor: [
          '#3B82F6', // Blue for male
          '#EC4899', // Pink for female
          '#10B981', // Green for other
        ],
        borderColor: [
          '#1E40AF',
          '#BE185D',
          '#059669',
        ],
        borderWidth: 2,
      },
    ],
  };

  return (
    <div className="h-64">
      <Pie data={chartData} options={chartOptions} />
    </div>
  );
};

// Age Group Distribution Bar Chart
export const AgeGroupChart = ({ data }) => {
  if (!data || !data.patientMetrics?.ageGroupDistribution) {
    // Fallback data for demonstration
    const fallbackData = {
      labels: ['0-18', '19-35', '36-50', '51-65', '65+'],
      datasets: [
        {
          label: 'Number of Patients',
          data: [120, 180, 150, 100, 80],
          backgroundColor: [
            '#3B82F6',
            '#8B5CF6',
            '#10B981',
            '#F59E0B',
            '#EF4444',
          ],
          borderColor: [
            '#1E40AF',
            '#7C3AED',
            '#059669',
            '#D97706',
            '#DC2626',
          ],
          borderWidth: 2,
        },
      ],
    };
    return (
      <div className="h-64">
        <Bar data={fallbackData} options={chartOptions} />
      </div>
    );
  }

  const chartData = {
    labels: Object.keys(data.patientMetrics.ageGroupDistribution),
    datasets: [
      {
        label: 'Number of Patients',
        data: Object.values(data.patientMetrics.ageGroupDistribution),
        backgroundColor: [
          '#3B82F6',
          '#8B5CF6',
          '#10B981',
          '#F59E0B',
          '#EF4444',
        ],
        borderColor: [
          '#1E40AF',
          '#7C3AED',
          '#059669',
          '#D97706',
          '#DC2626',
        ],
        borderWidth: 2,
      },
    ],
  };

  return (
    <div className="h-64">
      <Bar data={chartData} options={chartOptions} />
    </div>
  );
};

// Appointment Status Doughnut Chart
export const AppointmentStatusChart = ({ data }) => {
  if (!data || !data.appointmentMetrics) return null;

  const { appointmentMetrics } = data;
  const chartData = {
    labels: ['Scheduled', 'Confirmed', 'Completed', 'Cancelled'],
    datasets: [
      {
        data: [
          appointmentMetrics.scheduledAppointments || 0,
          appointmentMetrics.confirmedAppointments || 0,
          appointmentMetrics.completedAppointments || 0,
          appointmentMetrics.cancelledAppointments || 0,
        ],
        backgroundColor: [
          '#F59E0B', // Yellow for scheduled
          '#3B82F6', // Blue for confirmed
          '#10B981', // Green for completed
          '#EF4444', // Red for cancelled
        ],
        borderColor: [
          '#D97706',
          '#1E40AF',
          '#059669',
          '#DC2626',
        ],
        borderWidth: 2,
      },
    ],
  };

  return (
    <div className="h-64">
      <Doughnut data={chartData} options={chartOptions} />
    </div>
  );
};

// Revenue Trend Line Chart
export const RevenueTrendChart = ({ data }) => {
  if (!data || !data.financialMetrics?.revenueByMonth) return null;

  const { revenueByMonth } = data.financialMetrics;
  const chartData = {
    labels: revenueByMonth.map(item => item.month),
    datasets: [
      {
        label: 'Revenue ($)',
        data: revenueByMonth.map(item => item.amount),
        borderColor: '#10B981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#10B981',
        pointBorderColor: '#059669',
        pointBorderWidth: 2,
        pointRadius: 6,
      },
    ],
  };

  const lineOptions = {
    ...chartOptions,
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return '$' + value.toLocaleString();
          }
        }
      },
    },
  };

  return (
    <div className="h-64">
      <Line data={chartData} options={lineOptions} />
    </div>
  );
};

// Doctor Performance Bar Chart
export const DoctorPerformanceChart = ({ data }) => {
  if (!data || !data.doctorMetrics?.doctorUtilization) return null;

  const { doctorUtilization } = data.doctorMetrics;
  const topDoctors = doctorUtilization.slice(0, 8); // Show top 8 doctors

  const chartData = {
    labels: topDoctors.map(doc => doc.doctorName.split(' ')[0]), // First name only
    datasets: [
      {
        label: 'Appointments',
        data: topDoctors.map(doc => doc.appointmentCount),
        backgroundColor: '#3B82F6',
        borderColor: '#1E40AF',
        borderWidth: 2,
      },
    ],
  };

  return (
    <div className="h-64">
      <Bar data={chartData} options={chartOptions} />
    </div>
  );
};

// Payment Method Distribution Pie Chart
export const PaymentMethodChart = ({ data }) => {
  if (!data || !data.financialMetrics?.paymentMethodDistribution) return null;

  const { paymentMethodDistribution } = data.financialMetrics;
  const chartData = {
    labels: Object.keys(paymentMethodDistribution).map(method => 
      method.charAt(0).toUpperCase() + method.slice(1)
    ),
    datasets: [
      {
        data: Object.values(paymentMethodDistribution),
        backgroundColor: [
          '#3B82F6', // Blue for card
          '#10B981', // Green for bank
          '#F59E0B', // Yellow for wallet
        ],
        borderColor: [
          '#1E40AF',
          '#059669',
          '#D97706',
        ],
        borderWidth: 2,
      },
    ],
  };

  return (
    <div className="h-64">
      <Pie data={chartData} options={chartOptions} />
    </div>
  );
};

// Peak Hours Bar Chart
export const PeakHoursChart = ({ data }) => {
  if (!data || !data.appointmentMetrics?.peakHours) return null;

  const { peakHours } = data.appointmentMetrics;
  const chartData = {
    labels: peakHours.map(hour => `${hour.hour}:00`),
    datasets: [
      {
        label: 'Appointments',
        data: peakHours.map(hour => hour.count),
        backgroundColor: '#8B5CF6',
        borderColor: '#7C3AED',
        borderWidth: 2,
      },
    ],
  };

  return (
    <div className="h-64">
      <Bar data={chartData} options={chartOptions} />
    </div>
  );
};

// Common Diagnoses Bar Chart
export const CommonDiagnosesChart = ({ data }) => {
  if (!data || !data.medicalMetrics?.commonDiagnoses) return null;

  const { commonDiagnoses } = data.medicalMetrics;
  const topDiagnoses = commonDiagnoses.slice(0, 8);

  const chartData = {
    labels: topDiagnoses.map(diagnosis => 
      diagnosis.diagnosis.length > 15 
        ? diagnosis.diagnosis.substring(0, 15) + '...'
        : diagnosis.diagnosis
    ),
    datasets: [
      {
        label: 'Count',
        data: topDiagnoses.map(diagnosis => diagnosis.count),
        backgroundColor: '#EF4444',
        borderColor: '#DC2626',
        borderWidth: 2,
      },
    ],
  };

  return (
    <div className="h-64">
      <Bar data={chartData} options={chartOptions} />
    </div>
  );
};

// Geographic Distribution Bar Chart
export const GeographicChart = ({ data }) => {
  if (!data || !data.geographicMetrics?.patientDistributionByCity) return null;

  const { patientDistributionByCity } = data.geographicMetrics;
  const topCities = patientDistributionByCity.slice(0, 8);

  const chartData = {
    labels: topCities.map(city => city.city),
    datasets: [
      {
        label: 'Patients',
        data: topCities.map(city => city.count),
        backgroundColor: '#10B981',
        borderColor: '#059669',
        borderWidth: 2,
      },
    ],
  };

  return (
    <div className="h-64">
      <Bar data={chartData} options={chartOptions} />
    </div>
  );
};

// Dashboard Summary Charts
export const DashboardSummaryCharts = ({ summaryData }) => {
  if (!summaryData) return null;

  // Patient Flow Chart (mock data for demonstration)
  const patientFlowData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'New Patients',
        data: [120, 135, 150, 145, 160, summaryData.monthly?.newPatients || 175],
        borderColor: '#3B82F6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
      },
    ],
  };

  // Revenue by Department Chart (mock data for demonstration)
  const revenueData = {
    labels: ['Cardiology', 'Pediatrics', 'General', 'Emergency', 'Surgery'],
    datasets: [
      {
        label: 'Revenue ($)',
        data: [15000, 12000, 18000, 8000, 10000],
        backgroundColor: [
          '#3B82F6',
          '#10B981',
          '#F59E0B',
          '#EF4444',
          '#8B5CF6',
        ],
        borderColor: [
          '#1E40AF',
          '#059669',
          '#D97706',
          '#DC2626',
          '#7C3AED',
        ],
        borderWidth: 2,
      },
    ],
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Patient Flow Trend</h3>
        <div className="h-64">
          <Line data={patientFlowData} options={chartOptions} />
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue by Department</h3>
        <div className="h-64">
          <Bar data={revenueData} options={chartOptions} />
        </div>
      </div>
    </div>
  );
};
