import { useState } from 'react';
import UserForm from './components/Form/UserForm';
import Dashboard from './components/Dashboard/Dashboard';

function App() {
  const [scoreData, setScoreData] = useState(null);
  const [fraudFlags, setFraudFlags] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleScoreCalculated = (data, fraud) => {
    setScoreData(data);
    setFraudFlags(fraud);
  };

  const handleReset = () => {
    setScoreData(null);
    setFraudFlags([]);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-4 px-4 shadow-lg">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h1 className="text-xl md:text-2xl font-bold">Gig Loan Eligibility</h1>
          </div>
          {scoreData && (
            <button
              onClick={handleReset}
              className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
            >
              New Application
            </button>
          )}
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {!scoreData ? (
          <UserForm onScoreCalculated={handleScoreCalculated} isLoading={isLoading} setIsLoading={setIsLoading} />
        ) : (
          <Dashboard scoreData={scoreData} fraudFlags={fraudFlags} />
        )}
      </main>

      <footer className="bg-slate-800 text-slate-400 py-6 mt-12">
        <div className="max-w-6xl mx-auto px-4 text-center text-sm">
          <p>Helping gig workers access financial services</p>
          <p className="mt-2">Built with care for the gig economy</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
