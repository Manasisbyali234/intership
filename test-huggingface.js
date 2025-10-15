require('dotenv').config({ path: './backend/.env' });
const huggingfaceService = require('./backend/src/services/huggingfaceService');

async function testHuggingFace() {
  console.log('Testing Hugging Face API integration...');
  
  const testQuestion = "What is machine learning?";
  const testContext = "Machine learning is a subset of artificial intelligence that enables computers to learn and make decisions from data without being explicitly programmed.";
  
  try {
    const response = await huggingfaceService.answerQuestion(testContext, testQuestion);
    
    if (response) {
      console.log('✅ Hugging Face API working!');
      console.log('Response:', response);
    } else {
      console.log('❌ No response from Hugging Face API');
      console.log('Check your API key in backend/.env file');
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testHuggingFace();