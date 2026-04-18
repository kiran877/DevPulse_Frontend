import React from 'react';
import { Code } from 'lucide-react';

const RepoSelector = ({ repos, selectedRepo, onSelect }) => {
  return (
    <div className="flex items-center space-x-3 bg-white p-2 rounded-lg border border-gray-200 shadow-sm">
      <div className="bg-gray-900 p-2 rounded-md text-white">
        <Code size={20} />
      </div>
      <select
        value={selectedRepo}
        onChange={(e) => onSelect(e.target.value)}
        className="bg-transparent border-none focus:ring-0 text-sm font-semibold text-gray-700 min-w-[200px] cursor-pointer"
      >
        <option value="" disabled>Select a repository</option>
        {repos.map((repo) => (
          <option key={repo.id} value={repo.fullName}>
            {repo.fullName}
          </option>
        ))}
      </select>
    </div>
  );
};

export default RepoSelector;
