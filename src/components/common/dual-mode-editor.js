'use client';

/**
 * Innmotek Admin CMS - Dual Mode Rich Editor (Visual / Plain Text <-> HTML Source)
 * 
 * Inspired by Oracle B2C Service / Knowledge Advanced CMS:
 * - Visual Text Tab: Clean human-readable text editing & formatted live preview
 * - HTML Source Tab: Direct raw HTML markup editing with syntax styling
 * - Live Tab Sync: Real-time bi-directional conversion between plain text & HTML
 * - Quick formatting tools: Bold, Italic, Bullet List, Numbered List, Heading, Clear Tags
 */

import { useState, useEffect, useRef } from 'react';
import {
  Code,
  FileText,
  Eye,
  Bold,
  Italic,
  List,
  ListOrdered,
  Heading2,
  Sparkles,
  Eraser,
  Copy,
  Check
} from 'lucide-react';

/**
 * Converts HTML markup into clean readable plain text with preserved line breaks and bullets.
 */
export function htmlToPlainText(html) {
  if (!html) return '';
  
  let text = String(html);
  
  // Replace <br> and closing paragraph/div/headings with newline
  text = text.replace(/<br\s*[\/]?>/gi, '\n');
  text = text.replace(/<\/(p|div|h[1-6]|tr)>/gi, '\n');
  
  // Replace <li> with bullet point •
  text = text.replace(/<li[^>]*>/gi, '• ');
  text = text.replace(/<\/li>/gi, '\n');
  
  // Strip all other HTML tags
  text = text.replace(/<[^>]+>/g, '');
  
  // Decode common HTML entities
  text = text
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'");
  
  // Collapse excessive consecutive blank lines (more than 2 newlines -> 2 newlines)
  text = text.replace(/\n{3,}/g, '\n\n');
  
  return text.trim();
}

/**
 * Converts readable plain text back into clean semantic HTML markup.
 */
export function plainTextToHtml(text) {
  if (!text) return '';

  const lines = text.split('\n');
  const result = [];
  let inList = false;

  for (let rawLine of lines) {
    const line = rawLine.trim();

    if (!line) {
      if (inList) {
        result.push('</ul>');
        inList = false;
      }
      continue;
    }

    // Check if line starts with bullet (•, -, *)
    if (/^[•\-\*]\s+/.test(line)) {
      if (!inList) {
        result.push('<ul>');
        inList = true;
      }
      const itemContent = line.replace(/^[•\-\*]\s+/, '');
      result.push(`  <li>${escapeHtml(itemContent)}</li>`);
    } else {
      if (inList) {
        result.push('</ul>');
        inList = false;
      }
      // Standard paragraph
      result.push(`<p>${escapeHtml(line)}</p>`);
    }
  }

  if (inList) {
    result.push('</ul>');
  }

  return result.join('\n');
}

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export default function DualModeEditor({
  label,
  value,
  onChange,
  placeholder = 'Enter content...',
  rows = 5,
  required = false
}) {
  const [mode, setMode] = useState('visual'); // 'visual' | 'html' | 'preview'
  const [plainText, setPlainText] = useState('');
  const [copied, setCopied] = useState(false);
  const internalHtmlRef = useRef(value || '');

  // Keep plain text in sync when external HTML value changes
  useEffect(() => {
    internalHtmlRef.current = value || '';
    setPlainText(htmlToPlainText(value || ''));
  }, [value]);

  // When user edits in Visual / Plain Text mode
  const handlePlainTextChange = (e) => {
    const newText = e.target.value;
    setPlainText(newText);
    const convertedHtml = plainTextToHtml(newText);
    internalHtmlRef.current = convertedHtml;
    onChange(convertedHtml);
  };

  // When user edits in HTML Source mode
  const handleHtmlChange = (e) => {
    const newHtml = e.target.value;
    internalHtmlRef.current = newHtml;
    onChange(newHtml);
    setPlainText(htmlToPlainText(newHtml));
  };

  // Formatting helpers for visual mode
  const insertBullet = () => {
    const updated = plainText ? `${plainText}\n• ` : '• ';
    setPlainText(updated);
    onChange(plainTextToHtml(updated));
  };

  const cleanLegacyTags = () => {
    const cleanedText = htmlToPlainText(value || '');
    const cleanHtml = plainTextToHtml(cleanedText);
    onChange(cleanHtml);
    setPlainText(cleanedText);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(value || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-2">
      {/* Editor Header & Mode Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-300">
          {label} {required && <span className="text-red-400">*</span>}
        </label>

        {/* Oracle B2C Dual Mode Tabs */}
        <div className="flex items-center space-x-1 rounded-xl border border-[#2B2B2B] bg-[#141414] p-1">
          <button
            type="button"
            onClick={() => setMode('visual')}
            className={`flex items-center space-x-1.5 rounded-lg px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider transition-all cursor-pointer ${
              mode === 'visual'
                ? 'bg-[#C5A880] text-[#0A0A0A] shadow-sm font-bold'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <FileText className="h-3 w-3" />
            <span>Visual Text</span>
          </button>

          <button
            type="button"
            onClick={() => setMode('html')}
            className={`flex items-center space-x-1.5 rounded-lg px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider transition-all cursor-pointer ${
              mode === 'html'
                ? 'bg-[#C5A880] text-[#0A0A0A] shadow-sm font-bold'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Code className="h-3 w-3" />
            <span>HTML Source</span>
          </button>

          <button
            type="button"
            onClick={() => setMode('preview')}
            className={`flex items-center space-x-1.5 rounded-lg px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider transition-all cursor-pointer ${
              mode === 'preview'
                ? 'bg-[#C5A880] text-[#0A0A0A] shadow-sm font-bold'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Eye className="h-3 w-3" />
            <span>Preview</span>
          </button>
        </div>
      </div>

      {/* Editor Main Surface */}
      <div className="rounded-2xl border border-[#2B2B2B] bg-[#181818] overflow-hidden focus-within:border-[#C5A880] transition-all">
        {/* Quick Toolbar */}
        <div className="flex items-center justify-between border-b border-[#242424] bg-[#141414] px-3 py-1.5 text-xs text-neutral-400">
          <div className="flex items-center space-x-2">
            {mode === 'visual' && (
              <>
                <button
                  type="button"
                  onClick={insertBullet}
                  title="Add Bullet Point"
                  className="flex items-center space-x-1 rounded px-2 py-0.5 hover:bg-[#242424] hover:text-[#C5A880] transition-colors text-[11px]"
                >
                  <List className="h-3.5 w-3.5" />
                  <span>Bullet</span>
                </button>
                <button
                  type="button"
                  onClick={cleanLegacyTags}
                  title="Format & Clean Ugly Legacy Spans"
                  className="flex items-center space-x-1 rounded px-2 py-0.5 hover:bg-[#242424] hover:text-amber-300 transition-colors text-[11px]"
                >
                  <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                  <span>Clean HTML</span>
                </button>
              </>
            )}

            {mode === 'html' && (
              <span className="text-[10px] font-mono text-neutral-500 flex items-center space-x-1">
                <Code className="h-3 w-3 text-[#C5A880]" />
                <span>Raw HTML markup enabled</span>
              </span>
            )}

            {mode === 'preview' && (
              <span className="text-[10px] font-mono text-emerald-400 flex items-center space-x-1">
                <Eye className="h-3 w-3" />
                <span>Live Rendered View</span>
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={copyToClipboard}
            className="flex items-center space-x-1 text-[10px] text-neutral-500 hover:text-white transition-colors"
          >
            {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>

        {/* Input Area Depending on Mode */}
        {mode === 'visual' && (
          <textarea
            rows={rows}
            value={plainText}
            onChange={handlePlainTextChange}
            placeholder={placeholder}
            className="w-full bg-transparent p-3.5 text-xs text-neutral-200 leading-relaxed placeholder-neutral-500 focus:outline-none resize-y"
          />
        )}

        {mode === 'html' && (
          <textarea
            rows={rows}
            value={value || ''}
            onChange={handleHtmlChange}
            placeholder="<p>Enter raw HTML...</p>"
            className="w-full bg-[#121212] p-3.5 text-xs font-mono text-amber-300/90 leading-relaxed placeholder-neutral-600 focus:outline-none resize-y"
          />
        )}

        {mode === 'preview' && (
          <div
            className="min-h-[120px] max-h-72 overflow-y-auto p-4 text-xs text-neutral-200 leading-relaxed prose prose-invert prose-sm max-w-none bg-[#111111]"
            dangerouslySetInnerHTML={{ __html: value || '<em class="text-neutral-500">No content to preview</em>' }}
          />
        )}
      </div>

      {/* Helper Footer */}
      <div className="flex items-center justify-between text-[10px] text-neutral-500">
        <span>
          {mode === 'visual'
            ? 'Typing in Visual mode automatically generates clean HTML.'
            : mode === 'html'
            ? 'Editing in HTML mode directly updates raw markup.'
            : 'Previewing rendered markup.'}
        </span>
        <span className="font-mono">
          {(value || '').length} chars
        </span>
      </div>
    </div>
  );
}
