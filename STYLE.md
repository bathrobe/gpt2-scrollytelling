## GPT Widget Visual Style Guide

### Core Color Palette

**Background**

- Main gradient: `#0a0e27` to `#151932` (135deg)
- Container bg: `rgba(20, 25, 47, 0.9)`
- Dark panels: `rgba(10, 15, 30, 0.9)`
- Component default: `rgba(40, 45, 70, 0.8)`

**Primary Accent - Cyan (main flow)**

- Bright: `#64f5d0` / `rgba(100, 255, 218, 1)`
- Medium: `rgba(100, 255, 218, 0.6)`
- Subtle: `rgba(100, 255, 218, 0.2)`
- Border: `rgba(100, 255, 218, 0.15)`

**Secondary Accent - Blue (embeddings/params)**

- Bright: `#667eea` / `rgba(102, 126, 234, 1)`
- Medium: `rgba(102, 126, 234, 0.6)`
- Subtle: `rgba(102, 126, 234, 0.3)`

**Tertiary Accent - Red (special connections)**

- Bright: `#ff6b6b` / `rgba(255, 107, 107, 1)`
- Medium: `rgba(255, 107, 107, 0.6)`
- Subtle: `rgba(255, 107, 107, 0.3)`

**Warning Accent - Amber (normalization/compute)**

- Bright: `#ffc864` / `rgba(255, 200, 100, 1)`
- Medium: `rgba(255, 200, 100, 0.6)`
- Subtle: `rgba(255, 200, 100, 0.3)`

**Text**

- Primary: `#e0e6ed` / `rgba(224, 230, 237, 1)`
- Secondary: `rgba(224, 230, 237, 0.8)`
- Muted: `rgba(224, 230, 237, 0.7)`
- Disabled: `#999` / `rgba(150, 150, 150, 0.7)`

### Typography

**Font Stack**

```css
font-family: "SF Mono", "Monaco", "Inconsolata", "Consolas", monospace;
```

**Sizes**

- Title/header: `14px`
- Component labels: `12px`
- Info text: `11-12px`
- Subscript/dims: `10px`
- Large icons: `20px` (like + symbol)

**Weights**

- Bold for component names: `font-weight: bold`
- Normal for descriptions: `font-weight: normal`

**Letter Spacing**

- Headers: `letter-spacing: 1px`
- Component labels: `letter-spacing: 0.5px`
- Body text: default

### Component Styling

**Containers**

```css
border-radius: 12px; /* outer containers */
border-radius: 8px; /* components */
border-radius: 6px; /* small elements */
border: 1px solid rgba(100, 255, 218, 0.15); /* subtle border */
```

**Interactive States**

```css
/* Default */
background: rgba(40, 45, 70, 0.8);
border: 2px solid rgba(100, 255, 218, 0.3);
transition: all 0.3s ease;

/* Hover */
background: rgba(100, 255, 218, 0.2);
border: 2px solid rgba(100, 255, 218, 0.8);
transform: scale(1.05); /* subtle grow */
box-shadow: 0 0 20px rgba(100, 255, 218, 0.3); /* glow */

/* Active/Selected */
background: rgba(100, 255, 218, 0.1);
border-left: 2px solid rgba(100, 255, 218, 0.5); /* left accent */
```

### Visual Effects

**Glow Filter (SVG)**

```xml
<filter id="glow">
  <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
  <feMerge>
    <feMergeNode in="coloredBlur"/>
    <feMergeNode in="SourceGraphic"/>
  </feMerge>
</filter>
```

**Gradient Definitions**

```xml
<linearGradient id="flowGradient" x1="0%" y1="0%" x2="0%" y2="100%">
  <stop offset="0%" stopColor="rgba(100, 255, 218, 0.6)" />
  <stop offset="100%" stopColor="rgba(100, 255, 218, 0.1)" />
</linearGradient>
```

**Backdrop Blur**

```css
backdrop-filter: blur(10px); /* for overlays */
```

### Animation Patterns

**Continuous Flow**

```css
animation: flowDown 3s linear infinite;
```

**Pulse (for emphasis)**

```css
@keyframes pulse {
  0%,
  100% {
    opacity: 0.3;
  }
  50% {
    opacity: 0.8;
  }
}
animation: pulse 2s infinite;
```

**Hover Transitions**

```css
transition: all 0.3s ease; /* standard */
transition: all 0.2s ease; /* snappy */
```

### Layout Principles

**Spacing**

- Container padding: `20px` or `40px` for larger
- Component gaps: `10px` small, `20px` medium
- Info panel: `12-16px` padding

**Dimensions**

- Landscape ratio: wider than tall (800x400 viewBox worked well)
- Min heights: info panel `60-100px`
- Component heights: `30-50px` depending on content

### Special Elements

**Dashed Lines (connections)**

```css
stroke-dasharray: "8,4" /* weight tying */
stroke-dasharray: "5,5" /* residual path */
```

**Arrows**

```xml
<marker id="arrowhead" markerWidth="10" markerHeight="10" refX="9" refY="3">
  <polygon points="0 0, 10 3, 0 6" fill="rgba(100, 255, 218, 0.6)" />
</marker>
```

### Semantic Color Usage

- **Cyan**: Primary data flow, outputs, main path
- **Blue**: Parameters, embeddings, learned components
- **Red**: Special connections (residual, weight tying), important architectural tricks
- **Amber**: Normalization, activation functions, compute operations
- **Green** (future): Gradients, backprop
- **Magenta** (future): Attention weights, token relationships

### Info Panel Pattern

```jsx
<div
  style={{
    borderTop: "1px solid rgba(100, 255, 218, 0.2)",
    padding: "12px 20px",
    background: "rgba(10, 15, 30, 0.9)",
    minHeight: "60px",
  }}
>
  {/* Dynamic content based on hover */}
</div>
```

this guide should let you maintain consistency across all widgets. key philosophy: dark bg for contrast, neon accents for emphasis, monospace for technical precision, subtle animations for engagement without distraction.
