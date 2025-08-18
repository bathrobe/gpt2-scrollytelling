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
  if (!rangeString || rangeString.trim() === '') {
    return [0, 0]; // No highlighting when range is empty
  }
  const [startStr, endStr] = rangeString.split('-');
  const start = parseInt(startStr, 10);
  const end = parseInt(endStr, 10);
  
  // Validate that we got valid numbers
  if (isNaN(start) || isNaN(end)) {
    return [0, 0];
  }
  
  return [start, end];
}

export function loadStoryData(): any[] {
  const manifest = loadStoryManifest();
  
  return manifest.map((step: any) => {
    const proseData = loadMarkdownFile(step.prosePath);
    const codeContent = loadCodeFile(step.codePane.filePath);
    const highlightRange = parseHighlightRange(step.codePane.highlight);
    
    // Load speedup data for the speed visualization
    if (step.id === 'speed') {
      const speedupDataPath = path.join(contentRoot, 'speedups.txt');
      const speedupData = fs.readFileSync(speedupDataPath, 'utf-8');
      step.visualPane.props.data = speedupData;
    }
    
    return {
      ...step,
      proseHtml: proseData.html,
      proseRaw: proseData.raw,
      codeContent,
      highlightRange
    };
  });
}