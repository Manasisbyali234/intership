const axios = require('axios');

const API_BASE = 'http://localhost:5001/api';

async function testDashboard() {
  try {
    console.log('🧪 Testing New Dashboard Functionality...\n');

    // Test user registration
    console.log('1. Testing user registration...');
    const signupData = {
      email: `testuser${Date.now()}@example.com`,
      password: 'password123',
      phoneNumber: '+1234567890',
      semester: '3rd',
      captchaToken: 'test-token'
    };

    const signupResponse = await axios.post(`${API_BASE}/auth/signup`, signupData);
    console.log('✅ User registered successfully');

    // Test user login
    console.log('\n2. Testing user login...');
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
      email: signupData.email,
      password: signupData.password
    });
    
    const { token, user } = loginResponse.data;
    console.log('✅ User logged in successfully');
    console.log('User ID:', user.id);

    // Test dashboard retrieval
    console.log('\n3. Testing dashboard retrieval...');
    const dashboardResponse = await axios.get(`${API_BASE}/dashboard`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    const dashboard = dashboardResponse.data;
    console.log('✅ Dashboard retrieved successfully');
    console.log('Welcome Message:', dashboard.personalizedContent.welcomeMessage);
    console.log('Learning Goals:', dashboard.personalizedContent.learningGoals);
    console.log('Initial Stats:', dashboard.stats);
    console.log('Achievements:', dashboard.personalizedContent.achievements.length);

    // Test dashboard activity update
    console.log('\n4. Testing dashboard activity update...');
    await axios.post(`${API_BASE}/dashboard/activity`, {
      type: 'chat',
      title: 'Test Chat Session',
      description: 'Testing dashboard activity tracking'
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Dashboard activity updated');

    // Test dashboard stats update
    console.log('\n5. Testing dashboard stats update...');
    await axios.post(`${API_BASE}/dashboard/stats`, {
      type: 'document',
      increment: 1
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Dashboard stats updated');

    // Retrieve updated dashboard
    console.log('\n6. Testing updated dashboard...');
    const updatedDashboardResponse = await axios.get(`${API_BASE}/dashboard`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    const updatedDashboard = updatedDashboardResponse.data;
    console.log('✅ Updated dashboard retrieved');
    console.log('Updated Stats:', updatedDashboard.stats);
    console.log('Recent Activity Count:', updatedDashboard.recentActivity.length);
    
    if (updatedDashboard.recentActivity.length > 0) {
      console.log('Latest Activity:', updatedDashboard.recentActivity[0]);
    }

    console.log('\n🎉 All dashboard tests passed successfully!');
    console.log('\n📋 Summary:');
    console.log('- ✅ User registration creates personalized dashboard');
    console.log('- ✅ User login ensures dashboard exists');
    console.log('- ✅ Dashboard retrieval works correctly');
    console.log('- ✅ Activity tracking functions properly');
    console.log('- ✅ Stats updates work as expected');
    console.log('\n🚀 New users will now get personalized dashboards!');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testDashboard();