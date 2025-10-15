const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const UserDashboard = require('../models/UserDashboard');

const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

const signup = async (req, res) => {
  try {
    const { email, password, phoneNumber, semester, captchaToken } = req.body;

    // Simple captcha validation (in production, verify with Google reCAPTCHA)
    if (!captchaToken) {
      return res.status(400).json({ error: 'Captcha verification required' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = new User({
      email,
      password: hashedPassword,
      phoneNumber,
      semester
    });

    await user.save();

    // Create personalized dashboard for new user
    const dashboard = new UserDashboard({
      userId: user._id,
      personalizedContent: {
        welcomeMessage: `Welcome to your AI Learning Journey, ${email.split('@')[0]}!`,
        learningGoals: [`Master ${semester} semester concepts`, 'Improve study efficiency', 'Achieve academic excellence'],
        achievements: [{
          title: 'Welcome Aboard!',
          description: 'Successfully created your AI Student Assistant account',
          icon: '🎉'
        }]
      },
      quickActions: [
        { title: 'Start AI Chat', description: 'Begin intelligent conversations', icon: 'MessageCircle', route: '/chat' },
        { title: 'Upload Documents', description: 'Add your study materials', icon: 'FileText', route: '/documents' },
        { title: 'Generate Quiz', description: 'Create practice tests', icon: 'Brain', route: '/chat?type=quiz' },
        { title: 'Study Planner', description: 'Organize your learning', icon: 'Calendar', route: '/chat?type=plan' }
      ]
    });
    
    await dashboard.save();

    res.status(201).json({
      message: 'Successfully registered! You can now login.',
      user: {
        id: user._id,
        email: user.email,
        semester: user.semester
      }
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // Generate token
    const token = generateToken(user._id);

    // Check if dashboard exists, create if not
    let dashboard = await UserDashboard.findOne({ userId: user._id });
    if (!dashboard) {
      dashboard = new UserDashboard({
        userId: user._id,
        personalizedContent: {
          welcomeMessage: `Welcome back, ${user.email.split('@')[0]}!`,
          learningGoals: [`Master ${user.semester} semester concepts`]
        }
      });
      await dashboard.save();
    }

    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        phoneNumber: user.phoneNumber,
        semester: user.semester
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
};

const getCurrentUser = async (req, res) => {
  try {
    res.json({
      id: req.user._id,
      email: req.user.email,
      phoneNumber: req.user.phoneNumber,
      semester: req.user.semester
    });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({ error: 'Failed to get user data' });
  }
};

module.exports = {
  signup,
  login,
  getCurrentUser
};