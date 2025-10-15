const axios = require('axios');

async function testDashboard() {
  try {
    console.log('🧪 Testing Dashboard API directly...\n');

    // Login as Semester 3 student
    const loginResponse = await axios.post('http://localhost:5001/api/auth/login', {
      email: 'student3@example.com',
      password: 'student123'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Student logged in successfully');
    console.log('User data:', loginResponse.data.user);
    console.log();

    // Get dashboard
    const dashboardResponse = await axios.get('http://localhost:5001/api/dashboard', {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('📊 Dashboard Response:');
    console.log('User semester:', dashboardResponse.data.userId?.semester);
    console.log('Semester content:', dashboardResponse.data.semesterContent);
    console.log();

    // Check if content exists
    const content = dashboardResponse.data.semesterContent;
    if (content) {
      console.log('📚 Content Summary:');
      console.log(`   Notes: ${content.notes?.length || 0}`);
      console.log(`   Important Notes: ${content.importantNotes?.length || 0}`);
      console.log(`   MCQ Tests: ${content.mcqTests?.length || 0}`);
      console.log(`   Timetables: ${content.timetables?.length || 0}`);
      
      if (content.notes?.length > 0) {
        console.log('\n📝 Notes found:');
        content.notes.forEach(note => {
          console.log(`   - ${note.title} (Semester: ${note.semester})`);
        });
      }
      
      if (content.importantNotes?.length > 0) {
        console.log('\n⚠️ Important Notes found:');
        content.importantNotes.forEach(note => {
          console.log(`   - ${note.title} (Semester: ${note.semester})`);
        });
      }
      
      if (content.mcqTests?.length > 0) {
        console.log('\n🧠 MCQ Tests found:');
        content.mcqTests.forEach(test => {
          console.log(`   - ${test.title} (Semester: ${test.semester})`);
        });
      }
    }

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

testDashboard();