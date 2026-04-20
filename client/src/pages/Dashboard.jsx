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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30">
      {/* Header */}
      <nav className="bg-white/70 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            <div className="flex items-center space-x-3 group cursor-pointer">
              <div className="bg-indigo-600 p-2 rounded-xl shadow-lg shadow-indigo-200 animate-pulse group-hover:animate-none transition-all">
                <Zap size={22} className="text-white fill-current" />
              </div>
              <span className="text-2xl font-black tracking-tighter text-slate-900 group-hover:text-indigo-600 transition-colors">DevPulse</span>
            </div>
            
            <div className="flex items-center space-x-8">
              <RepoSelector 
                repos={repos} 
                selectedRepo={selectedRepo} 
                onSelect={setSelectedRepo} 
              />
              <button 
                onClick={handleLogout}
                className="flex items-center space-x-2 text-slate-500 hover:text-rose-600 font-bold text-sm transition-all hover:translate-x-1"
              >
                <LogOut size={18} />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-left">
        {/* Welcome Section */}
        <div className="mb-12 flex justify-between items-end">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Engineering Health</h1>
            <p className="text-lg font-medium text-slate-400 mt-2">Real-time DORA metrics for <span className="text-indigo-600 font-bold">{selectedRepo || 'your repositories'}</span></p>
          </div>
          <button 
            onClick={refetch}
            disabled={loadingMetrics}
            className="flex items-center space-x-2 bg-white px-6 py-3 rounded-xl border border-slate-200 shadow-sm text-sm font-bold text-slate-700 hover:border-indigo-500 hover:text-indigo-600 transition-all active:scale-95 disabled:opacity-50"
          >
            <RefreshCw size={18} className={loadingMetrics ? 'animate-spin' : ''} />
            <span>Sync Metrics</span>
          </button>
        </div>

        {error ? (
          <div className="bg-rose-50 border border-rose-100 rounded-2xl p-8 text-center shadow-lg shadow-rose-100">
            <p className="text-rose-600 font-bold text-lg">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="mt-4 text-sm font-bold text-rose-500 hover:text-rose-700 underline underline-offset-4"
            >
              Try again
            </button>
          </div>
        ) : (
          <div className="space-y-12">
            {/* Metric Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <MetricCard 
                title="Deployment Frequency"
                value={metrics?.deploymentFrequency || 0}
                unit="deploys / day"
                trend={metrics?.trends?.deploymentFrequency || 0}
                color="indigo"
                description="Velocity of value delivery to production."
              />
              <MetricCard 
                title="Lead Time"
                value={metrics?.leadTimeMinutes || 0}
                unit="min avg"
                trend={metrics?.trends?.leadTimeMinutes || 0}
                color="rose"
                description="Efficiency of the engineering lifecycle."
              />
              <MetricCard 
                title="MTTR"
                value={metrics?.mttrMinutes || 0}
                unit="min avg"
                trend={metrics?.trends?.mttrMinutes || 0}
                color="amber"
                description="Resilience and recovery speed."
              />
              <MetricCard 
                title="Change Failure Rate"
                value={metrics?.changeFailureRate || 0}
                unit="%"
                trend={metrics?.trends?.changeFailureRate || 0}
                color="red"
                description="Quality and stability of deployments."
              />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              <TrendChart 
                data={history} 
                metric="deploymentFrequency" 
                title="Deployment Frequency (30D)"
                color="#6366f1" 
              />
              <TrendChart 
                data={history} 
                metric="leadTimeMinutes" 
                title="Lead Time for Changes (30D)"
                color="#f43f5e" 
              />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              <TrendChart 
                data={history} 
                metric="mttrMinutes" 
                title="Mean Time to Recovery (30D)"
                color="#f59e0b" 
              />
              <TrendChart 
                data={history} 
                metric="changeFailureRate" 
                title="Change Failure Rate (30D)"
                color="#ef4444" 
              />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
