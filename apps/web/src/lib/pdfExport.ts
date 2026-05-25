/**
 * PDF Export Utilities for Pitch Decks
 *
 * This module provides functionality to export pitch decks to PDF format.
 * For now, it uses browser print capabilities. In production, you could integrate:
 * - jsPDF for client-side PDF generation
 * - Puppeteer/Playwright for server-side rendering
 * - Cloudflare Browser Rendering API
 */

interface SlideContent {
  type: string;
  title: string;
  content: string;
  bullets?: string[];
  data?: Record<string, any>;
  notes?: string;
}

interface PitchDeck {
  id: string;
  companyName: string;
  tagline: string;
  slides: SlideContent[];
  template: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Generate HTML for print/PDF export
 */
export function generatePrintHTML(deck: PitchDeck): string {
  const templateStyles = getTemplateStyles(deck.template);

  const slidesHTML = deck.slides.map((slide, index) => {
    return `
      <div class="slide ${templateStyles.slideClass}" style="page-break-after: always;">
        ${renderSlide(slide, index, templateStyles)}
      </div>
    `;
  }).join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${deck.companyName} - Pitch Deck</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        @page {
          size: 1920px 1080px;
          margin: 0;
        }

        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          line-height: 1.6;
        }

        .slide {
          width: 1920px;
          height: 1080px;
          padding: 80px;
          display: flex;
          flex-direction: column;
          position: relative;
        }

        /* Template styles */
        .yc {
          background: white;
          color: #000;
        }

        .sequoia {
          background: linear-gradient(135deg, #1a1a1a 0%, #000 100%);
          color: white;
        }

        .modern {
          background: #fafafa;
          color: #1a1a1a;
        }

        .corporate {
          background: white;
          color: #333;
          border: 8px solid #e5e5e5;
        }

        h1 {
          font-size: 96px;
          font-weight: 700;
          margin-bottom: 40px;
          line-height: 1.1;
        }

        h2 {
          font-size: 72px;
          font-weight: 700;
          margin-bottom: 60px;
          line-height: 1.2;
        }

        .content {
          font-size: 36px;
          margin-bottom: 40px;
          opacity: 0.85;
        }

        .bullets {
          list-style: none;
          padding-left: 0;
        }

        .bullets li {
          font-size: 32px;
          margin-bottom: 24px;
          padding-left: 40px;
          position: relative;
        }

        .bullets li:before {
          content: "•";
          position: absolute;
          left: 0;
          opacity: 0.5;
        }

        .data-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 40px;
          margin-top: 40px;
        }

        .data-item {
          text-align: center;
        }

        .data-value {
          font-size: 64px;
          font-weight: 700;
          margin-bottom: 16px;
        }

        .data-label {
          font-size: 24px;
          text-transform: uppercase;
          opacity: 0.6;
          letter-spacing: 2px;
        }

        .cover {
          align-items: center;
          justify-content: center;
          text-align: center;
        }

        .cover h1 {
          font-size: 120px;
          margin-bottom: 60px;
        }

        .cover .content {
          font-size: 48px;
        }

        .slide-number {
          position: absolute;
          bottom: 40px;
          right: 80px;
          font-size: 24px;
          opacity: 0.3;
        }
      </style>
    </head>
    <body>
      ${slidesHTML}
    </body>
    </html>
  `;
}

function getTemplateStyles(template: string) {
  const templates: Record<string, { slideClass: string }> = {
    yc: { slideClass: 'yc' },
    sequoia: { slideClass: 'sequoia' },
    modern: { slideClass: 'modern' },
    corporate: { slideClass: 'corporate' },
  };

  return templates[template] || templates.yc;
}

function renderSlide(slide: SlideContent, index: number, templateStyles: any): string {
  if (slide.type === 'cover') {
    return `
      <div class="cover">
        <h1>${escapeHtml(slide.title)}</h1>
        <div class="content">${escapeHtml(slide.content)}</div>
      </div>
    `;
  }

  let bulletsHTML = '';
  if (slide.bullets && slide.bullets.length > 0) {
    bulletsHTML = `
      <ul class="bullets">
        ${slide.bullets.map(bullet => `<li>${escapeHtml(bullet)}</li>`).join('')}
      </ul>
    `;
  }

  let dataHTML = '';
  if (slide.data && Object.keys(slide.data).length > 0) {
    dataHTML = `
      <div class="data-grid">
        ${Object.entries(slide.data).map(([key, value]) => `
          <div class="data-item">
            <div class="data-value">${escapeHtml(String(value))}</div>
            <div class="data-label">${escapeHtml(key)}</div>
          </div>
        `).join('')}
      </div>
    `;
  }

  return `
    <h2>${escapeHtml(slide.title)}</h2>
    <div style="flex: 1;">
      <div class="content">${escapeHtml(slide.content)}</div>
      ${bulletsHTML}
      ${dataHTML}
    </div>
    <div class="slide-number">${index + 1}</div>
  `;
}

function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Export deck to PDF using browser print
 */
export function exportToPDF(deck: PitchDeck): void {
  const printHTML = generatePrintHTML(deck);

  // Open print preview in new window
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Please allow popups to export PDF');
    return;
  }

  printWindow.document.write(printHTML);
  printWindow.document.close();

  // Wait for content to load, then trigger print
  printWindow.addEventListener('load', () => {
    setTimeout(() => {
      printWindow.print();
    }, 500);
  });
}

/**
 * Export deck data as JSON (for saving/loading)
 */
export function exportToJSON(deck: PitchDeck): string {
  return JSON.stringify(deck, null, 2);
}

/**
 * Download deck as JSON file
 */
export function downloadJSON(deck: PitchDeck): void {
  const json = exportToJSON(deck);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${deck.companyName.replace(/\s+/g, '-').toLowerCase()}-pitch-deck.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Generate PowerPoint-style markdown export
 * Can be imported into tools like Deckset, Marp, or reveal.js
 */
export function exportToMarkdown(deck: PitchDeck): string {
  let markdown = `# ${deck.companyName}\n\n${deck.tagline}\n\n---\n\n`;

  deck.slides.forEach((slide, index) => {
    if (index > 0) markdown += '\n---\n\n';

    markdown += `## ${slide.title}\n\n`;
    markdown += `${slide.content}\n\n`;

    if (slide.bullets && slide.bullets.length > 0) {
      slide.bullets.forEach(bullet => {
        markdown += `- ${bullet}\n`;
      });
      markdown += '\n';
    }

    if (slide.data && Object.keys(slide.data).length > 0) {
      markdown += '\n';
      Object.entries(slide.data).forEach(([key, value]) => {
        markdown += `**${key}**: ${value}  \n`;
      });
    }
  });

  return markdown;
}

/**
 * Download deck as Markdown file
 */
export function downloadMarkdown(deck: PitchDeck): void {
  const markdown = exportToMarkdown(deck);
  const blob = new Blob([markdown], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${deck.companyName.replace(/\s+/g, '-').toLowerCase()}-pitch-deck.md`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
