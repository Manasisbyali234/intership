const axios = require('axios');

const testCleanSemester = async () => {
  console.log('🧪 Testing Account Creation with Clean Semester Numbers...\n');

  const testUser = {
    email: 'clean.semester@test.com',
    password: 'password123',
    phoneNumber: '+1234567890',
    semester: '3',
    captchaToken: 'test-token'
  };

  try {
    console.log(`📝 Creating account with semester: ${testUser.semester}`);
    
    const response = await axios.post('http://localhost:5001/api/auth/signup', testUser);
    
    console.log(`✅ Success: ${response.data.message}`);
    console.log(`   Semester stored as: ${response.data.user.semester}`);
    
  } catch (error) {
    console.log(`❌ Error:`, error.response?.data?.error || error.message);
  }
};

testCleanSemester().catch(console.error);