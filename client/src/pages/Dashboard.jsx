import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, RefreshCw, Zap, Rocket, Clock, Activity, AlertCircle, GitCommit, GitPullRequest, Sparkles } from 'lucide-react';
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

  const [aiInsight, setAiInsight] = useState(null);
  const [loadingInsight, setLoadingInsight] = useState(false);

  // Reset insight when repo changes
  useEffect(() => {
    setAiInsight(null);
  }, [selectedRepo]);

  const handleGenerateInsight = async () => {
    if (!selectedRepo) return;
    setLoadingInsight(true);
    setAiInsight(null);
    try {
      const [owner, repo] = selectedRepo.split('/');
      const res = await api.get(`/api/metrics/${owner}/${repo}/insights`);
      setAiInsight(res.data.insight);
    } catch (err) {
      console.error('Failed to generate insight:', err);
      setAiInsight('Failed to generate insights. Ensure the backend is configured correctly.');
    } finally {
      setLoadingInsight(false);
    }
  };

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
            <div className="flex items-center gap-4 mb-2">
              <h1 className="text-4xl font-black text-slate-900 tracking-tight">Engineering Health</h1>
              <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 border border-emerald-200 rounded-full shadow-sm">
                <div className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </div>
                <span className="text-[10px] font-black text-emerald-700 tracking-wider uppercase mt-px">Live</span>
              </div>
            </div>
            <p className="text-lg font-medium text-slate-400">Real-time DORA metrics for <span className="text-indigo-600 font-bold">{selectedRepo || 'your repositories'}</span></p>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={handleGenerateInsight}
              disabled={loadingInsight || loadingMetrics}
              className="flex items-center space-x-2 bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-3 rounded-xl shadow-md text-sm font-bold text-white hover:shadow-lg hover:scale-105 transition-all active:scale-95 disabled:opacity-50"
            >
              <Sparkles size={18} className={loadingInsight ? 'animate-pulse' : ''} />
              <span>{loadingInsight ? 'Analyzing...' : 'AI Insights'}</span>
            </button>
            <button 
              onClick={refetch}
              disabled={loadingMetrics}
              className="flex items-center space-x-2 bg-white px-6 py-3 rounded-xl border border-slate-200 shadow-sm text-sm font-bold text-slate-700 hover:border-indigo-500 hover:text-indigo-600 transition-all active:scale-95 disabled:opacity-50"
            >
              <RefreshCw size={18} className={loadingMetrics ? 'animate-spin' : ''} />
              <span>Sync Metrics</span>
            </button>
          </div>
        </div>

        {/* AI Insight Card */}
        {(aiInsight || loadingInsight) && (
          <div className="mb-12 bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 border border-purple-100 rounded-2xl p-6 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-200 rounded-full blur-3xl opacity-50 -mr-10 -mt-10 pointer-events-none"></div>
            <div className="flex items-start gap-4 relative z-10">
              <div className="p-3 bg-white rounded-xl shadow-sm border border-purple-100 text-purple-600">
                <Sparkles size={24} className={loadingInsight ? 'animate-spin' : ''} />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-black text-slate-900 mb-2">DevPulse AI Analysis</h3>
                {loadingInsight ? (
                  <div className="space-y-2 animate-pulse">
                    <div className="h-4 bg-purple-200/50 rounded w-3/4"></div>
                    <div className="h-4 bg-purple-200/50 rounded w-1/2"></div>
                  </div>
                ) : (
                  <p className="text-slate-700 font-medium leading-relaxed">{aiInsight}</p>
                )}
              </div>
            </div>
          </div>
        )}

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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <MetricCard
                title="Deployment Frequency"
                value={metrics?.deploymentFrequency || 0}
                unit="deploys / day"
                trend={metrics?.trends?.deploymentFrequency}
                icon={Rocket}
                color="from-indigo-500 to-blue-600"
                subText="Velocity of value delivery."
              />
              <MetricCard
                title="Lead Time"
                value={metrics?.leadTimeMinutes || 0}
                unit="min avg"
                trend={metrics?.trends?.leadTimeMinutes}
                icon={Clock}
                color="from-rose-500 to-pink-600"
                subText="Code to production speed."
              />
              <MetricCard
                title="MTTR"
                value={metrics?.mttrMinutes || 0}
                unit="min avg"
                trend={metrics?.trends?.mttrMinutes}
                icon={Activity}
                color="from-amber-500 to-orange-600"
                subText="Resilience and recovery."
              />
              <MetricCard
                title="Failure Rate"
                value={metrics?.changeFailureRate?.toString().replace('%', '') || 0}
                unit="%"
                trend={metrics?.trends?.changeFailureRate}
                icon={AlertCircle}
                color="from-red-500 to-rose-600"
                subText="Stability of deployments."
              />
              <MetricCard
                title="Total Pushes"
                value={metrics?.totalPushes || 0}
                unit="commits"
                icon={GitCommit}
                color="from-purple-500 to-indigo-600"
                subText="Development activity volume."
              />
              <MetricCard
                title="Total PRs"
                value={metrics?.totalPRsMerged || 0}
                unit="merged"
                icon={GitPullRequest}
                color="from-teal-500 to-emerald-600"
                subText="Collaboration and code review."
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
