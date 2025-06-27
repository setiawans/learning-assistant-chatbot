'use client';

import { useEffect, useRef } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

interface MathRendererProps {
  content: string;
  className?: string;
}

const MathRenderer = ({ content, className = '' }: MathRendererProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const processContent = (text: string) => {
      const blockMathRegex = /\$\$([\s\S]*?)\$\$/g;
      const inlineMathRegex = /\$((?!\$)[^\$]*?)\$/g;
      
      let processedContent = text;

      processedContent = processedContent.replace(blockMathRegex, (match, expression) => {
        try {
          const rendered = katex.renderToString(expression.trim(), {
            displayMode: true,
            throwOnError: false,
            errorColor: '#cc0000',
            strict: false,
            trust: false
          });
          return `<div class="katex-block">${rendered}</div>`;
        } catch (error) {
          console.warn('KaTeX rendering error for display math:', expression, error);
          return `<div class="katex-error">Math Error: ${expression}</div>`;
        }
      });

      processedContent = processedContent.replace(inlineMathRegex, (match, expression) => {
        try {
          const rendered = katex.renderToString(expression.trim(), {
            displayMode: false,
            throwOnError: false,
            errorColor: '#cc0000',
            strict: false,
            trust: false
          });
          return `<span class="katex-inline">${rendered}</span>`;
        } catch (error) {
          console.warn('KaTeX rendering error for inline math:', expression, error);
          return `<span class="katex-error">Math Error: ${expression}</span>`;
        }
      });

      processedContent = processedContent
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/`(.*?)`/g, '<code>$1</code>');

      return processedContent.replace(/\n/g, '<br>');
    };

    const processedHtml = processContent(content);
    containerRef.current.innerHTML = processedHtml;
  }, [content]);

  return (
    <div 
      ref={containerRef}
      className={`math-content ${className}`}
      style={{
        lineHeight: '1.6',
        wordBreak: 'break-word'
      }}
    />
  );
};

export default MathRenderer;