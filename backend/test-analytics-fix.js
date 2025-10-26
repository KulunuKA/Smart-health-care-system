import axios from 'axios';

const BASE_URL = 'http://localhost:5000';

async function testAnalyticsGeneration() {
  try {
    console.log('Testing Analytics Generation...');
    
    // Test data
    const testData = {
      startDate: '2024-01-01',
      endDate: '2024-12-31',
      reportType: 'monthly'
    };

    console.log('Sending request to generate analytics...');
    const response = await axios.post(`${BASE_URL}/analytics/generate`, testData);
    
    console.log('✅ Analytics generated successfully!');
    console.log('Response:', JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.error('❌ Error generating analytics:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
  }
}

async function testDashboardSummary() {
  try {
    console.log('\nTesting Dashboard Summary...');
    
    const response = await axios.get(`${BASE_URL}/analytics/dashboard/summary`);
    
    console.log('✅ Dashboard summary retrieved successfully!');
    console.log('Response:', JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.error('❌ Error getting dashboard summary:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
  }
}

// Run tests
async function runTests() {
  await testAnalyticsGeneration();
  await testDashboardSummary();
}

runTests();
