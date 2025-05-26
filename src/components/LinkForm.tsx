'use client';

import { useState } from 'react';

export function LinkForm() {
  const [links, setLinks] = useState<string[]>(['']);
  const [isProcessing, setIsProcessing] = useState(false);

  const addLink = () => setLinks([...links, '']);

  const updateLink = (index: number, value: string) => {
    const newLinks = [...links];
    newLinks[index] = value;
    setLinks(newLinks);
  };

  const removeLink = (index: number) => {
    setLinks(links.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      const response = await fetch('/api/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ links: links.filter(Boolean) }),
      });

      if (!response.ok) throw new Error('Failed to process links');

      // Trigger digest refresh
      window.dispatchEvent(new CustomEvent('refreshDigest'));
    } catch (error) {
      console.error('Error processing links:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        {links.map((link, index) => (
          <div key={index} className="flex gap-2">
            <input
              type="url"
              value={link}
              onChange={(e) => updateLink(index, e.target.value)}
              placeholder="Enter URL"
              className="flex-1 px-3 py-2 border rounded"
              required
            />
            {links.length > 1 && (
              <button
                type="button"
                onClick={() => removeLink(index)}
                className="px-3 py-2 text-red-500 hover:text-red-700"
              >
                Remove
              </button>
            )}
          </div>
        ))}
      </div>

      <div className="flex gap-4">
        <button
          type="button"
          onClick={addLink}
          className="px-4 py-2 text-sm text-blue-500 hover:text-blue-700"
        >
          + Add another link
        </button>

        <button
          type="submit"
          disabled={isProcessing}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {isProcessing ? 'Processing...' : 'Process Links'}
        </button>
      </div>
    </form>
  );
}
