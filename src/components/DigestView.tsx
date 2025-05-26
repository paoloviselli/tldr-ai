'use client';

import { useState, useEffect } from 'react';

interface DigestItem {
  url: string;
  sim: number;
  summary: {
    summary: string;
    bullets: string[];
  };
}

export function DigestView() {
  const [items, setItems] = useState<DigestItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDigest = async () => {
    try {
      const response = await fetch('/api/digest');
      if (!response.ok) throw new Error('Failed to fetch digest');
      const data = await response.json();
      setItems(data);
    } catch (error) {
      console.error('Error fetching digest:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDigest();

    // Listen for refresh events
    const handleRefresh = () => {
      setIsLoading(true);
      fetchDigest();
    };

    window.addEventListener('refreshDigest', handleRefresh);
    return () => window.removeEventListener('refreshDigest', handleRefresh);
  }, []);

  if (isLoading) {
    return <div className="text-center py-8">Loading digest...</div>;
  }

  if (!items.length) {
    return (
      <div className="text-center py-8 text-gray-500">
        No items in digest yet
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Your Digest</h2>
      {items.map((item, index) => (
        <div key={item.url} className="border rounded-lg p-4 space-y-3">
          <div className="flex justify-between items-start">
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline"
            >
              {item.url}
            </a>
            <span className="text-sm text-gray-500">
              {(item.sim * 100).toFixed(0)}% match
            </span>
          </div>

          <p className="text-gray-700">{item.summary.summary}</p>

          {item.summary.bullets?.length > 0 && (
            <ul className="list-disc list-inside space-y-1 text-gray-600">
              {item.summary.bullets.map((bullet, i) => (
                <li key={i}>{bullet}</li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </div>
  );
}
