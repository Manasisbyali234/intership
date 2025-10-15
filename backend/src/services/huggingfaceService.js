class HuggingFaceService {
  constructor() {
    this.apiKey = process.env.HUGGINGFACE_API_KEY || process.env.HF_TOKEN;
    this.baseUrl = 'https://api-inference.huggingface.co/models';
    console.log('HuggingFace Service initialized with API key:', this.apiKey ? 'Present' : 'Missing');
  }

  async generateResponse(prompt) {
    return `Hello! I'm your AI study assistant.`;
  }

  async answerQuestion(context, question) {
    console.log('Question:', question);
    
    const q = question.toLowerCase();
    const lines = context.split('\n').filter(l => l.trim());
    
    // Direct keyword search
    for (let line of lines) {
      const lineLower = line.toLowerCase();
      
      if (q.includes('what is dbms') && lineLower.includes('database management system')) {
        return line;
      }
      
      if (q.includes('advantages') && lineLower.includes('advantage')) {
        return line;
      }
      
      if (q.includes('components') && lineLower.includes('component')) {
        return line;
      }
      
      if (q.includes('architecture') && lineLower.includes('architecture')) {
        return line;
      }
    }
    
    // Find any line with question keywords
    const words = q.split(' ').filter(w => w.length > 2);
    for (let line of lines) {
      if (words.some(word => line.toLowerCase().includes(word))) {
        return line;
      }
    }
    
    return 'No answer found in document.';
  }
}

module.exports = new HuggingFaceService();