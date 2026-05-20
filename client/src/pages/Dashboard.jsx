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
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 relative overflow-x-hidden font-sans">
      
      {/* BACKGROUND EFFECTS: Multi-color space mesh */}
      <div className="absolute inset-0 bg-grid-pattern-dark opacity-35 pointer-events-none z-0"></div>
      <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full bg-emerald-500/5 blur-[130px] pointer-events-none z-0"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-teal-500/5 blur-[130px] pointer-events-none z-0"></div>

      {/* Header */}
      <nav className="bg-slate-950/40 backdrop-blur-md border-b border-slate-900/60 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            <div className="flex items-center space-x-3 group cursor-pointer">
              <div className="bg-emerald-600 p-2.5 rounded-xl shadow-lg shadow-emerald-500/20 ring-1 ring-emerald-400/30">
                <Zap size={22} className="text-white fill-current" />
              </div>
              <span className="text-2xl font-black tracking-tighter text-white group-hover:text-emerald-400 transition-colors">DevPulse</span>
            </div>

            <div className="flex items-center space-x-8">
              <RepoSelector
                repos={repos}
                selectedRepo={selectedRepo}
                onSelect={setSelectedRepo}
              />
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 text-slate-400 hover:text-rose-400 font-bold text-sm transition-all hover:translate-x-1"
              >
                <LogOut size={18} />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-left relative z-10">
        {/* Welcome Section */}
        <div className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div>
            <div className="flex items-center gap-4 mb-2">
              <h1 className="text-4xl font-black text-white tracking-tight">Engineering Health</h1>
              <div className="flex items-center gap-2 px-3 py-1 bg-emerald-950/50 border border-emerald-900/50 rounded-full shadow-sm">
                <div className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </div>
                <span className="text-[10px] font-black text-emerald-400 tracking-wider uppercase mt-px">Live</span>
              </div>
            </div>
            <p className="text-lg font-medium text-slate-400">
              Real-time DORA metrics for <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-400 bg-clip-text text-transparent font-bold">{selectedRepo || 'your repositories'}</span>
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleGenerateInsight}
              disabled={loadingInsight || loadingMetrics}
              className="flex items-center space-x-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 px-6 py-3 rounded-xl shadow-lg shadow-emerald-500/10 text-sm font-bold text-white transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              <Sparkles size={18} className={loadingInsight ? 'animate-pulse' : ''} />
              <span>{loadingInsight ? 'Analyzing...' : 'AI Insights'}</span>
            </button>
            <button
              onClick={refetch}
              disabled={loadingMetrics}
              className="flex items-center space-x-2 bg-slate-900 text-slate-200 px-6 py-3 rounded-xl shadow-sm text-sm font-bold hover:bg-slate-800 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw size={18} className={loadingMetrics ? 'animate-spin' : ''} />
              <span>Sync Metrics</span>
            </button>
          </div>
        </div>

        {/* AI Insight Card */}
        {(aiInsight || loadingInsight) && (
          <div className="mb-12 bg-gradient-to-r from-emerald-950/20 via-teal-950/20 to-slate-950/40 border border-emerald-950/40 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl opacity-50 -mr-10 -mt-10 pointer-events-none"></div>
            <div className="flex items-start gap-4 relative z-10">
              <div className="p-3 bg-slate-900 rounded-xl shadow-sm text-emerald-400">
                <Sparkles size={24} className={loadingInsight ? 'animate-spin' : ''} />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-black text-white mb-2">DevPulse AI Analysis</h3>
                {loadingInsight ? (
                  <div className="space-y-2 animate-pulse">
                    <div className="h-4 bg-emerald-500/20 rounded w-3/4"></div>
                    <div className="h-4 bg-emerald-500/20 rounded w-1/2"></div>
                  </div>
                ) : (
                  <p className="text-slate-300 font-medium leading-relaxed">{aiInsight}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {error ? (
          <div className="bg-rose-950/30 border border-rose-900/40 rounded-2xl p-8 text-center shadow-2xl">
            <p className="text-rose-400 font-bold text-lg">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 text-sm font-bold text-rose-400 hover:text-rose-300 underline underline-offset-4"
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
                color="from-emerald-500 to-teal-600"
                subText="Velocity of value delivery."
              />
              <MetricCard
                title="Lead Time"
                value={metrics?.leadTimeMinutes || 0}
                unit="min avg"
                trend={metrics?.trends?.leadTimeMinutes}
                icon={Clock}
                color="from-emerald-600 to-teal-500"
                subText="Code to production speed."
              />
              <MetricCard
                title="MTTR"
                value={metrics?.mttrMinutes || 0}
                unit="min avg"
                trend={metrics?.trends?.mttrMinutes}
                icon={Activity}
                color="from-teal-500 to-emerald-400"
                subText="Resilience and recovery."
              />
              <MetricCard
                title="Failure Rate"
                value={metrics?.changeFailureRate?.toString().replace('%', '') || 0}
                unit="%"
                trend={metrics?.trends?.changeFailureRate}
                icon={AlertCircle}
                color="from-rose-500 to-red-600"
                subText="Stability of deployments."
              />
              <MetricCard
                title="Total Pushes"
                value={metrics?.totalPushes || 0}
                unit="commits"
                icon={GitCommit}
                color="from-slate-600 to-slate-800"
                subText="Development activity volume."
              />
              <MetricCard
                title="Total PRs"
                value={metrics?.totalPRsMerged || 0}
                unit="merged"
                icon={GitPullRequest}
                color="from-emerald-400 to-teal-500"
                subText="Collaboration and code review."
              />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              <TrendChart
                data={history}
                metric="deploymentFrequency"
                title="Deployment Frequency (30D)"
                color="#10b981"
              />
              <TrendChart
                data={history}
                metric="leadTimeMinutes"
                title="Lead Time for Changes (30D)"
                color="#34d399"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              <TrendChart
                data={history}
                metric="mttrMinutes"
                title="Mean Time to Recovery (30D)"
                color="#14b8a6"
              />
              <TrendChart
                data={history}
                metric="changeFailureRate"
                title="Change Failure Rate (30D)"
                color="#f43f5e"
              />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
