import { useState } from 'react';
import { calculateScore, checkFraud } from '../../services/api';

const GIG_PLATFORMS = ['Swiggy', 'Ola', 'Urban Company', 'Zomato', 'Amazon Flex', 'Flipkart', 'Dunzo', 'Other'];
const DIGITAL_LEVELS = ['Low', 'Medium', 'High'];

export default function UserForm({ onScoreCalculated, isLoading, setIsLoading }) {
  const [formData, setFormData] = useState({
    full_name: '',
    gig_platform: 'Swiggy',
    monthly_earnings: '',
    monthly_expenses: '',
    existing_emi: '',
    monthly_savings: '',
    digital_payment_level: 'Medium',
    bank_account_hash: '',
  });
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    if (!formData.full_name.trim()) newErrors.full_name = 'Name is required';
    if (!formData.monthly_earnings || formData.monthly_earnings <= 0) {
      newErrors.monthly_earnings = 'Enter valid monthly earnings';
    }
    if (!formData.monthly_expenses || formData.monthly_expenses < 0) {
      newErrors.monthly_expenses = 'Enter valid expenses';
    }
    if (formData.existing_emi < 0) newErrors.existing_emi = 'Enter valid EMI';
    if (!formData.monthly_savings || formData.monthly_savings < 0) {
      newErrors.monthly_savings = 'Enter valid savings';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const [scoreResult, fraudResult] = await Promise.all([
        calculateScore({
          ...formData,
          monthly_earnings: parseFloat(formData.monthly_earnings),
          monthly_expenses: parseFloat(formData.monthly_expenses),
          existing_emi: parseFloat(formData.existing_emi) || 0,
          monthly_savings: parseFloat(formData.monthly_savings),
        }),
        checkFraud({
          monthly_earnings: parseFloat(formData.monthly_earnings),
          monthly_expenses: parseFloat(formData.monthly_expenses),
          existing_emi: parseFloat(formData.existing_emi) || 0,
          monthly_savings: parseFloat(formData.monthly_savings),
        }),
      ]);

      onScoreCalculated(scoreResult, fraudResult);
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to calculate score. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-slate-800">Check Your Loan Eligibility</h2>
        <p className="text-slate-600 mt-2">Enter your gig work details to see your eligibility score</p>
      </div>

      <form onSubmit={handleSubmit} className="card space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Full Name</label>
            <input
              type="text"
              name="full_name"
              value={formData.full_name}
              onChange={handleChange}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition ${errors.full_name ? 'border-red-500' : 'border-slate-300'}`}
              placeholder="Enter your full name"
            />
            {errors.full_name && <p className="text-red-500 text-xs mt-1">{errors.full_name}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Gig Platform</label>
            <select
              name="gig_platform"
              value={formData.gig_platform}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition"
            >
              {GIG_PLATFORMS.map((platform) => (
                <option key={platform} value={platform}>{platform}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Monthly Earnings (₹)</label>
            <input
              type="number"
              name="monthly_earnings"
              value={formData.monthly_earnings}
              onChange={handleChange}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition ${errors.monthly_earnings ? 'border-red-500' : 'border-slate-300'}`}
              placeholder="e.g., 25000"
              min="0"
            />
            {errors.monthly_earnings && <p className="text-red-500 text-xs mt-1">{errors.monthly_earnings}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Monthly Expenses (₹)</label>
            <input
              type="number"
              name="monthly_expenses"
              value={formData.monthly_expenses}
              onChange={handleChange}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition ${errors.monthly_expenses ? 'border-red-500' : 'border-slate-300'}`}
              placeholder="e.g., 15000"
              min="0"
            />
            {errors.monthly_expenses && <p className="text-red-500 text-xs mt-1">{errors.monthly_expenses}</p>}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Existing EMI Amount (₹)</label>
            <input
              type="number"
              name="existing_emi"
              value={formData.existing_emi}
              onChange={handleChange}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition ${errors.existing_emi ? 'border-red-500' : 'border-slate-300'}`}
              placeholder="e.g., 3000"
              min="0"
            />
            {errors.existing_emi && <p className="text-red-500 text-xs mt-1">{errors.existing_emi}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Monthly Savings (₹)</label>
            <input
              type="number"
              name="monthly_savings"
              value={formData.monthly_savings}
              onChange={handleChange}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition ${errors.monthly_savings ? 'border-red-500' : 'border-slate-300'}`}
              placeholder="e.g., 5000"
              min="0"
            />
            {errors.monthly_savings && <p className="text-red-500 text-xs mt-1">{errors.monthly_savings}</p>}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Digital Payment Usage</label>
          <div className="flex gap-4">
            {DIGITAL_LEVELS.map((level) => (
              <label key={level} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="digital_payment_level"
                  value={level}
                  checked={formData.digital_payment_level === level}
                  onChange={handleChange}
                  className="w-4 h-4 text-emerald-600 focus:ring-emerald-500"
                />
                <span className="text-slate-700">{level}</span>
              </label>
            ))}
          </div>
          <p className="text-xs text-slate-500 mt-1">How often do you use UPI/online payments?</p>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-4 px-6 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Calculating...
            </>
          ) : (
            'Check Eligibility'
          )}
        </button>
      </form>

      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-800 flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Why This Matters
        </h3>
        <p className="text-blue-700 text-sm mt-2">
          Traditional banks often reject gig workers due to lack of salary slips. We analyze your gig income, expenses, and digital payment history to give you a fair chance at micro-loans.
        </p>
      </div>
    </div>
  );
}
