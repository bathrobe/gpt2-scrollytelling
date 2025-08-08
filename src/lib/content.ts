import fs from 'fs';
import path from 'path';
import { marked } from 'marked';

const contentRoot = path.join(process.cwd(), 'content');

export function loadStoryManifest(): any {
  const manifestPath = path.join(contentRoot, 'story.json');
  const manifestContent = fs.readFileSync(manifestPath, 'utf-8');
  return JSON.parse(manifestContent);
}

export function loadMarkdownFile(relativePath: string): { raw: string; html: string } {
  const fullPath = path.join(contentRoot, relativePath.startsWith('/') ? relativePath.slice(1) : relativePath);
  const raw = fs.readFileSync(fullPath, 'utf-8');
  const html = marked.parse(raw) as string;
  return { raw, html };
}

export function loadCodeFile(relativePath: string): string {
  const fullPath = path.join(contentRoot, relativePath.startsWith('/') ? relativePath.slice(1) : relativePath);
  return fs.readFileSync(fullPath, 'utf-8');
}

export function parseHighlightRange(rangeString: string): [number, number] {
  const [startStr, endStr] = rangeString.split('-');
  const start = parseInt(startStr, 10);
  const end = parseInt(endStr, 10);
  return [start, end];
}

export function loadStoryData(): any[] {
  const manifest = loadStoryManifest();
  
  return manifest.map((step: any) => {
    const proseData = loadMarkdownFile(step.prosePath);
    const codeContent = loadCodeFile(step.codePane.filePath);
    const highlightRange = parseHighlightRange(step.codePane.highlight);
    
    return {
      ...step,
      proseHtml: proseData.html,
      proseRaw: proseData.raw,
      codeContent,
      highlightRange
    };
  });
}