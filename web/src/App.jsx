import React, { createContext, useContext, useState } from 'react';
import { BrowserRouter, Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis } from 'recharts';
import { User, Phone, CheckCircle, CreditCard, TrendingUp, Wallet, History, BookOpen, FileText, MessageCircle, Globe, ArrowLeft, Loader } from 'lucide-react';
import * as api from './services/api';

const AppContext = createContext();

const useApp = () => useContext(AppContext);

const translations = {
  en: {
    register: 'Register', continue: 'Continue', calculate: 'Calculate Eligibility',
    name: 'Full Name', phone: 'Phone Number', indianCitizen: 'I am an Indian Citizen',
    idProof: 'ID Proof', earnings: 'Earnings (Last 3 Months)', month1: 'Month 1',
    month2: 'Month 2', month3: 'Month 3', expenses: 'Monthly Expenses',
    emi: 'Existing EMI', digitalPayments: 'Digital Payment Behaviour',
    jobHistory: 'Job History (Years)', bankName: 'Bank Name', account: 'Account Number',
    ifsc: 'IFSC Code', bankContact: 'Bank Contact', yourScore: 'Your Eligibility Score',
    scoreBreakdown: 'Score Breakdown', factorsHelped: 'Factors That Helped',
    factorsHurt: 'Factors That Hurt', suggestions: 'Suggestions to Improve',
    loanProducts: 'Loan Products', simulator: 'What-If Simulator', history: 'History',
    loanCoach: 'Loan Coach', documents: 'Documents', chat: 'Chat with Us',
    applyNow: 'Apply Now', eligible: 'Eligible', notEligible: 'Not Eligible',
    updateScore: 'Update Score', askQuestion: 'Ask a question...', send: 'Send'
  },
  hi: {
    register: 'रजिस्टर', continue: 'जारी रखें', calculate: 'पात्रता की गणना करें',
    name: 'पूरा नाम', phone: 'फोन नंबर', indianCitizen: 'मैं भारतीय नागरिक हूं',
    idProof: 'पहचान प्रमाण', earnings: 'आय (पिछले 3 महीने)', month1: 'महीना 1',
    month2: 'महीना 2', month3: 'महीना 3', expenses: 'मासिक खर्च',
    emi: 'मौजूदा ईएमआई', digitalPayments: 'डिजिटल भुगतान व्यवहार',
    jobHistory: 'नौकरी का इतिहास (वर्ष)', bankName: 'बैंक का नाम', account: 'खाता संख्या',
    ifsc: 'IFSC कोड', bankContact: 'बैंक संपर्क', yourScore: 'आपका पात्रता स्कोर',
    scoreBreakdown: 'स्कोर विवरण', factorsHelped: 'मदद करने वाले कारक',
    factorsHurt: 'हानि पहुंचाने वाले कारक', suggestions: 'सुधार के सुझाव',
    loanProducts: 'ऋण उत्पाद', simulator: 'क्या-अगर सिम्युलेटर', history: 'इतिहास',
    loanCoach: 'ऋण कोच', documents: 'दस्तावेज़', chat: 'हमसे बात करें',
    applyNow: 'अभी आवेदन करें', eligible: 'पात्र', notEligible: 'अपात्र',
    updateScore: 'स्कोर अपडेट करें', askQuestion: 'प्रश्न पूछें...', send: 'भेजें'
  },
  ta: {
    register: 'பதிவு', continue: 'தொடர', calculate: 'தகுதி கணக்கிடு',
    name: 'முழு பெயர்', phone: 'தொலைபேசி எண்', indianCitizen: 'நான் இந்திய குடிமகன்',
    idProof: 'அடையாளம்', earnings: 'வருமானம் (முந்தைய 3 மாதங்கள்)', month1: 'மாதம் 1',
    month2: 'மாதம் 2', month3: 'மாதம் 3', expenses: 'மாத செலவுகள்',
    emi: 'தற்போத EMI', digitalPayments: 'டிஜிட்டல் பேமெண்',
    jobHistory: 'வேலை வரலாறு', bankName: 'வங்கி பெயர்', account: 'கணக்கு எண்',
    ifsc: 'IFSC குறியீடு', bankContact: 'வங்கி தொடர்பு', yourScore: 'உங்கள் தகுதி மதிப்பெண்',
    scoreBreakdown: 'மதிப்பெண் விவரம்', factorsHelped: 'உதவிய காரணிகள்',
    factorsHurt: 'ضرر காரணிகள்', suggestions: 'மேம்படுத்த பரிந்துரைகள்',
    loanProducts: 'கடன் தயாரிப்புகள்', simulator: 'என்னா இல்லை சிமுலேட்டர்', history: 'வரலாறு',
    loanCoach: 'கடன் பயிற்சியாளர்', documents: 'ஆவணங்கள்', chat: 'எங்களுடன் பேசு',
    applyNow: 'இப்போது விண்ணப்பி', eligible: 'தகுதியான', notEligible: 'தகுதியற்ற',
    updateScore: 'மதிப்பெண் புதுப்பி', askQuestion: 'கேள்வி கேட்க...', send: 'அனுப்பு'
  }
};

const getT = (lang) => translations[lang] || translations.en;

const Header = () => {
  const { language, setLanguage } = useApp();
  const t = getT(language);
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <header className="bg-blue-800 text-white p-4 flex justify-between items-center sticky top-0 z-50">
      {location.pathname !== '/' && (
        <button onClick={() => navigate(-1)} className="mr-2">
          <ArrowLeft size={24} />
        </button>
      )}
      <h1 className="text-xl font-bold">Micro Loan</h1>
      <div className="flex items-center gap-2">
        <Globe size={20} />
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="bg-blue-700 text-white border-none rounded px-2 py-1 text-sm"
        >
          <option value="en">EN</option>
          <option value="hi">हि</option>
          <option value="ta">த</option>
        </select>
      </div>
    </header>
  );
};

const HomePage = () => {
  const { userId, setUserId } = useApp();
  const navigate = useNavigate();
  const t = getT(useApp().language);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [isIndian, setIsIndian] = useState(false);
  const [idProof, setIdProof] = useState('none');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async () => {
    if (!name || !phone) {
      setError('Please fill all required fields');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await api.registerUser({ name, phone, is_indian_citizen: isIndian, id_proof_type: idProof });
      if (res.user_id) {
        setUserId(res.user_id);
        localStorage.setItem('userId', res.user_id);
        navigate('/financial');
      }
    } catch (e) {
      setError('Registration failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-md mx-auto">
        <h1 className="text-3xl font-bold mb-2">Create Account</h1>
        <p className="text-gray-500 mb-6">Enter your details to get started</p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">{t.name}</label>
            <div className="relative">
              <User className="absolute left-3 top-3 text-gray-400" size={20} />
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="input-field pl-10" placeholder="Enter your name" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">{t.phone}</label>
            <div className="relative">
              <Phone className="absolute left-3 top-3 text-gray-400" size={20} />
              <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="input-field pl-10" placeholder="Enter phone number" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={isIndian} onChange={(e) => setIsIndian(e.target.checked)} className="w-5 h-5" />
              <span className="text-base">{t.indianCitizen}</span>
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">{t.idProof}</label>
            <div className="flex gap-2">
              {['aadhaar', 'pan', 'none'].map((type) => (
                <button key={type} onClick={() => setIdProof(type)} className={`px-4 py-2 rounded-lg capitalize ${idProof === type ? 'bg-blue-200 border-blue-500' : 'bg-gray-100'}`}>
                  {type}
                </button>
              ))}
            </div>
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button onClick={handleRegister} disabled={loading} className="btn-primary w-full flex justify-center items-center gap-2">
            {loading ? <Loader className="animate-spin" size={20} /> : null}
            {t.continue}
          </button>
        </div>
      </div>
    </div>
  );
};

const FinancialPage = () => {
  const { userId, setScore } = useApp();
  const navigate = useNavigate();
  const t = getT(useApp().language);
  const [month1, setMonth1] = useState('');
  const [month2, setMonth2] = useState('');
  const [month3, setMonth3] = useState('');
  const [expenses, setExpenses] = useState('');
  const [emi, setEmi] = useState('');
  const [digital, setDigital] = useState(50);
  const [jobHistory, setJobHistory] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!month1 || !month2 || !month3 || !expenses || !jobHistory) {
      setError('Please fill all required fields');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await api.saveFinancialData({
        user_id: userId,
        earnings_history: [parseFloat(month1), parseFloat(month2), parseFloat(month3)],
        monthly_expenses: parseFloat(expenses),
        emi: parseFloat(emi) || 0,
        digital_payment_ratio: digital,
        job_history: parseFloat(jobHistory)
      });
      if (res.score) {
        setScore(res.score);
        navigate('/result');
      }
    } catch (e) {
      setError('Failed to calculate. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-md mx-auto space-y-6">
        <h2 className="text-2xl font-bold">Financial Details</h2>

        <div className="card">
          <h3 className="font-semibold mb-3">{t.earnings}</h3>
          <div className="space-y-3">
            <input type="number" value={month1} onChange={(e) => setMonth1(e.target.value)} placeholder="Month 1 (₹)" className="input-field" />
            <input type="number" value={month2} onChange={(e) => setMonth2(e.target.value)} placeholder="Month 2 (₹)" className="input-field" />
            <input type="number" value={month3} onChange={(e) => setMonth3(e.target.value)} placeholder="Month 3 (₹)" className="input-field" />
          </div>
        </div>

        <div className="card">
          <h3 className="font-semibold mb-3">{t.expenses}</h3>
          <input type="number" value={expenses} onChange={(e) => setExpenses(e.target.value)} placeholder="Total monthly expenses (₹)" className="input-field" />
        </div>

        <div className="card">
          <h3 className="font-semibold mb-3">{t.emi}</h3>
          <input type="number" value={emi} onChange={(e) => setEmi(e.target.value)} placeholder="Current EMI amount (₹)" className="input-field" />
        </div>

        <div className="card">
          <h3 className="font-semibold mb-3">{t.digitalPayments}</h3>
          <input type="range" min="0" max="100" value={digital} onChange={(e) => setDigital(e.target.value)} className="slider" />
          <p className="text-center mt-2 font-semibold text-blue-800">{digital}%</p>
        </div>

        <div className="card">
          <h3 className="font-semibold mb-3">{t.jobHistory}</h3>
          <input type="number" value={jobHistory} onChange={(e) => setJobHistory(e.target.value)} placeholder="Years of experience" className="input-field" />
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <button onClick={handleSubmit} disabled={loading} className="btn-primary w-full flex justify-center items-center gap-2">
          {loading ? <Loader className="animate-spin" size={20} /> : null}
          {t.calculate}
        </button>
      </div>
    </div>
  );
};

const ResultPage = () => {
  const { score } = useApp();
  const t = getT(useApp().language);
  const navigate = useNavigate();

  const scoreData = score || {};
  const totalScore = scoreData.score || 0;

  const getScoreColor = (s) => s >= 70 ? '#22c55e' : s >= 50 ? '#f97316' : '#ef4444';
  const getScoreLabel = (s) => s >= 70 ? 'Excellent' : s >= 50 ? 'Good' : 'Needs Improvement';

  const pieData = [
    { name: 'Income', value: scoreData.income_factor || 0, color: '#3b82f6' },
    { name: 'Expense', value: scoreData.expense_factor || 0, color: '#22c55e' },
    { name: 'EMI', value: scoreData.emi_factor || 0, color: '#f97316' },
    { name: 'Digital', value: scoreData.digital_factor || 0, color: '#8b5cf6' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-md mx-auto space-y-6">
        <h2 className="text-2xl font-bold text-center">{t.yourScore}</h2>

        <div className="card text-center">
          <div className="relative w-40 h-40 mx-auto">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} innerRadius={45} outerRadius={70} paddingAngle={2} dataKey="value">
                  {pieData.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl font-bold" style={{ color: getScoreColor(totalScore) }}>{totalScore}</span>
              <span className="text-gray-500">/100</span>
            </div>
          </div>
          <div className="mt-4 inline-block px-4 py-2 rounded-full" style={{ backgroundColor: `${getScoreColor(totalScore)}20` }}>
            <span className="font-semibold" style={{ color: getScoreColor(totalScore) }}>{getScoreLabel(totalScore)}</span>
          </div>
        </div>

        <div className="card">
          <h3 className="font-semibold mb-3">{t.scoreBreakdown}</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={pieData} dataKey="value" cx="50%" cy="50%" outerRadius={80} label={({ name, value }) => `${name}: ${value}`}>
                {pieData.map((entry, index) => <Cell key={index} fill={entry.color} />)}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>

        {scoreData.helped_factors?.length > 0 && (
          <div className="card bg-green-50 border-l-4 border-green-500">
            <h3 className="font-semibold text-green-800 mb-2">✓ {t.factorsHelped}</h3>
            {scoreData.helped_factors.map((f, i) => <p key={i} className="text-sm text-green-700">• {f}</p>)}
          </div>
        )}

        {scoreData.hurt_factors?.length > 0 && (
          <div className="card bg-orange-50 border-l-4 border-orange-500">
            <h3 className="font-semibold text-orange-800 mb-2">⚠ {t.factorsHurt}</h3>
            {scoreData.hurt_factors.map((f, i) => <p key={i} className="text-sm text-orange-700">• {f}</p>)}
          </div>
        )}

        {scoreData.fraud_flag && (
          <div className="card bg-red-50 border-l-4 border-red-500">
            <p className="text-red-700 font-semibold">⚠️ {scoreData.fraud_warning}</p>
          </div>
        )}

        <div className="card bg-blue-50">
          <h3 className="font-semibold text-blue-800 mb-2">💡 {t.suggestions}</h3>
          {scoreData.suggestions?.map((s, i) => <p key={i} className="text-sm text-blue-700">• {s}</p>)}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button onClick={() => navigate('/loans')} className="btn-secondary text-center">{t.loanProducts}</button>
          <button onClick={() => navigate('/simulator')} className="btn-secondary text-center">{t.simulator}</button>
          <button onClick={() => navigate('/history')} className="btn-secondary text-center">{t.history}</button>
          <button onClick={() => navigate('/coach')} className="btn-secondary text-center">{t.loanCoach}</button>
          <button onClick={() => navigate('/documents')} className="btn-secondary text-center col-span-2">{t.documents}</button>
        </div>
      </div>
    </div>
  );
};

const LoanProductsPage = () => {
  const { score, userId } = useApp();
  const t = getT(useApp().language);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    const fetchLoans = async () => {
      try {
        const res = await api.getLoanMatcher({ score: score?.score || 0, job_history: 1, monthly_expenses: 10000, emi: 0 });
        setProducts(res.matched_loans || []);
      } catch (e) { console.error(e); }
      setLoading(false);
    };
    fetchLoans();
  }, [score]);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h2 className="text-2xl font-bold mb-6">{t.loanProducts}</h2>
      {loading ? <div className="text-center"><Loader className="animate-spin" /></div> : (
        <div className="space-y-4">
          {products.map((p, i) => (
            <div key={i} className="card">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-bold text-lg">{p.name}</h3>
                  <p className="text-sm text-gray-500">{p.provider}</p>
                </div>
                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">{t.eligible}</span>
              </div>
              <p className="text-gray-600 mb-3">{p.description}</p>
              <div className="flex gap-2 mb-3">
                <span className="px-2 py-1 bg-gray-100 rounded text-xs">Max: ₹{(p.max_loan / 100000).toFixed(1)}L</span>
                <span className="px-2 py-1 bg-gray-100 rounded text-xs">{p.interest_rate}</span>
              </div>
              <a href={p.application_link} target="_blank" rel="noopener noreferrer" className="btn-primary block text-center">{t.applyNow}</a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const SimulatorPage = () => {
  const { score, setScore } = useApp();
  const t = getT(useApp().language);
  const [expenses, setExpenses] = useState(score?.input_data?.monthly_expenses || 20000);
  const [emi, setEmi] = useState(score?.input_data?.emi || 0);
  const [result, setResult] = useState(score);
  const [loading, setLoading] = useState(false);

  const recalculate = async () => {
    setLoading(true);
    try {
      const res = await api.calculateScore({
        user_id: 'simulator',
        earnings_history: [35000, 35000, 35000],
        monthly_expenses: expenses,
        emi: emi,
        digital_payment_ratio: 60,
        job_history: 2
      });
      setResult(res);
      setScore(res);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h2 className="text-2xl font-bold mb-6">{t.simulator}</h2>

      <div className="card text-center mb-6">
        <p className="text-gray-500 mb-2">Live Score</p>
        <p className="text-5xl font-bold" style={{ color: result?.score >= 70 ? '#22c55e' : result?.score >= 50 ? '#f97316' : '#ef4444' }}>{result?.score || 0}</p>
        <p className="text-gray-500">/100</p>
      </div>

      <div className="card mb-6">
        <label className="flex justify-between mb-2">
          <span className="font-medium">Monthly Expenses</span>
          <span className="text-blue-800 font-bold">₹{expenses}</span>
        </label>
        <input type="range" min="0" max="50000" value={expenses} onChange={(e) => setExpenses(Number(e.target.value))} className="slider" />
      </div>

      <div className="card mb-6">
        <label className="flex justify-between mb-2">
          <span className="font-medium">Existing EMI</span>
          <span className="text-blue-800 font-bold">₹{emi}</span>
        </label>
        <input type="range" min="0" max="20000" value={emi} onChange={(e) => setEmi(Number(e.target.value))} className="slider" />
      </div>

      <button onClick={recalculate} disabled={loading} className="btn-primary w-full flex justify-center items-center gap-2 mb-6">
        {loading ? <Loader className="animate-spin" size={20} /> : null}
        {t.updateScore}
      </button>

      <div className="card">
        <h3 className="font-semibold mb-3">Score Breakdown</h3>
        {[
          { label: 'Income Factor', value: result?.income_factor || 0, max: 40, color: '#3b82f6' },
          { label: 'Expense Factor', value: result?.expense_factor || 0, max: 25, color: '#22c55e' },
          { label: 'EMI Factor', value: result?.emi_factor || 0, max: 20, color: '#f97316' },
          { label: 'Digital Factor', value: result?.digital_factor || 0, max: 15, color: '#8b5cf6' },
        ].map((item, i) => (
          <div key={i} className="flex items-center gap-3 mb-2">
            <span className="w-28 text-sm">{item.label}</span>
            <div className="flex-1 h-2 bg-gray-200 rounded">
              <div className="h-full rounded" style={{ width: `${(item.value / item.max) * 100}%`, backgroundColor: item.color }} />
            </div>
            <span className="w-8 text-sm font-bold">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const HistoryPage = () => {
  const { userId } = useApp();
  const t = getT(useApp().language);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    const fetchHistory = async () => {
      if (!userId) { setLoading(false); return; }
      try {
        const res = await api.getScoreHistory(userId);
        setHistory(res.scores || []);
      } catch (e) { console.error(e); }
      setLoading(false);
    };
    fetchHistory();
  }, [userId]);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h2 className="text-2xl font-bold mb-6">{t.history}</h2>
      {loading ? <div className="text-center"><Loader className="animate-spin" /></div> : history.length === 0 ? (
        <p className="text-gray-500 text-center">No score history yet</p>
      ) : (
        <div className="space-y-3">
          {history.map((h, i) => (
            <div key={i} className="card flex items-center gap-4">
              <div className="w-14 h-14 rounded-full flex items-center justify-center font-bold text-lg" style={{ backgroundColor: `${h.score >= 70 ? '#22c55e' : h.score >= 50 ? '#f97316' : '#ef4444'}20`, color: h.score >= 70 ? '#22c55e' : h.score >= 50 ? '#f97316' : '#ef4444' }}>
                {h.score}
              </div>
              <div>
                <p className="font-medium">{new Date(h.created_at).toLocaleDateString()}</p>
                <p className="text-sm text-gray-500">Income: {h.income_factor} | Expense: {h.expense_factor} | EMI: {h.emi_factor}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const CoachPage = () => {
  const t = getT(useApp().language);
  const tips = [
    { title: 'Build Income Stability', tip: 'Maintain consistent earnings for 6+ months to improve income stability score by up to 40%', days: '30-60 days', icon: TrendingUp },
    { title: 'Reduce Expenses', tip: 'Keep expenses below 50% of income to maximize your expense ratio score (25% weight)', days: '30 days', icon: Wallet },
    { title: 'Clear Existing EMIs', tip: 'Pay off current EMIs to reduce debt burden. Target EMI < 20% of income', days: '60-90 days', icon: CreditCard },
    { title: 'Go Digital', tip: 'Increase digital payments to 60%+ for better credit visibility and 15% score boost', days: '14 days', icon: Phone },
    { title: 'Job Stability', tip: 'Build 2+ years of job history for additional scoring benefits', days: '90+ days', icon: BookOpen },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h2 className="text-2xl font-bold mb-6">{t.loanCoach}</h2>
      <div className="space-y-4">
        {tips.map((tip, i) => (
          <div key={i} className="card">
            <div className="flex gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <tip.icon className="text-blue-800" size={20} />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <h3 className="font-semibold">{tip.title}</h3>
                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">{tip.days}</span>
                </div>
                <p className="text-sm text-gray-600 mt-1">{tip.tip}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const DocumentsPage = () => {
  const t = getT(useApp().language);
  const docs = [
    { name: 'Aadhaar Card', required: true, icon: CreditCard, desc: 'Valid government-issued ID proof' },
    { name: 'PAN Card', required: false, icon: FileText, desc: 'For income tax verification' },
    { name: 'Bank Statement', required: true, icon: BookOpen, desc: 'Last 3 months transaction history' },
    { name: 'Salary Slip', required: true, icon: FileText, desc: 'Last 3 months salary slips' },
    { name: 'Photo', required: true, icon: User, desc: 'Passport size photograph' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h2 className="text-2xl font-bold mb-6">{t.documents}</h2>
      <div className="space-y-3">
        {docs.map((doc, i) => (
          <div key={i} className="card flex items-center gap-4">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${doc.required ? 'bg-green-100' : 'bg-gray-100'}`}>
              <doc.icon size={20} className={doc.required ? 'text-green-800' : 'text-gray-600'} />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-medium">{doc.name}</span>
                {doc.required && <span className="px-2 py-0.5 bg-red-100 text-red-800 rounded text-xs">Required</span>}
              </div>
              <p className="text-sm text-gray-500">{doc.desc}</p>
            </div>
            <CheckCircle className="text-green-500" size={20} />
          </div>
        ))}
      </div>
    </div>
  );
};

const ChatbotPage = () => {
  const { language } = useApp();
  const t = getT(language);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    const welcome = language === 'hi' ? 'नमस्ते! मैं आपका लोन सहायक हूं।' : language === 'ta' ? 'வணக்கம்! நான் உங்கள் கடன் உதவியாளன்.' : 'Hello! I\'m your loan assistant.';
    setMessages([{ role: 'bot', text: welcome }]);
  }, [language]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMsg = { role: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    try {
      const res = await api.getChatbotResponse(input, language);
      setMessages(prev => [...prev, { role: 'bot', text: res.response }]);
    } catch (e) {
      setMessages(prev => [...prev, { role: 'bot', text: 'Sorry, I\'m having trouble connecting.' }]);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="flex-1 p-4 space-y-3 overflow-y-auto">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[75%] p-3 rounded-lg ${m.role === 'user' ? 'bg-blue-800 text-white' : 'bg-white shadow'}`}>
              {m.text}
            </div>
          </div>
        ))}
      </div>
      <div className="p-4 bg-white border-t flex gap-2">
        <input value={input} onChange={(e) => setInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && sendMessage()} placeholder={t.askQuestion} className="flex-1 px-4 py-2 border rounded-full" />
        <button onClick={sendMessage} disabled={loading} className="w-10 h-10 bg-blue-800 text-white rounded-full flex items-center justify-center">
          {loading ? <Loader className="animate-spin" size={18} /> : <MessageCircle size={18} />}
        </button>
      </div>
    </div>
  );
};

const App = () => {
  const [userId, setUserId] = useState(localStorage.getItem('userId') || '');
  const [score, setScore] = useState(null);
  const [language, setLanguage] = useState('en');

  return (
    <AppContext.Provider value={{ userId, setUserId, score, setScore, language, setLanguage }}>
      <BrowserRouter>
        <Header />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/financial" element={<FinancialPage />} />
          <Route path="/result" element={<ResultPage />} />
          <Route path="/loans" element={<LoanProductsPage />} />
          <Route path="/simulator" element={<SimulatorPage />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/coach" element={<CoachPage />} />
          <Route path="/documents" element={<DocumentsPage />} />
          <Route path="/chat" element={<ChatbotPage />} />
        </Routes>
      </BrowserRouter>
    </AppContext.Provider>
  );
};

export default App;
