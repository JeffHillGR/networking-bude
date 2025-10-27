import { useState } from 'react';
import { ExternalLink } from 'lucide-react';

function ConnectionCard({ user, matchScore, matchReasons, onConnect, onViewProfile }) {
  const [showBreakdown, setShowBreakdown] = useState(false);

  return (
    <div className="bg-white rounded-lg border-2 border-gray-200 p-6 hover:shadow-lg transition-all">
      {/* Profile Header */}
      <div className="flex gap-4 mb-4">
        <img
          src={user.photo}
          alt={user.name}
          className="w-20 h-20 rounded-full object-cover border-2 border-gray-200"
        />
        <div className="flex-1">
          <h3 className="font-bold text-xl text-gray-900">{user.name}</h3>
          <p className="text-sm text-gray-600 mt-1">{user.title}</p>
          <p className="text-sm text-gray-500">{user.company}</p>
        </div>
      </div>

      {/* Compatibility Score Badge - Prominent */}
      <div className="inline-flex items-center gap-3 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-500 px-5 py-3 rounded-xl mb-4 shadow-sm">
        <span className="text-3xl font-bold text-green-700">{matchScore}%</span>
        <div className="flex flex-col">
          <span className="text-sm font-bold text-green-700">Compatible</span>
          <span className="text-xs text-green-600">Great match!</span>
        </div>
      </div>

      {/* Match Reasons - Details */}
      <div className="mb-5">
        <h4 className="text-sm font-bold text-gray-800 mb-3">Why you match:</h4>
        <div className="space-y-2.5">
          {matchReasons.map((reason, idx) => (
            <div key={idx} className="flex items-start gap-3 text-sm bg-gray-50 p-3 rounded-lg">
              <span className="text-xl flex-shrink-0">{reason.icon}</span>
              <span className="text-gray-700 leading-relaxed">{reason.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={() => onViewProfile?.(user.id)}
          className="flex-1 border-2 border-black text-black px-4 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
        >
          View Profile
          <ExternalLink className="w-4 h-4" />
        </button>
        <button
          onClick={() => onConnect?.(user.id)}
          className="flex-1 bg-[#009900] text-white px-4 py-3 rounded-lg font-semibold hover:bg-[#007700] transition-colors border-2 border-[#D0ED00]"
        >
          Connect
        </button>
      </div>
    </div>
  );
}

export default ConnectionCard;
