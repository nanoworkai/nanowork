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
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
      <h3 className="text-gray-900 font-semibold text-lg mb-4 flex items-center gap-2">
        <span className="text-2xl">🔍</span>
        Site Analyzer
      </h3>

      <div className="flex gap-2 mb-4">
        <input
          value={url}
          onChange={e => setUrl(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleScrape()}
          placeholder="https://competitor.com"
          className="flex-1 bg-white border border-gray-300 text-gray-900 placeholder-gray-400
                     rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
        />
        <button
          onClick={handleScrape}
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white
                     font-semibold text-sm px-5 py-2.5 rounded-lg transition-all shadow-sm hover:shadow"
        >
          {loading ? '...' : 'Analyze'}
        </button>
      </div>

      {error && <p className="text-red-600 text-sm mb-3 font-medium">{error}</p>}

      {result && (
        <div className="space-y-4 text-sm">
          <div>
            <p className="text-gray-500 text-xs font-semibold uppercase tracking-wide mb-1.5">Title</p>
            <p className="text-gray-900 font-medium">{result.title}</p>
          </div>
          {result.description && (
            <div>
              <p className="text-gray-500 text-xs font-semibold uppercase tracking-wide mb-1.5">Description</p>
              <p className="text-gray-700">{result.description}</p>
            </div>
          )}
          {result.color_palette?.length > 0 && (
            <div>
              <p className="text-gray-500 text-xs font-semibold uppercase tracking-wide mb-2">Colors</p>
              <div className="flex gap-3 flex-wrap">
                {result.color_palette.map(color => (
                  <div key={color} className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg border-2 border-gray-300 shadow-sm"
                         style={{ background: color }}/>
                    <span className="text-gray-600 text-xs font-mono font-medium">{color}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {result.tech_stack?.length > 0 && (
            <div>
              <p className="text-gray-500 text-xs font-semibold uppercase tracking-wide mb-2">Tech Stack</p>
              <div className="flex flex-wrap gap-2">
                {result.tech_stack.map(tech => (
                  <span key={tech}
                    className="bg-blue-50 text-blue-700 text-xs font-medium px-3 py-1.5 rounded-lg border border-blue-200">
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
