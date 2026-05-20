import React, { useState, useEffect } from 'react';
import { Zap, Rocket, Clock, Activity, AlertCircle, Sparkles, Shield, ChevronRight } from 'lucide-react';

export default function Login() {
  const [activeSlide, setActiveSlide] = useState(0);
  const [hoveredChart, setHoveredChart] = useState(null);

  const handleLogin = () => {
    window.location.href = `${import.meta.env.VITE_API_URL || 'https://devpulse-frontend-kg5k.onrender.com'}/auth/github`;
  };

  const slides = [
    {
      title: "Automated DORA Performance Tracking",
      description: "Connect GitHub repositories instantly to extract and measure Deployment Frequency, Lead Time, MTTR, and Change Failure Rate in real-time.",
      badge: "Delivery Velocity"
    },
    {
      title: "AI-Powered Engineering Diagnostics",
      description: "Generate intelligent suggestions using DevPulse AI to unblock code reviews, optimize pipelines, and streamline production releases.",
      badge: "AI Insights"
    },
    {
      title: "Enterprise Stability & Reliability Guardrails",
      description: "Monitor failure trends, MTTR anomalies, and team health with interactive telemetry designed for modern engineering leaders.",
      badge: "Reliability"
    }
  ];

  // Rotate slides automatically every 6 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="h-screen w-screen flex flex-col lg:flex-row bg-slate-950 text-slate-100 font-sans overflow-hidden relative">
      
      {/* BACKGROUND EFFECTS: Multi-color space mesh */}
      <div className="absolute inset-0 bg-grid-pattern-dark opacity-30 pointer-events-none z-0"></div>
      
      {/* Floating Space Blobs with Rich Color Combinations (Motion removed) */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-indigo-500/10 blur-[120px] pointer-events-none z-0"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-purple-500/10 blur-[120px] pointer-events-none z-0"></div>
      <div className="absolute top-1/3 left-1/3 w-[300px] h-[300px] rounded-full bg-emerald-500/5 blur-[100px] pointer-events-none z-0"></div>
      
      {/* 2-COLUMN SPLIT LAYOUT - Viewport Constrained on all device sizes */}
      
      {/* LEFT COLUMN: LOGO & HEADING (plus charts on desktop only) */}
      <div className="w-full lg:w-1/2 flex-shrink-0 min-w-0 flex flex-col justify-start lg:justify-between p-5 sm:p-8 xl:p-12 relative z-10 lg:bg-slate-950/40">
        
        {/* LOGO */}
        <div className="flex items-center space-x-3">
          <div className="bg-indigo-600 p-2.5 rounded-xl shadow-lg shadow-indigo-500/20 ring-1 ring-indigo-400/30">
            <Zap size={20} className="text-white fill-current animate-pulse" />
          </div>
          <span className="text-xl font-black tracking-tighter text-white font-sans">DevPulse</span>
        </div>

        {/* HEADING (Visible on all, shifted down away from logo on mobile) */}
        <div className="mt-14 mb-4 lg:my-auto max-w-xl space-y-3 lg:space-y-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-950/80 border border-indigo-800/40 rounded-full mb-2 lg:mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-ping"></span>
              <span className="text-[10px] font-bold text-indigo-300 uppercase tracking-wider font-sans">Enterprise Analytics</span>
            </div>
            <h2 className="text-xl sm:text-3xl xl:text-4xl font-extrabold text-white tracking-tight leading-tight">
              Real-time Repository health, <br />
              <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                driven by DORA metrics.
              </span>
            </h2>
          </div>

          {/* DORA Graphs Grid - HELD ONLY ON DESKTOP (lg and above, borders removed) */}
          <div className="hidden lg:grid grid-cols-2 gap-4">
            
            {/* Chart 1: Deployment Velocity */}
            <div 
              onMouseEnter={() => setHoveredChart('velocity')}
              onMouseLeave={() => setHoveredChart(null)}
              className="bg-slate-900/40 backdrop-blur-md rounded-xl p-4 relative overflow-hidden transition-all duration-300 hover:shadow-indigo-500/10 chart-shimmer"
            >
              <div className="flex justify-between items-center mb-1">
                <div className="flex items-center gap-1.5">
                  <div className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-indigo-400">
                    <Rocket size={13} />
                  </div>
                  <span className="text-[11px] font-bold text-slate-200">Deployment Velocity</span>
                </div>
                <span className="text-[8px] font-black px-1.5 py-0.5 rounded border text-indigo-400 bg-indigo-950/50 border-indigo-900/50">
                  18.4/DAY
                </span>
              </div>

              {/* Deployment rate area chart - Highly Detailed Premium SVG */}
              <div className="h-28 w-full flex items-end relative">
                <svg className="w-full h-full" viewBox="0 0 280 100" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="velocity-indigo" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#6366f1" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
                    </linearGradient>
                    <linearGradient id="velocity-purple" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#a855f7" stopOpacity="0.12" />
                      <stop offset="100%" stopColor="#a855f7" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  
                  {/* Grid Lines */}
                  <line x1="30" y1="20" x2="270" y2="20" stroke="#1e293b" strokeWidth="0.5" strokeDasharray="2 2" />
                  <line x1="30" y1="50" x2="270" y2="50" stroke="#1e293b" strokeWidth="0.5" strokeDasharray="2 2" />
                  <line x1="30" y1="80" x2="270" y2="80" stroke="#1e293b" strokeWidth="0.5" strokeDasharray="2 2" />
                  
                  <line x1="70" y1="10" x2="70" y2="85" stroke="#1e293b" strokeWidth="0.5" strokeDasharray="2 2" />
                  <line x1="110" y1="10" x2="110" y2="85" stroke="#1e293b" strokeWidth="0.5" strokeDasharray="2 2" />
                  <line x1="150" y1="10" x2="150" y2="85" stroke="#1e293b" strokeWidth="0.5" strokeDasharray="2 2" />
                  <line x1="190" y1="10" x2="190" y2="85" stroke="#1e293b" strokeWidth="0.5" strokeDasharray="2 2" />
                  <line x1="230" y1="10" x2="230" y2="85" stroke="#1e293b" strokeWidth="0.5" strokeDasharray="2 2" />

                  {/* Y-Axis Labels */}
                  <text x="24" y="23" textAnchor="end" className="text-[8px] fill-slate-500 font-bold">30/d</text>
                  <text x="24" y="53" textAnchor="end" className="text-[8px] fill-slate-500 font-bold">15/d</text>
                  <text x="24" y="83" textAnchor="end" className="text-[8px] fill-slate-500 font-bold">0</text>

                  {/* X-Axis Labels */}
                  <text x="70" y="94" textAnchor="middle" className="text-[7.5px] fill-slate-600 font-bold">Mon</text>
                  <text x="110" y="94" textAnchor="middle" className="text-[7.5px] fill-slate-600 font-bold">Tue</text>
                  <text x="150" y="94" textAnchor="middle" className="text-[7.5px] fill-slate-600 font-bold">Wed</text>
                  <text x="190" y="94" textAnchor="middle" className="text-[7.5px] fill-slate-600 font-bold">Thu</text>
                  <text x="230" y="94" textAnchor="middle" className="text-[7.5px] fill-slate-600 font-bold">Fri</text>
                  
                  {/* Staging Violet Curve and Area */}
                  <path
                    d="M 30,75 C 60,65 90,75 110,40 C 140,5 160,85 190,45 C 220,10 250,55 270,30 L 270,80 L 30,80 Z"
                    fill="url(#velocity-purple)"
                  />
                  <path
                    d="M 30,75 C 60,65 90,75 110,40 C 140,5 160,85 190,45 C 220,10 250,55 270,30"
                    fill="none"
                    stroke="#a855f7"
                    strokeWidth="1"
                    strokeOpacity="0.5"
                    strokeLinecap="round"
                  />

                  {/* Production Indigo Curve and Area */}
                  <path
                    d="M 30,70 C 60,50 80,18 110,32 C 140,46 170,8 190,24 C 220,40 240,15 270,12 L 270,80 L 30,80 Z"
                    fill="url(#velocity-indigo)"
                  />
                  <path
                    d="M 30,70 C 60,50 80,18 110,32 C 140,46 170,8 190,24 C 220,40 240,15 270,12"
                    fill="none"
                    stroke="#6366f1"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                  />
                  
                  {/* Dashed vertical indicator line */}
                  <line x1="170" y1="10" x2="170" y2="80" stroke="#6366f1" strokeWidth="0.8" strokeDasharray="1.5 1.5" />
                  
                  {/* Coordinate nodes */}
                  <circle cx="170" cy="8" r="3.5" fill="#818cf8" className="animate-ping" />
                  <circle cx="170" cy="8" r="2.2" fill="#6366f1" />

                  {/* HTML Tooltip Box inside SVG */}
                  <g transform="translate(180, 5)">
                    <rect width="64" height="15" rx="3.5" fill="#0f172a" stroke="#312e81" strokeWidth="0.8" opacity="0.95" />
                    <text x="32" y="10.5" textAnchor="middle" className="text-[7.5px] fill-indigo-300 font-black font-sans">Active: 28 deploys</text>
                  </g>
                </svg>
              </div>
            </div>

            {/* Chart 2: System Health & MTTR */}
            <div 
              onMouseEnter={() => setHoveredChart('stability')}
              onMouseLeave={() => setHoveredChart(null)}
              className="bg-slate-900/40 backdrop-blur-md rounded-xl p-4 relative overflow-hidden transition-all duration-300 hover:shadow-emerald-500/10 chart-shimmer"
            >
              <div className="flex justify-between items-center mb-1">
                <div className="flex items-center gap-1.5">
                  <div className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-emerald-400">
                    <Activity size={13} />
                  </div>
                  <span className="text-[11px] font-bold text-slate-200">Incident Recovery (MTTR)</span>
                </div>
                <span className="text-[8px] font-black px-1.5 py-0.5 rounded border text-emerald-400 bg-emerald-950/50 border-emerald-900/50">
                  99.9% UPTIME
                </span>
              </div>

              {/* Dual line recovery chart - Highly Detailed Premium SVG */}
              <div className="h-28 w-full flex items-end relative">
                <svg className="w-full h-full" viewBox="0 0 280 100" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="mttr-emerald" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity="0.22" />
                      <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                    </linearGradient>
                  </defs>

                  {/* Grid Lines */}
                  <line x1="30" y1="20" x2="270" y2="20" stroke="#1e293b" strokeWidth="0.5" strokeDasharray="2 2" />
                  <line x1="30" y1="50" x2="270" y2="50" stroke="#1e293b" strokeWidth="0.5" strokeDasharray="2 2" />
                  <line x1="30" y1="80" x2="270" y2="80" stroke="#1e293b" strokeWidth="0.5" strokeDasharray="2 2" />
                  
                  <line x1="70" y1="10" x2="70" y2="85" stroke="#1e293b" strokeWidth="0.5" strokeDasharray="2 2" />
                  <line x1="110" y1="10" x2="110" y2="85" stroke="#1e293b" strokeWidth="0.5" strokeDasharray="2 2" />
                  <line x1="150" y1="10" x2="150" y2="85" stroke="#1e293b" strokeWidth="0.5" strokeDasharray="2 2" />
                  <line x1="190" y1="10" x2="190" y2="85" stroke="#1e293b" strokeWidth="0.5" strokeDasharray="2 2" />
                  <line x1="230" y1="10" x2="230" y2="85" stroke="#1e293b" strokeWidth="0.5" strokeDasharray="2 2" />

                  {/* Y-Axis Labels */}
                  <text x="24" y="23" textAnchor="end" className="text-[8px] fill-slate-500 font-bold">60m</text>
                  <text x="24" y="53" textAnchor="end" className="text-[8px] fill-slate-500 font-bold">30m</text>
                  <text x="24" y="83" textAnchor="end" className="text-[8px] fill-slate-500 font-bold">0m</text>

                  {/* X-Axis Labels */}
                  <text x="70" y="94" textAnchor="middle" className="text-[7.5px] fill-slate-600 font-bold">W1</text>
                  <text x="110" y="94" textAnchor="middle" className="text-[7.5px] fill-slate-600 font-bold">W2</text>
                  <text x="150" y="94" textAnchor="middle" className="text-[7.5px] fill-slate-600 font-bold">W3</text>
                  <text x="190" y="94" textAnchor="middle" className="text-[7.5px] fill-slate-600 font-bold">W4</text>
                  <text x="230" y="94" textAnchor="middle" className="text-[7.5px] fill-slate-600 font-bold">W5</text>

                  {/* Uptime Emerald Area & Curve */}
                  <path
                    d="M 30,68 C 70,55 110,48 150,32 C 190,26 230,18 270,15 L 270,80 L 30,80 Z"
                    fill="url(#mttr-emerald)"
                  />
                  <path
                    d="M 30,68 C 70,55 110,48 150,32 C 190,26 230,18 270,15"
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                  />
                  
                  {/* CFR/Incident Rate Dotted Line (Decreasing - Rose) */}
                  <path
                    d="M 30,35 Q 90,25 150,55 T 270,72"
                    fill="none"
                    stroke="#f43f5e"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                    strokeDasharray="2.5 2.5"
                  />
                  
                  {/* Legend guide dot */}
                  <circle cx="150" cy="32" r="2.5" fill="#10b981" />
                  <circle cx="150" cy="55" r="2" fill="#f43f5e" />

                  {/* Data Tooltip overlay */}
                  <g transform="translate(170, 5)">
                    <rect width="68" height="15" rx="3.5" fill="#0f172a" stroke="#065f46" strokeWidth="0.8" opacity="0.95" />
                    <text x="34" y="10.5" textAnchor="middle" className="text-[7.5px] fill-emerald-300 font-black font-sans">MTTR: 14.5m (Elite)</text>
                  </g>
                </svg>
              </div>
            </div>

          </div>
          
        </div>

        {/* FEATURE ROTATOR FOOTER - HELD ONLY ON DESKTOP (Borders removed) */}
        <div className="hidden lg:block max-w-md bg-slate-900/30 rounded-xl p-3.5 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[9px] font-black tracking-wider uppercase text-indigo-400">
              {slides[activeSlide].badge}
            </span>
            <div className="flex space-x-1">
              {slides.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveSlide(idx)}
                  className={`h-1 rounded-full transition-all duration-300 ${
                    idx === activeSlide ? 'w-3.5 bg-indigo-500' : 'w-1 bg-slate-800'
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>
          </div>
          <h4 className="text-xs font-bold text-white transition-opacity duration-300">
            {slides[activeSlide].title}
          </h4>
          <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed transition-opacity duration-300">
            {slides[activeSlide].description}
          </p>
        </div>

      </div>

      {/* RIGHT COLUMN: LOGIN FORM PANEL */}
      <div className="w-full lg:w-1/2 flex-shrink-0 min-w-0 flex flex-col justify-between p-5 sm:p-8 xl:p-12 relative z-10">
        
        {/* Placeholder element for flex spacing on desktop */}
        <div className="hidden lg:block"></div>

        {/* Centered Login Card */}
        <div className="my-auto mx-auto max-w-md w-full py-1.5 flex flex-col justify-center">
          
          <div className="bg-slate-900/40 backdrop-blur-2xl rounded-2xl p-5 sm:p-10 shadow-2xl shadow-slate-950/60 relative overflow-hidden">
            
            <div className="text-center mb-5 sm:mb-8 relative">
              <h1 className="text-2xl xl:text-3xl font-extrabold tracking-tight text-white mb-2 font-sans">Welcome Back</h1>
              <p className="text-slate-400 text-sm leading-relaxed">
                Unlock automated metrics and insights for your engineering ecosystem.
              </p>
            </div>

            {/* BUTTON GROUP */}
            <div className="space-y-4">
              <button
                onClick={handleLogin}
                className="w-full flex items-center justify-center space-x-3 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:via-purple-500 hover:to-pink-500 text-white font-extrabold py-3.5 px-6 rounded-xl shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/45 hover:scale-[1.01] transition-all duration-200 active:scale-[0.98] group cursor-pointer"
              >
                <svg className="w-5 h-5 fill-current text-white" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                </svg>
                <span>Sign In / Sign Up with GitHub</span>
                <ChevronRight size={16} className="text-indigo-200 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>

            {/* SECURE NOTICE */}
            <div className="mt-8 pt-6 border-t border-slate-800/40 flex items-center justify-center gap-2.5 text-xs text-slate-500">
              <Shield size={14} className="text-indigo-400" />
              <span>Secure authentication powered by GitHub OAuth</span>
            </div>
            
          </div>
          
          {/* Live system pulse */}
          <div className="mt-3 sm:mt-6 flex justify-center items-center gap-2">
            <div className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </div>
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
              Live System Operational
            </span>
          </div>

        </div>

        {/* FOOTER */}
        <div className="flex flex-wrap justify-between items-center gap-4 text-xs text-slate-500 border-t border-slate-900/60 pt-3 sm:pt-4">
          <p>© {new Date().getFullYear()} DevPulse. All rights reserved.</p>
          <div className="flex space-x-4">
            <a href="#" className="hover:text-slate-300 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-slate-300 transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-slate-300 transition-colors">Security</a>
          </div>
        </div>

      </div>

    </div>
  );
}
