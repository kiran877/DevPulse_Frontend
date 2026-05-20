import React from 'react';
import { Code } from 'lucide-react';

const RepoSelector = ({ repos, selectedRepo, onSelect }) => {
  return (
    <div className="flex items-center space-x-3 bg-slate-900/60 backdrop-blur-md p-2 rounded-xl border-none shadow-xl">
      <div className="bg-slate-950 p-2 rounded-lg text-emerald-400">
        <Code size={20} />
      </div>
      <select
        value={selectedRepo}
        onChange={(e) => onSelect(e.target.value)}
        className="bg-transparent border-none focus:ring-0 text-sm font-semibold text-slate-200 min-w-[200px] cursor-pointer outline-none"
      >
        <option value="" disabled className="bg-slate-900 text-slate-400">Select a repository</option>
        {repos.map((repo) => (
          <option key={repo.id} value={repo.fullName} className="bg-slate-900 text-slate-200">
            {repo.fullName}
          </option>
        ))}
      </select>
    </div>
  );
};

export default RepoSelector;
