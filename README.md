# AI Student Assistant - MERN Stack with RAG

A comprehensive AI-powered student assistant built with the MERN stack, featuring Retrieval-Augmented Generation (RAG), LangChain integration, and AWS services.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- MongoDB (local or Atlas)
- AWS Account (for production features)

### Development Setup

1. **Clone and Install**
   ```bash
   # Backend
   cd backend
   npm install
   
   # Frontend  
   cd ../frontend
   npm install --legacy-peer-deps
   ```

2. **Environment Setup**
   ```bash
   # Copy environment files
   cp backend/.env.example backend/.env
   cp frontend/.env.example frontend/.env
   ```

3. **Start Development Servers**
   ```bash
   # Option 1: Use batch script (Windows)
   start-dev.bat
   
   # Option 2: Manual start
   # Terminal 1 - Backend
   cd backend && npm start
   
   # Terminal 2 - Frontend  
   cd frontend && npm start
   ```

4. **Access Application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5001
   - Socket.io: http://localhost:5001

## 🏗️ Architecture

### Tech Stack
- **Frontend**: React 18, Socket.io Client, Tailwind CSS
- **Backend**: Node.js, Express, Socket.io, MongoDB
- **AI/ML**: LangChain, Amazon Bedrock, RAG Pipeline
- **Cloud**: AWS (S3, Cognito, Bedrock, Transcribe, Polly, Translate)
- **Database**: MongoDB Atlas, Amazon OpenSearch (Vector DB)

### Key Features
- ✅ **Authentication**: AWS Cognito with OTP verification
- ✅ **Real-time Chat**: Socket.io powered conversations
- ✅ **Document Upload**: Multi-format support (PDF, DOCX, TXT)
- ✅ **RAG Pipeline**: Document processing and semantic search
- ✅ **AI Responses**: Context-aware answers using Bedrock
- 🔄 **Quiz Generation**: AI-powered quiz creation (In Progress)
- 🔄 **Study Plans**: Personalized learning schedules (In Progress)
- 🔄 **Voice Integration**: Speech-to-text and text-to-speech (In Progress)
- 🔄 **Multi-language**: Translation support (In Progress)

## 📁 Project Structure

```
ai-student-assistant/
├── backend/                 # Node.js/Express API
│   ├── src/
│   │   ├── controllers/     # Route handlers
│   │   ├── models/         # MongoDB schemas
│   │   ├── routes/         # API endpoints
│   │   ├── services/       # Business logic
│   │   ├── langchain/      # RAG implementation
│   │   └── app.js          # Express app
│   └── package.json
├── frontend/               # React application
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/         # Page components
│   │   ├── context/       # React contexts
│   │   ├── services/      # API services
│   │   └── App.js         # Main app
│   └── package.json
└── README.md
```

## 🔧 Development Mode

The application currently runs in **development mode** with mock services:

- **Mock Authentication**: Simple email/password login
- **Mock AWS Services**: Simulated S3, Bedrock, Cognito responses
- **Mock RAG**: Basic document processing simulation
- **Local Storage**: MongoDB for data persistence

## 🚀 Production Deployment

### AWS Services Required
1. **Amazon Cognito** - User authentication
2. **Amazon S3** - Document storage
3. **Amazon Bedrock** - LLM access (Claude, Titan)
4. **Amazon OpenSearch** - Vector database
5. **Amazon Transcribe** - Speech-to-text
6. **Amazon Polly** - Text-to-speech
7. **Amazon Translate** - Multi-language support

### Deployment Options
- **Backend**: AWS ECS Fargate, Elastic Beanstalk, or Lambda
- **Frontend**: S3 + CloudFront
- **Database**: MongoDB Atlas on AWS

## 📚 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/signup` - User registration
- `POST /api/auth/confirm` - OTP confirmation

### Chat
- `POST /api/chat/session` - Create chat session
- `POST /api/chat/message` - Send message
- `GET /api/chat/history/:userId` - Get chat history

### Documents
- `POST /api/documents/upload` - Upload document
- `GET /api/documents/:userId` - Get user documents
- `DELETE /api/documents/:documentId` - Delete document

## 🧪 Testing

```bash
# Backend tests
cd backend && npm test

# Frontend tests  
cd frontend && npm test
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Troubleshooting

### Common Issues

1. **Port conflicts**: Change ports in `.env` files
2. **Dependency issues**: Use `--legacy-peer-deps` for frontend
3. **MongoDB connection**: Ensure MongoDB is running locally
4. **AWS credentials**: Set up proper IAM roles for production

### Development Tips

- Use browser dev tools for debugging
- Check console logs for errors
- Monitor network requests in browser
- Use MongoDB Compass for database inspection

## 🔮 Roadmap

- [ ] Complete quiz generation system
- [ ] Implement study plan algorithms  
- [ ] Add voice chat capabilities
- [ ] Multi-language interface
- [ ] Mobile app (React Native)
- [ ] Advanced analytics dashboard
- [ ] Collaborative study features
- [ ] Integration with learning management systems

---

**Built with ❤️ using MERN Stack + AI**