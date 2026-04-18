import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, RefreshCw, Zap, Code } from 'lucide-react';
import api from '../lib/axios';
import { useRepoMetrics } from '../hooks/useRepoMetrics';
import RepoSelector from '../components/RepoSelector';
import MetricCard from '../components/MetricCard';
import TrendChart from '../components/TrendChart';

export default function Dashboard() {
  const navigate = useNavigate();
  const [repos, setRepos] = useState([]);
  const [selectedRepo, setSelectedRepo] = useState('');
  const [loadingRepos, setLoadingRepos] = useState(true);

  const { metrics, history, loading: loadingMetrics, error, refetch } = useRepoMetrics(selectedRepo);

  useEffect(() => {
    const fetchRepos = async () => {
      try {
        const res = await api.get('/api/repos');
        setRepos(res.data.repos);
        if (res.data.repos.length > 0) {
          setSelectedRepo(res.data.repos[0].fullName);
        }
      } catch (err) {
        console.error('Failed to fetch repos:', err);
      } finally {
        setLoadingRepos(false);
      }
    };
    fetchRepos();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('devpulse_token');
    navigate('/login');
  };

  if (loadingRepos) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center space-x-2 text-indigo-600">
              <Zap size={24} fill="currentColor" />
              <span className="text-xl font-bold tracking-tight text-slate-900">DevPulse</span>
            </div>
            
            <div className="flex items-center space-x-6">
              <RepoSelector 
                repos={repos} 
                selectedRepo={selectedRepo} 
                onSelect={setSelectedRepo} 
              />
              <button 
                onClick={handleLogout}
                className="flex items-center space-x-2 text-slate-500 hover:text-slate-700 font-medium text-sm transition-colors"
              >
                <LogOut size={18} />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-left">
        {/* Welcome Section */}
        <div className="mb-8 flex justify-between items-end">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Engineering Health</h1>
            <p className="text-slate-500 mt-1">Real-time DORA metrics for {selectedRepo || 'your repositories'}</p>
          </div>
          <button 
            onClick={refetch}
            disabled={loadingMetrics}
            className="flex items-center space-x-2 bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-sm text-sm font-medium text-slate-700 hover:bg-slate-50 transition-all disabled:opacity-50"
          >
            <RefreshCw size={16} className={loadingMetrics ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>
        </div>

        {error ? (
          <div className="bg-red-50 border border-red-100 rounded-xl p-6 text-center">
            <p className="text-red-600 font-medium">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="mt-4 text-sm text-red-500 underline"
            >
              Try again
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Metric Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <MetricCard 
                title="Deployment Frequency"
                value={metrics?.deploymentFrequency || 0}
                unit="deploys / day"
                trend={0}
                description="How often code is successfully deployed to production."
              />
              <MetricCard 
                title="Lead Time"
                value={metrics?.leadTimeMinutes || 0}
                unit="min avg"
                trend={0}
                description="Time from first commit to successful deployment."
              />
              <MetricCard 
                title="MTTR"
                value={metrics?.mttrMinutes || 0}
                unit="min avg"
                trend={0}
                description="Mean time to recover from a service failure."
              />
              <MetricCard 
                title="Change Failure Rate"
                value={metrics?.changeFailureRate || 0}
                unit="%"
                trend={0}
                description="Percentage of deployments causing failure in production."
              />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <TrendChart 
                data={history} 
                metric="deploymentFrequency" 
                color="#6366f1" 
              />
              <TrendChart 
                data={history} 
                metric="leadTimeMinutes" 
                color="#ec4899" 
              />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <TrendChart 
                data={history} 
                metric="mttrMinutes" 
                color="#f59e0b" 
              />
              <TrendChart 
                data={history} 
                metric="changeFailureRate" 
                color="#ef4444" 
              />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
