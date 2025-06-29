import React from "react";

export default function PollResults({ results, totalVotes }) {
  if (!results || Object.keys(results).length === 0) return null;

  return (
    <div>
      {Object.entries(results).map(([option, count], i) => {
        const percentage = totalVotes ? ((count / totalVotes) * 100).toFixed(1) : 0;
        return (
          <div key={i}>
            {option}: {count} votes ({percentage}%)
          </div>
        );
      })}
    </div>
  );
}
