const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/microloan';
const SCORING_API_URL = process.env.SCORING_API_URL || 'http://localhost:8000';

mongoose.connect(MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, sparse: true },
  phone: { type: String, required: true, unique: true },
  isIndianCitizen: { type: Boolean, default: false },
  idProofType: { type: String, enum: ['aadhaar', 'pan', 'none'], default: 'none' },
  idProofNumber: { type: String },
  idProofDocument: { type: String },
  bankDetails: {
    bankName: String,
    accountNumber: String,
    ifscCode: String,
    branchName: String
  },
  bankContact: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const financialDataSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  earningsHistory: { type: [Number], required: true },
  monthlyExpenses: { type: Number, required: true },
  emi: { type: Number, default: 0 },
  digitalPaymentRatio: { type: Number, required: true },
  jobHistory: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now }
});

const scoreHistorySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  score: { type: Number, required: true },
  incomeFactor: Number,
  expenseFactor: Number,
  emiFactor: Number,
  digitalFactor: Number,
  helpedFactors: [String],
  hurtFactors: [String],
  suggestions: [String],
  fraudFlag: { type: Boolean, default: false },
  fraudWarning: String,
  inputData: {
    earningsHistory: [Number],
    monthlyExpenses: Number,
    emi: Number,
    digitalPaymentRatio: Number,
    jobHistory: Number
  },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);
const FinancialData = mongoose.model('FinancialData', financialDataSchema);
const ScoreHistory = mongoose.model('ScoreHistory', scoreHistorySchema);

const authMiddleware = async (req, res, next) => {
  try {
    const userId = req.headers['x-user-id'];
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    const user = await User.findById(userId);
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid authentication' });
  }
};

app.post('/user/register', async (req, res) => {
  try {
    const { name, phone, email, isIndianCitizen, idProofType, idProofNumber, idProofDocument, bankDetails, bankContact } = req.body;

    if (!name || !phone) {
      return res.status(400).json({ error: 'Name and phone are required' });
    }

    let user = await User.findOne({ phone });
    if (user) {
      return res.status(200).json({ 
        message: 'User already exists', 
        userId: user._id,
        user: { name: user.name, phone: user.phone }
      });
    }

    user = new User({
      name,
      phone,
      email,
      isIndianCitizen,
      idProofType,
      idProofNumber,
      idProofDocument,
      bankDetails,
      bankContact
    });

    await user.save();

    res.status(201).json({
      message: 'User registered successfully',
      userId: user._id,
      user: { name: user.name, phone: user.phone }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed', details: error.message });
  }
});

app.post('/user/financial-data', async (req, res) => {
  try {
    const { userId, earningsHistory, monthlyExpenses, emi, digitalPaymentRatio, jobHistory } = req.body;

    if (!userId || !earningsHistory || !monthlyExpenses || digitalPaymentRatio === undefined || !jobHistory) {
      return res.status(400).json({ error: 'Missing required financial data' });
    }

    let financialData = await FinancialData.findOne({ userId });
    if (financialData) {
      financialData.earningsHistory = earningsHistory;
      financialData.monthlyExpenses = monthlyExpenses;
      financialData.emi = emi || 0;
      financialData.digitalPaymentRatio = digitalPaymentRatio;
      financialData.jobHistory = jobHistory;
      await financialData.save();
    } else {
      financialData = new FinancialData({
        userId,
        earningsHistory,
        monthlyExpenses,
        emi: emi || 0,
        digitalPaymentRatio,
        jobHistory
      });
      await financialData.save();
    }

    const scoringResponse = await axios.post(`${SCORING_API_URL}/calculate-score`, {
      earnings_history: earningsHistory,
      monthly_expenses: monthlyExpenses,
      emi: emi || 0,
      digital_payment_ratio: digitalPaymentRatio,
      job_history: jobHistory
    });

    const scoreData = scoringResponse.data;

    const scoreRecord = new ScoreHistory({
      userId,
      score: scoreData.score,
      incomeFactor: scoreData.income_factor,
      expenseFactor: scoreData.expense_factor,
      emiFactor: scoreData.emi_factor,
      digitalFactor: scoreData.digital_factor,
      helpedFactors: scoreData.helped_factors,
      hurtFactors: scoreData.hurt_factors,
      suggestions: scoreData.suggestions,
      fraudFlag: scoreData.fraud_flag,
      fraudWarning: scoreData.fraud_warning,
      inputData: {
        earningsHistory,
        monthlyExpenses,
        emi: emi || 0,
        digitalPaymentRatio,
        jobHistory
      }
    });
    await scoreRecord.save();

    res.status(200).json({
      message: 'Financial data saved and score calculated',
      score: scoreData,
      financialDataId: financialData._id
    });
  } catch (error) {
    console.error('Financial data error:', error);
    res.status(500).json({ error: 'Failed to process financial data', details: error.message });
  }
});

app.get('/user/score-history', async (req, res) => {
  try {
    const { userId } = req.query;
    
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const scores = await ScoreHistory.find({ userId })
      .sort({ createdAt: -1 })
      .limit(20)
      .select('score incomeFactor expenseFactor emiFactor digitalFactor helpedFactors hurtFactors suggestions fraudFlag createdAt');

    res.status(200).json({
      message: 'Score history retrieved',
      scores
    });
  } catch (error) {
    console.error('Score history error:', error);
    res.status(500).json({ error: 'Failed to retrieve score history' });
  }
});

app.get('/user/profile', async (req, res) => {
  try {
    const { userId } = req.query;
    
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const user = await User.findById(userId).select('-idProofDocument');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const financialData = await FinancialData.findOne({ userId });

    res.status(200).json({
      user,
      financialData
    });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ error: 'Failed to retrieve profile' });
  }
});

app.post('/loan-matcher', async (req, res) => {
  try {
    const { score, jobHistory, monthlyExpenses, emi } = req.body;

    if (score === undefined) {
      return res.status(400).json({ error: 'Score is required' });
    }

    const loanProducts = [
      {
        name: 'MUDRA Loan',
        provider: 'Pradhan Mantri MUDRA Yojana',
        minScore: 50,
        maxLoan: 1000000,
        interestRate: '10-15%',
        eligibility: [
          'Indian citizen',
          'No collateral required',
          'Business plan required'
        ],
        applicationLink: 'https://mudra.org.in',
        description: 'Government-backed loan for small businesses'
      },
      {
        name: 'KreditBee',
        provider: 'KreditBee',
        minScore: 55,
        maxLoan: 500000,
        interestRate: '18-36%',
        eligibility: [
          'Salary above ₹15,000',
          'Age 21-45 years',
          '6+ months employment'
        ],
        applicationLink: 'https://kreditbee.in',
        description: 'Instant personal loan for salaried professionals'
      },
      {
        name: 'MoneyTap',
        provider: 'MoneyTap',
        minScore: 60,
        maxLoan: 500000,
        interestRate: '13-24%',
        eligibility: [
          'Salary above ₹20,000',
          'Age 23-50 years',
          'Good credit history'
        ],
        applicationLink: 'https://moneytap.com',
        description: 'Flexible credit line with pay-as-you-use interest'
      }
    ];

    const matchedProducts = loanProducts.filter(product => score >= product.minScore);

    const getEligibilityReason = (product) => {
      const reasons = [];
      if (score >= product.minScore) {
        reasons.push(`Your score of ${score} meets the minimum requirement of ${product.minScore}`);
      }
      if (jobHistory >= 1) {
        reasons.push('You have sufficient job stability');
      }
      if (emi === 0 || emi < monthlyExpenses * 0.3) {
        reasons.push('Your EMI burden is manageable');
      }
      return reasons;
    };

    const result = matchedProducts.map(product => ({
      ...product,
      eligible: true,
      eligibilityReason: getEligibilityReason(product)
    }));

    const notEligible = loanProducts
      .filter(product => score < product.minScore)
      .map(product => ({
        ...product,
        eligible: false,
        eligibilityReason: [`Score ${score} is below minimum ${product.minScore}`]
      }));

    res.status(200).json({
      matchedLoans: result,
      recommendedLoans: result,
      otherOptions: notEligible
    });
  } catch (error) {
    console.error('Loan matcher error:', error);
    res.status(500).json({ error: 'Failed to match loan products' });
  }
});

const chatbotResponses = {
  'eligibility': 'Your eligibility depends on income stability, expense ratio, existing EMIs, and digital payment behavior. We calculate a score out of 100 based on these factors.',
  'score': 'Your eligibility score is calculated using: Income Stability (40%), Expense Ratio (25%), Existing EMI (20%), and Digital Payment Behavior (15%).',
  'documents': 'You need: Aadhaar card, PAN card, Bank statement (last 3 months), and proof of income. These help verify your identity and financial status.',
  'loan': 'We recommend MUDRA Loan for businesses, KreditBee for salaried professionals, and MoneyTap for flexible credit lines. Your eligibility depends on your score.',
  'improve': 'To improve your score: 1) Maintain stable income for 6+ months, 2) Reduce expenses below 50% of income, 3) Pay off existing EMIs, 4) Use digital payments regularly.',
  'fraud': 'We flag suspicious patterns like unusually high savings or income spikes. This protects you and the lending institution from fraudulent activities.',
  'default': 'I can help with questions about eligibility, scores, documents, loans, and how to improve your chances. What would you like to know?'
};

app.post('/chatbot', async (req, res) => {
  try {
    const { message, language = 'en' } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const messageLower = message.toLowerCase();
    let response = chatbotResponses['default'];

    for (const [key, value] of Object.entries(chatbotResponses)) {
      if (messageLower.includes(key)) {
        response = value;
        break;
      }
    }

    const translations = {
      hi: {
        'eligibility': 'आपकी पात्रता आय स्थिरता, खर्च अनुपात, मौजूदा ईएमआई और डिजिटल भुगतान व्यवहार पर निर्भर करती है।',
        'score': 'आपकी पात्रता स्कोर गणना: आय स्थिरता (40%), खर्च अनुपात (25%), मौजूदा ईएमआई (20%), डिजिटल भुगतान (15%)।',
        'documents': 'आपको चाहिए: आधार कार्ड, पैन कार्ड, बैंक स्टेटमेंट (पिछले 3 महीने), आय प्रमाण।',
        'loan': 'हम MUDRA Loan व्यवसायों के लिए, KreditBee वेतनभोगी पेशेवरों के लिए, और MoneyTap लचीले क्रेडिट के लिए अनुशंसा करते हैं।',
        'improve': 'स्कोर सुधारने के लिए: 6+ महीने स्थिर आय, खर्च 50% से कम, मौजूदा ईएमआई चुकाएं, नियमित डिजिटल भुगतान।'
      },
      ta: {
        'eligibility': 'உங்கள் தகுதி வருமான நிலைத்தன்மை, செலவு விகிதம், உள்ள EMI மற்றும் டிஜிட்டல் பேமெண்ட் ஆகியவற்றைப் பொறுத்தது.',
        'score': 'உங்கள் தகுதி மதிப்பெண்: வருமான நிலைத்தன்மை (40%), செலவு விகிதம் (25%), உள்ள EMI (20%), டிஜிட்டல் பேமெண்ட் (15%).',
        'documents': 'தேவை: ஆதார், PAN, வங்கி அறிக்கை (மூன்று மாதங்கள்), வருமான ஆதாரம்.',
        'loan': 'MUDRA Loan வணிகங்களுக்கு, KreditBee ஊழியர்களுக்கு, MoneyTap மாறும் கடன் வரம்புக்கு பரிந்துரைக்கிறோம்.',
        'improve': 'மதிப்பெண் மேம்பட: 6+ மாதம் நிலையான வருமானம், 50%க்கு குறைவான செலவு, EMI செலுத்துதல், டிஜிட்டல் பேமெண்ட்.'
      }
    };

    if (language !== 'en' && translations[language]) {
      const langResponses = translations[language];
      for (const [key, value] of Object.entries(langResponses)) {
        if (messageLower.includes(key)) {
          response = value;
          break;
        }
      }
    }

    res.status(200).json({
      response,
      language
    });
  } catch (error) {
    console.error('Chatbot error:', error);
    res.status(500).json({ error: 'Failed to get chatbot response' });
  }
});

app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`MongoDB URI: ${MONGODB_URI}`);
  console.log(`Scoring API: ${SCORING_API_URL}`);
});

module.exports = app;
