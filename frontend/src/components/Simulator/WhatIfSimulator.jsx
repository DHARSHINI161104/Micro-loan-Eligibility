import { useState, useEffect } from 'react';
import { whatIfSimulate } from '../../services/api';
import ScoreGauge from '../Dashboard/ScoreGauge';

export default function WhatIfSimulator({ currentData }) {
  const [simulation, setSimulation] = useState({
    monthly_earnings: currentData?.monthly_earnings || 25000,
    monthly_expenses: currentData?.monthly_expenses || 15000,
    existing_emi: currentData?.existing_emi || 0,
    monthly_savings: currentData?.monthly_savings || 5000,
    digital_payment_level: currentData?.digital_payment_level || 'Medium',
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const debounce = setTimeout(() => {
      runSimulation();
    }, 500);
    return () => clearTimeout(debounce);
  }, [simulation]);

  const runSimulation = async () => {
    setLoading(true);
    try {
      const response = await whatIfSimulate(simulation);
      setResult(response.score);
    } catch (error) {
      console.error('Simulation error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getScoreClass = () => {
    if (!result) return '';
    if (result.total_score >= 70) return 'score-high';
    if (result.total_score >= 50) return 'score-medium';
    return 'score-low';
  };

  return (
    <div className="card">
      <h2 className="text-xl font-bold text-slate-800 mb-2">What-If Simulator</h2>
      <p className="text-slate-600 text-sm mb-6">
        Adjust the sliders to see how changes affect your eligibility score
      </p>

      <div className="grid lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div>
            <div className="flex justify-between mb-2">
              <label className="text-sm font-medium text-slate-700">Monthly Earnings</label>
              <span className="text-sm font-semibold text-emerald-600">₹{simulation.monthly_earnings.toLocaleString()}</span>
            </div>
            <input
              type="range"
              min="5000"
              max="100000"
              step="1000"
              value={simulation.monthly_earnings}
              onChange={(e) => setSimulation({ ...simulation, monthly_earnings: parseInt(e.target.value) })}
              className="w-full"
            />
          </div>

          <div>
            <div className="flex justify-between mb-2">
              <label className="text-sm font-medium text-slate-700">Monthly Expenses</label>
              <span className="text-sm font-semibold text-emerald-600">₹{simulation.monthly_expenses.toLocaleString()}</span>
            </div>
            <input
              type="range"
              min="0"
              max="80000"
              step="500"
              value={simulation.monthly_expenses}
              onChange={(e) => setSimulation({ ...simulation, monthly_expenses: parseInt(e.target.value) })}
              className="w-full"
            />
          </div>

          <div>
            <div className="flex justify-between mb-2">
              <label className="text-sm font-medium text-slate-700">Existing EMI</label>
              <span className="text-sm font-semibold text-emerald-600">₹{simulation.existing_emi.toLocaleString()}</span>
            </div>
            <input
              type="range"
              min="0"
              max="30000"
              step="500"
              value={simulation.existing_emi}
              onChange={(e) => setSimulation({ ...simulation, existing_emi: parseInt(e.target.value) })}
              className="w-full"
            />
          </div>

          <div>
            <div className="flex justify-between mb-2">
              <label className="text-sm font-medium text-slate-700">Monthly Savings</label>
              <span className="text-sm font-semibold text-emerald-600">₹{simulation.monthly_savings.toLocaleString()}</span>
            </div>
            <input
              type="range"
              min="0"
              max="50000"
              step="500"
              value={simulation.monthly_savings}
              onChange={(e) => setSimulation({ ...simulation, monthly_savings: parseInt(e.target.value) })}
              className="w-full"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700 mb-2 block">Digital Payment Usage</label>
            <div className="flex gap-2">
              {['Low', 'Medium', 'High'].map((level) => (
                <button
                  key={level}
                  onClick={() => setSimulation({ ...simulation, digital_payment_level: level })}
                  className={`flex-1 py-2 text-sm rounded-lg transition ${
                    simulation.digital_payment_level === level
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center">
          {loading ? (
            <div className="flex items-center gap-2 text-slate-500">
              <svg className="animate-spin h-6 w-6" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Calculating...
            </div>
          ) : result ? (
            <div className="text-center">
              <div className={getScoreClass()}>
                <ScoreGauge score={result.total_score} />
              </div>
              <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                <div className="bg-slate-50 p-3 rounded-lg">
                  <div className="text-slate-500">Income Score</div>
                  <div className="font-bold text-slate-800">{result.income_stability_score}/30</div>
                </div>
                <div className="bg-slate-50 p-3 rounded-lg">
                  <div className="text-slate-500">Expense Score</div>
                  <div className="font-bold text-slate-800">{result.expense_ratio_score}/25</div>
                </div>
                <div className="bg-slate-50 p-3 rounded-lg">
                  <div className="text-slate-500">EMI Score</div>
                  <div className="font-bold text-slate-800">{result.emi_burden_score}/20</div>
                </div>
                <div className="bg-slate-50 p-3 rounded-lg">
                  <div className="text-slate-500">Savings Score</div>
                  <div className="font-bold text-slate-800">{result.savings_score}/10</div>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
