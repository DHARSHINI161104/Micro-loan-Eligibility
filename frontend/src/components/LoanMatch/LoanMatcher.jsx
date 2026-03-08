import { useState, useEffect } from 'react';
import { matchLoans } from '../../services/api';

export default function LoanMatcher({ score, monthlyEarnings }) {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLoans();
  }, [score, monthlyEarnings]);

  const fetchLoans = async () => {
    setLoading(true);
    try {
      const result = await matchLoans(score, monthlyEarnings);
      setLoans(result);
    } catch (error) {
      console.error('Loan matching error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="card">
        <h2 className="text-xl font-bold text-slate-800 mb-4">Matching Loan Products</h2>
        <div className="flex items-center justify-center py-8">
          <svg className="animate-spin h-8 w-8 text-emerald-600" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        </div>
      </div>
    );
  }

  const eligibleLoans = loans.filter((l) => l.eligibility_status === 'Eligible');
  const ineligibleLoans = loans.filter((l) => l.eligibility_status !== 'Eligible');

  return (
    <div className="card">
      <h2 className="text-xl font-bold text-slate-800 mb-4">Available Loan Products</h2>
      
      {eligibleLoans.length > 0 ? (
        <div className="space-y-4 mb-6">
          <h3 className="font-semibold text-emerald-700 flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Eligible for {eligibleLoans.length} product{eligibleLoans.length > 1 ? 's' : ''}
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {eligibleLoans.map((loan, idx) => (
              <div key={idx} className="border-2 border-emerald-200 bg-emerald-50 rounded-xl p-4 hover:shadow-md transition">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-bold text-slate-800">{loan.product_name}</h4>
                  <span className="bg-emerald-500 text-white text-xs px-2 py-1 rounded-full">Eligible</span>
                </div>
                <p className="text-sm text-slate-600 mb-3">{loan.description}</p>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Max Loan:</span>
                    <span className="font-semibold text-slate-800">₹{loan.max_loan_amount?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Interest:</span>
                    <span className="font-semibold text-slate-800">{loan.interest_rate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Min Score:</span>
                    <span className="font-semibold text-slate-800">{loan.score_required}</span>
                  </div>
                </div>
                <button className="w-full mt-4 bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 rounded-lg transition text-sm">
                  Apply Now
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-amber-800">Not Eligible Yet</h3>
          <p className="text-amber-700 text-sm mt-1">
            Work on improving your score to become eligible for these loan products.
          </p>
        </div>
      )}

      {ineligibleLoans.length > 0 && (
        <div className="space-y-4">
          <h3 className="font-semibold text-slate-500">Other Products (Not Eligible)</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {ineligibleLoans.map((loan, idx) => (
              <div key={idx} className="border border-slate-200 bg-slate-50 rounded-xl p-4">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-bold text-slate-700">{loan.product_name}</h4>
                  <span className="bg-slate-300 text-white text-xs px-2 py-1 rounded-full">Not Eligible</span>
                </div>
                <p className="text-sm text-slate-500 mb-2">{loan.description}</p>
                <div className="text-xs text-slate-500">
                  Score required: {loan.score_required} (you have {score})
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
