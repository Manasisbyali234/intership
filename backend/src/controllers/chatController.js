const Chat = require('../models/Chat');
const UserDashboard = require('../models/UserDashboard');
const ragService = require('../langchain/ragService');
const awsService = require('../services/awsService');
const huggingfaceService = require('../services/huggingfaceService');
const { v4: uuidv4 } = require('uuid');

class ChatController {
  async createSession(req, res) {
    try {
      const userId = req.user._id; // Use authenticated user ID
      const sessionId = uuidv4();

      const chat = new Chat({
        userId,
        sessionId,
        messages: []
      });

      await chat.save();
      res.json({ sessionId, chatId: chat._id });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async sendMessage(req, res) {
    try {
      const { sessionId, message, documentIds = [], messageType = 'chat' } = req.body;
      const userId = req.user._id; // Use authenticated user ID

      // Find chat session
      const chat = await Chat.findOne({ sessionId });
      if (!chat) {
        return res.status(404).json({ error: 'Chat session not found' });
      }

      // Add user message
      const userMessage = {
        messageId: uuidv4(),
        role: 'user',
        content: message,
        timestamp: new Date(),
        context: { documentIds, messageType }
      };

      chat.messages.push(userMessage);

      // Generate AI response based on message type
      let aiResponse;
      let sources = [];
      
      switch (messageType) {
        case 'quiz':
        case 'quiz-generation':
          try {
            if (documentIds.length > 0) {
              // Parse quiz settings from message
              const numQuestionsMatch = message.match(/(\d+)\s+(?:questions?|quiz)/i);
              const numQuestions = numQuestionsMatch ? Math.min(parseInt(numQuestionsMatch[1]), 20) : 5;
              
              const difficultyMatch = message.match(/(easy|medium|hard)\s+difficulty/i);
              const difficulty = difficultyMatch ? difficultyMatch[1].toLowerCase() : 'medium';
              
              const typeMatch = message.match(/(multiple-choice|true-false|mixed)/i);
              const questionType = typeMatch ? typeMatch[1].toLowerCase() : 'multiple-choice';
              
              console.log(`Generating quiz: ${numQuestions} questions, ${difficulty} difficulty, ${questionType} type`);
              
              const quiz = await ragService.generateQuiz(documentIds[0], numQuestions);
              
              // Get document name for context
              const Document = require('../models/Document');
              const document = await Document.findById(documentIds[0]);
              const docName = document ? document.fileName : 'your document';
              
              // Format quiz response
              const quizData = {
                title: `Quiz: ${docName}`,
                difficulty: difficulty,
                questionType: questionType,
                totalQuestions: quiz.length,
                questions: quiz.map((q, index) => ({
                  id: index + 1,
                  question: q.question,
                  type: questionType === 'true-false' ? 'true-false' : 'multiple-choice',
                  options: questionType === 'true-false' ? ['True', 'False'] : q.options,
                  correctAnswer: q.correct || 0,
                  explanation: q.explanation
                }))
              };
              
              aiResponse = {
                messageId: uuidv4(),
                role: 'assistant',
                content: `I've generated ${quiz.length} ${difficulty} difficulty ${questionType} questions based on "${docName}". These questions are tailored to the content in your document to help you study effectively.`,
                timestamp: new Date(),
                context: { documentIds, messageType: 'quiz-generation', quiz: quizData }
              };
            } else {
              aiResponse = {
                messageId: uuidv4(),
                role: 'assistant',
                content: 'Please upload and select a document first to generate a quiz. I\'ll create questions based on the content of your document.',
                timestamp: new Date()
              };
            }
          } catch (quizError) {
            console.error('Quiz generation error:', quizError);
            aiResponse = {
              messageId: uuidv4(),
              role: 'assistant',
              content: 'I encountered an error generating the quiz. Please ensure your document was uploaded successfully and try again.',
              timestamp: new Date()
            };
          }
          break;
          
        case 'study-plan':
          try {
            if (documentIds.length === 0) {
              aiResponse = {
                messageId: uuidv4(),
                role: 'assistant',
                content: 'Please select documents first to create a personalized study plan.',
                timestamp: new Date()
              };
            } else {
              const studyPlan = await ragService.generateStudyPlan(documentIds, {
                duration: 7,
                hoursPerDay: 2
              });
              aiResponse = {
                messageId: uuidv4(),
                role: 'assistant',
                content: `I've created a study plan based on your ${documentIds.length} selected document${documentIds.length !== 1 ? 's' : ''}:`,
                timestamp: new Date(),
                context: { documentIds, messageType: 'study-plan', studyPlan }
              };
            }
          } catch (planError) {
            console.error('Study plan generation error:', planError);
            aiResponse = {
              messageId: uuidv4(),
              role: 'assistant',
              content: 'I encountered an error creating the study plan. Please try again.',
              timestamp: new Date()
            };
          }
          break;
          
        default: // Regular chat
          if (documentIds.length > 0) {
            // Query specific documents using enhanced RAG
            try {
              console.log('Querying documents:', documentIds, 'Question:', message);
              
              if (documentIds.length === 1) {
                // Single document query
                const result = await ragService.queryDocument(message, documentIds[0]);
                
                aiResponse = {
                  messageId: uuidv4(),
                  role: 'assistant',
                  content: result.answer,
                  timestamp: new Date(),
                  context: { documentIds, sources: result.sources }
                };
                sources = result.sources;
              } else {
                // Multiple documents query
                const results = [];
                for (const docId of documentIds) {
                  try {
                    const result = await ragService.queryDocument(message, docId);
                    if (result.answer && result.answer !== 'No relevant information found in the document.') {
                      results.push({
                        documentId: docId,
                        answer: result.answer,
                        sources: result.sources
                      });
                    }
                  } catch (docError) {
                    console.error(`Error querying document ${docId}:`, docError);
                  }
                }
                
                if (results.length > 0) {
                  // Filter and rank results by confidence
                  const validResults = results.filter(r => r.answer && r.answer !== 'No relevant information found in the document.');
                  
                  if (validResults.length > 0) {
                    const combinedAnswer = validResults.map((r, i) => {
                      const confidence = r.confidence || 0.5;
                      const confidenceLabel = confidence > 0.7 ? '🎯 **High Confidence**' : 
                                            confidence > 0.4 ? '📋 **Moderate Confidence**' : 
                                            '🔍 **Low Confidence**';
                      return `${confidenceLabel} - Document ${i + 1}:\n${r.answer}`;
                    }).join('\n\n---\n\n');
                    
                    const allSources = validResults.flatMap(r => r.sources);
                    
                    aiResponse = {
                      messageId: uuidv4(),
                      role: 'assistant',
                      content: combinedAnswer,
                      timestamp: new Date(),
                      context: { documentIds, sources: allSources }
                    };
                    sources = allSources;
                  } else {
                    aiResponse = {
                      messageId: uuidv4(),
                      role: 'assistant',
                      content: `I searched through ${documentIds.length} documents but couldn't find specific information about "${message}". Here are some suggestions:\n\n• Try using different keywords or phrases\n• Check if your question relates to the content in your documents\n• Consider uploading more relevant materials\n• Ask more specific questions about particular topics`,
                      timestamp: new Date(),
                      context: { documentIds }
                    };
                  }
                } else {
                  aiResponse = {
                    messageId: uuidv4(),
                    role: 'assistant',
                    content: `I couldn't find relevant information about "${message}" in the selected documents. Please try rephrasing your question or check if the documents contain the information you're looking for.`,
                    timestamp: new Date(),
                    context: { documentIds }
                  };
                }
              }
            } catch (error) {
              console.error('RAG query failed:', error);
              aiResponse = {
                messageId: uuidv4(),
                role: 'assistant',
                content: `I encountered an error while searching your documents. Please try again or re-upload the documents if the issue persists.`,
                timestamp: new Date(),
                context: { documentIds }
              };
            }
          } else {
            // General chat without documents
            aiResponse = {
              messageId: uuidv4(),
              role: 'assistant',
              content: `I'm your AI study assistant! I can help you with:

• **Document Q&A**: Upload documents and ask questions about them
• **Quiz Generation**: Create practice quizzes from your materials
• **Study Plans**: Generate personalized study schedules

To get started, upload a document (PDF, DOCX, PPT, TXT) and ask me questions about it!`,
              timestamp: new Date(),
              context: { documentIds: [] }
            };
          }
      }

      chat.messages.push(aiResponse);
      chat.lastActivity = new Date();
      await chat.save();
      
      // Update dashboard stats based on message type
      try {
        const updateData = { $inc: {} };
        let activityTitle = 'AI Chat Session';
        let activityDescription = 'Had a conversation with AI assistant';
        
        if (messageType === 'quiz') {
          updateData.$inc['stats.quizzesCompleted'] = 1;
          activityTitle = 'Generated Quiz';
          activityDescription = `Created quiz with ${aiResponse.context?.quiz?.length || 0} questions`;
        } else if (messageType === 'study-plan') {
          updateData.$inc['stats.studyPlansCreated'] = 1;
          activityTitle = 'Created Study Plan';
          activityDescription = 'Generated personalized learning schedule';
        } else {
          updateData.$inc['stats.chatSessions'] = 1;
        }
        
        updateData.$push = {
          'recentActivity': {
            $each: [{
              type: messageType,
              title: activityTitle,
              description: activityDescription,
              timestamp: new Date()
            }],
            $position: 0,
            $slice: 10
          }
        };
        
        await UserDashboard.findOneAndUpdate(
          { userId },
          updateData,
          { upsert: true, new: true }
        );
        console.log(`Dashboard stats updated for ${messageType}`);
      } catch (dashError) {
        console.error('Failed to update dashboard stats:', dashError);
      }

      // Emit to socket if available
      try {
        const { io } = require('../app');
        io.to(`user-${userId}`).emit('new-message', aiResponse);
      } catch (socketError) {
        console.log('Socket emission failed:', socketError.message);
      }

      res.json({
        message: aiResponse,
        sources: sources,
        quiz: aiResponse.context?.quiz,
        studyPlan: aiResponse.context?.studyPlan
      });
    } catch (error) {
      console.error('Chat error:', error);
      res.status(500).json({ error: error.message });
    }
  }

  async getChatHistory(req, res) {
    try {
      const userId = req.user._id; // Use authenticated user ID
      const { limit = 20 } = req.query;
      
      const chats = await Chat.find({ userId })
        .sort({ lastActivity: -1 })
        .limit(parseInt(limit))
        .select('sessionId messages.content messages.role messages.timestamp lastActivity');

      res.json(chats);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async generateQuiz(req, res) {
    try {
      const { documentId, numQuestions = 5 } = req.body;
      
      if (!documentId) {
        return res.status(400).json({ error: 'Document ID is required' });
      }
      
      const quiz = await ragService.generateQuiz(documentId, numQuestions);
      res.json({ quiz });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async generateStudyPlan(req, res) {
    try {
      const { documentIds = [], preferences = {} } = req.body;
      
      const studyPlan = await ragService.generateStudyPlan(documentIds, preferences);
      res.json({ studyPlan });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getSession(req, res) {
    try {
      const { sessionId } = req.params;
      const chat = await Chat.findOne({ sessionId });
      
      if (!chat) {
        return res.status(404).json({ error: 'Session not found' });
      }

      res.json(chat);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

const chatController = new ChatController();

const auth = require('../middleware/auth');

module.exports = {
  createSession: [auth, chatController.createSession.bind(chatController)],
  sendMessage: [auth, chatController.sendMessage.bind(chatController)],
  getChatHistory: [auth, chatController.getChatHistory.bind(chatController)],
  getSession: [auth, chatController.getSession.bind(chatController)],
  generateQuiz: [auth, chatController.generateQuiz.bind(chatController)],
  generateStudyPlan: [auth, chatController.generateStudyPlan.bind(chatController)]
};