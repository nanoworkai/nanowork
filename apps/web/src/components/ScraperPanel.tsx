import { useState } from 'react'
import { scrapeUrl, type ScrapeResult } from '../lib/scraper'

export default function ScraperPanel() {
  const [url, setUrl]         = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult]   = useState<ScrapeResult | null>(null)
  const [error, setError]     = useState('')

  async function handleScrape() {
    if (!url.trim()) return
    setLoading(true)
    setError('')
    try {
      const data = await scrapeUrl(url)
      setResult(data)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
      <h3 className="text-white font-bold mb-4 flex items-center gap-2">
        🔍 Site Analyzer
      </h3>

      <div className="flex gap-2 mb-4">
        <input
          value={url}
          onChange={e => setUrl(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleScrape()}
          placeholder="https://competitor.com"
          className="flex-1 bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-500
                     rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-violet-500"
        />
        <button
          onClick={handleScrape}
          disabled={loading}
          className="bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white
                     font-bold text-sm px-4 py-2.5 rounded-xl transition-colors"
        >
          {loading ? '...' : 'Analyze'}
        </button>
      </div>

      {error && <p className="text-red-400 text-xs mb-3">{error}</p>}

      {result && (
        <div className="space-y-3 text-sm">
          <div>
            <p className="text-zinc-400 text-xs uppercase tracking-widest mb-1">Title</p>
            <p className="text-white font-medium">{result.title}</p>
          </div>
          {result.description && (
            <div>
              <p className="text-zinc-400 text-xs uppercase tracking-widest mb-1">Description</p>
              <p className="text-zinc-300">{result.description}</p>
            </div>
          )}
          {result.color_palette?.length > 0 && (
            <div>
              <p className="text-zinc-400 text-xs uppercase tracking-widest mb-2">Colors</p>
              <div className="flex gap-2">
                {result.color_palette.map(color => (
                  <div key={color} className="flex items-center gap-1.5">
                    <div className="w-5 h-5 rounded-md border border-zinc-700"
                         style={{ background: color }}/>
                    <span className="text-zinc-400 text-xs font-mono">{color}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {result.tech_stack?.length > 0 && (
            <div>
              <p className="text-zinc-400 text-xs uppercase tracking-widest mb-2">Tech Stack</p>
              <div className="flex flex-wrap gap-2">
                {result.tech_stack.map(tech => (
                  <span key={tech}
                    className="bg-zinc-800 text-zinc-300 text-xs px-2 py-1 rounded-lg">
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
