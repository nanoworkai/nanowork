/**
 * Slash Command Demo Component
 *
 * Demonstrates how to use the Slash Command SDK
 * Similar to Claude Code's SDK usage patterns
 */

import React, { useState } from 'react';
import { useSlashCommands, query } from '../lib/slashCommandSDK';

export function SlashCommandDemo() {
  const { commands, loading, execute, parse } = useSlashCommands();
  const [input, setInput] = useState('');
  const [results, setResults] = useState<any[]>([]);

  const handleExecute = async () => {
    if (!input.trim()) return;

    // Parse the input
    const parsed = await parse(input);

    if (parsed.isSlashCommand && parsed.command) {
      // Execute the command
      const result = await execute(parsed.command, parsed.args || []);
      setResults((prev) => [...prev, result]);
    } else {
      // Use the query API for regular prompts
      const messages: any[] = [];
      for await (const message of query({
        prompt: input,
        options: { maxTurns: 1 },
      })) {
        messages.push(message);
      }
      setResults((prev) => [...prev, ...messages]);
    }

    setInput('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleExecute();
    }
  };

  return (
    <div className="slash-command-demo">
      <div className="header">
        <h2>Slash Command SDK Demo</h2>
        <p>Type a slash command like /refactor or /test to execute</p>
      </div>

      {loading ? (
        <div className="loading">Loading commands...</div>
      ) : (
        <div className="commands-list">
          <h3>Available Commands ({commands.length})</h3>
          <ul>
            {commands.map((cmd) => (
              <li key={cmd.name}>
                <strong>/{cmd.name}</strong>
                {cmd.namespace && <span className="namespace">({cmd.namespace})</span>}
                {cmd.description && <span className="description"> - {cmd.description}</span>}
                {cmd.argumentHint && (
                  <span className="hint"> {cmd.argumentHint}</span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="input-section">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Enter a command or prompt..."
          rows={3}
        />
        <button onClick={handleExecute} disabled={!input.trim()}>
          Execute
        </button>
      </div>

      <div className="results">
        <h3>Results</h3>
        {results.length === 0 ? (
          <p className="empty">No results yet. Try executing a command!</p>
        ) : (
          <div className="results-list">
            {results.map((result, index) => (
              <div key={index} className="result-item">
                <div className="result-header">
                  <span className="type">{result.type}</span>
                  {result.subtype && (
                    <span className="subtype">{result.subtype}</span>
                  )}
                  {result.command && (
                    <span className="command">/{result.command}</span>
                  )}
                  <span className="timestamp">{result.timestamp}</span>
                </div>
                <div className="result-content">
                  {result.error ? (
                    <div className="error">{result.error}</div>
                  ) : result.result ? (
                    <pre>{JSON.stringify(result.result, null, 2)}</pre>
                  ) : result.message ? (
                    <div>{result.message}</div>
                  ) : (
                    <div className="empty">No content</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`
        .slash-command-demo {
          padding: 2rem;
          max-width: 1200px;
          margin: 0 auto;
        }

        .header {
          margin-bottom: 2rem;
        }

        .header h2 {
          margin: 0 0 0.5rem 0;
          font-size: 1.5rem;
        }

        .header p {
          margin: 0;
          color: #666;
        }

        .loading {
          padding: 1rem;
          text-align: center;
          color: #666;
        }

        .commands-list {
          background: #f5f5f5;
          padding: 1rem;
          border-radius: 8px;
          margin-bottom: 2rem;
        }

        .commands-list h3 {
          margin: 0 0 1rem 0;
          font-size: 1.1rem;
        }

        .commands-list ul {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .commands-list li {
          padding: 0.5rem 0;
          border-bottom: 1px solid #ddd;
        }

        .commands-list li:last-child {
          border-bottom: none;
        }

        .namespace {
          color: #999;
          font-size: 0.9rem;
          margin-left: 0.5rem;
        }

        .description {
          color: #666;
        }

        .hint {
          color: #999;
          font-style: italic;
        }

        .input-section {
          margin-bottom: 2rem;
        }

        .input-section textarea {
          width: 100%;
          padding: 0.75rem;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-family: monospace;
          font-size: 0.95rem;
          resize: vertical;
          margin-bottom: 0.5rem;
        }

        .input-section button {
          padding: 0.75rem 1.5rem;
          background: #007bff;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 1rem;
        }

        .input-section button:hover {
          background: #0056b3;
        }

        .input-section button:disabled {
          background: #ccc;
          cursor: not-allowed;
        }

        .results h3 {
          margin: 0 0 1rem 0;
          font-size: 1.1rem;
        }

        .empty {
          color: #999;
          font-style: italic;
        }

        .results-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .result-item {
          background: white;
          border: 1px solid #ddd;
          border-radius: 8px;
          overflow: hidden;
        }

        .result-header {
          background: #f8f9fa;
          padding: 0.75rem 1rem;
          display: flex;
          gap: 1rem;
          align-items: center;
          border-bottom: 1px solid #ddd;
        }

        .type {
          font-weight: bold;
          color: #007bff;
        }

        .subtype {
          padding: 0.25rem 0.5rem;
          background: #e9ecef;
          border-radius: 4px;
          font-size: 0.85rem;
        }

        .command {
          font-family: monospace;
          background: #fff3cd;
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
        }

        .timestamp {
          margin-left: auto;
          font-size: 0.85rem;
          color: #999;
        }

        .result-content {
          padding: 1rem;
        }

        .result-content pre {
          background: #f8f9fa;
          padding: 1rem;
          border-radius: 4px;
          overflow-x: auto;
          margin: 0;
        }

        .error {
          color: #dc3545;
          padding: 0.5rem;
          background: #f8d7da;
          border-radius: 4px;
        }
      `}</style>
    </div>
  );
}
