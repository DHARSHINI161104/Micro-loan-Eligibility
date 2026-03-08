import { useState, useEffect } from 'react';
import ScoreGauge from './ScoreGauge';
import FactorBreakdown from '../Charts/FactorBreakdown';
import ScoreHistory from '../Charts/ScoreHistory';
import WhatIfSimulator from '../Simulator/WhatIfSimulator';
import LoanMatcher from '../LoanMatch/LoanMatcher';
import { getAIExplanation, getScoreHistory } from '../../services/api';

export default function Dashboard({ scoreData, fraudFlags }) {
  const [aiExplanation, setAiExplanation] = useState('');
  const [language, setLanguage] = useState('en');
  const [scoreHistory, setScoreHistory] = useState([]);
  const [loadingAI, setLoadingAI] = useState(false);

  const score = scoreData?.score;

  useEffect(() => {
    fetchAIExplanation();
    fetchScoreHistory();
  }, [scoreData?.user_id]);

  const fetchAIExplanation = async () => {
    if (!score) return;
    setLoadingAI(true);
    try {
      const result = await getAIExplanation({
        total_score: score.total_score,
        income_stability_score: score.income_stability_score,
        expense_ratio_score: score.expense_ratio_score,
        emi_burden_score: score.emi_burden_score,
        digital_payment_score: score.digital_payment_score,
        savings_score: score.savings_score,
        factors_helped: score.factors_helped,
        factors_hurt: score.factors_hurt,
      }, language);
      setAiExplanation(result.explanation);
    } catch (error) {
      console.error('AI explanation error:', error);
    } finally {
      setLoadingAI(false);
    }
  };

  const fetchScoreHistory = async () => {
    if (!scoreData?.user_id) return;
    try {
      const history = await getScoreHistory(scoreData.user_id);
      setScoreHistory(history);
    } catch (error) {
      console.error('Score history error:', error);
    }
  };

  const handleLanguageChange = async (lang) => {
    setLanguage(lang);
    setLoadingAI(true);
    try {
      const result = await getAIExplanation({
        total_score: score.total_score,
        income_stability_score: score.income_stability_score,
        expense_ratio_score: score.expense_ratio_score,
        emi_burden_score: score.emi_burden_score,
        digital_payment_score: score.digital_payment_score,
        savings_score: score.savings_score,
        factors_helped: score.factors_helped,
        factors_hurt: score.factors_hurt,
      }, lang);
      setAiExplanation(result.explanation);
    } catch (error) {
      console.error('Translation error:', error);
    } finally {
      setLoadingAI(false);
    }
  };

  const getScoreClass = () => {
    if (score?.total_score >= 70) return 'score-high';
    if (score?.total_score >= 50) return 'score-medium';
    return 'score-low';
  };

  if (!score) return null;

  return (
    <div className="space-y-8 animate-fade-in">
      {fraudFlags && fraudFlags.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="font-semibold text-red-800 flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            Data Inconsistency Detected
          </h3>
          <ul className="mt-2 space-y-1">
            {fraudFlags.map((flag, idx) => (
              <li key={idx} className="text-red-700 text-sm flex items-start gap-2">
                <span className="text-red-500 mt-1">•</span>
                {flag.flag_message}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-8">
        <div className="card">
          <h2 className="text-xl font-bold text-slate-800 mb-6">Your Eligibility Score</h2>
          <div className="flex flex-col items-center">
            <ScoreGauge score={score.total_score} />
            <p className="text-slate-600 mt-4 text-center">
              Based on {scoreData.gig_platform || 'gig'} work data
            </p>
          </div>
        </div>

        <div className="card">
          <h2 className="text-xl font-bold text-slate-800 mb-6">Score Breakdown</h2>
          <FactorBreakdown score={score} />
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <div className="card">
          <h2 className="text-xl font-bold text-slate-800 mb-4">What Helped</h2>
          {score.factors_helped?.length > 0 ? (
            <ul className="space-y-2">
              {score.factors_helped.map((factor, idx) => (
                <li key={idx} className="flex items-center gap-2 text-green-700">
                  <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {factor}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-slate-500">No positive factors identified</p>
          )}

          <h2 className="text-xl font-bold text-slate-800 mt-6 mb-4">What Hurt</h2>
          {score.factors_hurt?.length > 0 ? (
            <ul className="space-y-2">
              {score.factors_hurt.map((factor, idx) => (
                <li key={idx} className="flex items-center gap-2 text-red-700">
                  <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  {factor}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-slate-500">No negative factors</p>
          )}
        </div>

        <div className="card">
          <h2 className="text-xl font-bold text-slate-800 mb-4">Improvement Suggestions</h2>
          <ul className="space-y-3">
            {score.improvement_suggestions?.map((suggestion, idx) => (
              <li key={idx} className="flex items-start gap-3 text-slate-700 bg-slate-50 p-3 rounded-lg">
                <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-2 py-1 rounded">
                  {idx + 1}
                </span>
                {suggestion}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="card">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-slate-800">AI Explanation</h2>
          <div className="flex gap-2 mt-2 md:mt-0">
            {['en', 'hi', 'ta'].map((lang) => (
              <button
                key={lang}
                onClick={() => handleLanguageChange(lang)}
                className={`px-3 py-1 text-sm rounded transition ${
                  language === lang
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {lang === 'en' ? 'English' : lang === 'hi' ? 'हिंदी' : 'தமிழ்'}
              </button>
            ))}
          </div>
        </div>
        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 p-6 rounded-lg">
          {loadingAI ? (
            <div className="flex items-center gap-2 text-slate-600">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Generating explanation...
            </div>
          ) : (
            <p className="text-slate-700 text-lg leading-relaxed">{aiExplanation}</p>
          )}
        </div>
      </div>

      <LoanMatcher score={score.total_score} monthlyEarnings={scoreData?.monthly_earnings || 25000} />

      <WhatIfSimulator currentData={scoreData} />

      {scoreHistory.length > 1 && (
        <div className="card">
          <h2 className="text-xl font-bold text-slate-800 mb-6">Score History</h2>
          <ScoreHistory history={scoreHistory} />
        </div>
      )}
    </div>
  );
}
