# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A TypeScript-based scrollytelling application built with Next.js that synchronizes narrative content with code and visual displays. The app presents technical content through a three-pane layout where scrolling through narrative prose triggers updates in code and visual panes.

## Development Commands

```bash
# Install dependencies (prefer pnpm per user preference)
pnpm install

# Run development server with Turbopack
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start

# Lint the codebase
pnpm lint
```

## Architecture

### Core Structure
- **Server Component**: `src/app/page.tsx` loads story data at build time
- **Client Wrapper**: `ScrollyClient` manages scroll state and synchronization
- **Scroll Engine**: Uses `react-scrollama` for scroll-triggered events
- **Static Generation**: All content loaded at build time from filesystem

### Key Components

1. **ScrollyClient** (`src/components/ScrollyClient.tsx`): Main client component that:
   - Manages `activeStepId` state
   - Handles scroll events via Scrollama
   - Coordinates updates to visual and code panes

2. **VisualPane** (`src/components/VisualPane.tsx`): Dynamic component loader that:
   - Uses Next.js dynamic imports to load visual components
   - Implements cross-fade transitions on content change
   - Maps component paths to actual imports via resolver

3. **CodePane** (`src/components/CodePane.tsx`): Code display with:
   - Syntax highlighting via react-syntax-highlighter
   - Auto-scroll to highlighted lines
   - Line-specific highlighting based on ranges

### Content Pipeline

1. **Story Manifest** (`content/story.json`): Defines all steps with:
   - Prose file paths
   - Visual component paths and props
   - Code file paths and highlight ranges

2. **Data Loading** (`src/lib/content.ts`):
   - `loadStoryData()`: Main function that assembles all content
   - Reads markdown, converts to HTML via marked
   - Loads code files from filesystem
   - Parses highlight ranges (e.g., "10-25")

### Directory Structure
```
content/
├── story.json       # Step definitions
├── prose/          # Markdown narrative files
└── code/           # Source code files to display

src/
├── app/            # Next.js app router
├── components/     # Core scrollytelling components
├── lib/            # Data loading utilities
└── visuals/        # Visual components (ImageDisplay, etc.)
```

## Adding New Content

### New Step in story.json
```json
{
  "id": "unique-step-id",
  "prosePath": "/prose/filename.md",
  "visualPane": {
    "componentPath": "visuals/ComponentName",
    "props": { /* component props */ }
  },
  "codePane": {
    "filePath": "/code/file.py",
    "highlight": "15-30"
  }
}
```

### New Visual Component
1. Create component in `src/visuals/`
2. Add to resolver in `VisualPane.tsx`:
```typescript
case 'visuals/NewComponent':
  return dynamic(() => import('../visuals/NewComponent'), {
    loading: () => <div className="animate-pulse..." />
  })
```

## Key Implementation Details

- **Scroll Offset**: Set to 0.6 in Scrollama (triggers when step is 60% in viewport)
- **Transitions**: 300ms cross-fade on content changes
- **Code Highlighting**: Blue background with left border for highlighted lines
- **Responsive**: Collapses to single column on mobile via Tailwind classes
- **Styling**: Dark theme using Tailwind CSS with gray-950 backgrounds

## Common Tasks

### Update highlight range for a step
Edit the step in `content/story.json` and change the `highlight` field (e.g., "10-25")

### Add new prose content
1. Create markdown file in `content/prose/`
2. Reference in story.json via `prosePath`

### Debug scroll triggers
Check `onStepEnter` handler in ScrollyClient - logs can be added there

### Modify code syntax theme
Change `nightOwl` import in CodePane.tsx to another react-syntax-highlighter theme