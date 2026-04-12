'use client';

import React from 'react';

interface MarkdownProps {
  text: string | undefined | null;
  className?: string;
}

export function Markdown({ text, className = '' }: MarkdownProps) {
  if (!text) return null;

  const lines = text.split('\n');
  const elements: React.ReactNode[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // H3 headers
    if (line.startsWith('### ')) {
      elements.push(
        <h3 key={i} className="text-base font-bold text-ls-text mt-4 mb-2 first:mt-0">
          {renderInline(line.slice(4))}
        </h3>
      );
      continue;
    }

    // H2 headers
    if (line.startsWith('## ')) {
      elements.push(
        <h2 key={i} className="text-lg font-bold text-ls-text mt-4 mb-2 first:mt-0">
          {renderInline(line.slice(3))}
        </h2>
      );
      continue;
    }

    // Numbered list items
    if (/^\d+\.\s/.test(line)) {
      const content = line.replace(/^\d+\.\s/, '');
      elements.push(
        <div key={i} className="flex gap-2 ml-1 mb-1">
          <span className="text-ls-text-secondary flex-shrink-0">{line.match(/^\d+/)?.[0]}.</span>
          <span>{renderInline(content)}</span>
        </div>
      );
      continue;
    }

    // Bullet list items
    if (line.startsWith('- ') || line.startsWith('* ')) {
      elements.push(
        <div key={i} className="flex gap-2 ml-1 mb-1">
          <span className="text-ls-text-secondary flex-shrink-0">•</span>
          <span>{renderInline(line.slice(2))}</span>
        </div>
      );
      continue;
    }

    // Empty line = paragraph break
    if (line.trim() === '') {
      elements.push(<div key={i} className="h-2" />);
      continue;
    }

    // Regular text
    elements.push(
      <p key={i} className="mb-1">
        {renderInline(line)}
      </p>
    );
  }

  return (
    <div className={`text-sm text-ls-text-secondary leading-relaxed ${className}`}>
      {elements}
    </div>
  );
}

function renderInline(text: string): React.ReactNode[] {
  // Handle **bold** markers
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={i} className="text-ls-text font-semibold">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return <React.Fragment key={i}>{part}</React.Fragment>;
  });
}
