import React, { useMemo } from "react";
import directions from "../directions";

export default function Directions({ from, to, setFrom, setTo, showDirections, setShowDirections }) {
  // safe defaults to avoid runtime errors if props are missing
  setFrom = setFrom || (()=>{});
  setTo = setTo || (()=>{});
  setShowDirections = setShowDirections || (()=>{});
  showDirections = !!showDirections;
  const places = Object.keys(directions);

  // compute steps
  const steps = useMemo(() => {
    if (!from || !to || from === to) return [];
    const map = directions[from] || {};
    return map[to] || [];
  }, [from, to]);

  return (
    <div className="min-h-screen flex flex-col px-4 py-6 md:px-6 bg-gray-50">
      <div className="flex flex-col gap-6 max-w-4xl mx-auto w-full">
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-md">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Get Directions</h2>
          <p className="text-gray-600 text-sm mb-6">Choose your current location and destination.</p>

          {/* Selection controls */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-2">From</label>
              <select 
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                value={from} 
                onChange={(e) => setFrom(e.target.value)}
              >
                {places.map((p) => (
                  <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-2">To</label>
              <select 
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                value={to} 
                onChange={(e) => setTo(e.target.value)}
              >
                {places.map((p) => (
                  <option key={p} value={p} disabled={p === from}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <button 
                className="w-full px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                onClick={() => setShowDirections(true)}
              >
                Show Directions
              </button>
            </div>
          </div>

          {/* Directions display */}
          <div className="border-t border-gray-200 pt-6">
            {!showDirections ? (
              <p className="text-gray-500 text-sm">Click "Show Directions" to view step-by-step guidance.</p>
            ) : from === to ? (
              <p className="text-gray-500 text-sm">Choose a different destination.</p>
            ) : steps.length === 0 ? (
              <p className="text-gray-500 text-sm">No directions available for this route.</p>
            ) : (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Directions: {from.charAt(0).toUpperCase() + from.slice(1)} → {to.charAt(0).toUpperCase() + to.slice(1)}
                </h3>
                <ol className="space-y-3 list-decimal list-inside">
                  {steps.map((s, i) => (
                    <li key={i} className="text-gray-700 text-sm leading-relaxed">
                      {s}
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
