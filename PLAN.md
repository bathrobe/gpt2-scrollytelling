PRD: Scrollyteller (TypeScript Build Spec)
Version: 3.0
Status: Ready for Development

1. Project Vision & Goal
   1.1. Product Summary
   This project will create a focused, web-based "scrollytelling" application. The purpose is to provide a guided tour through a technical subject, such as a codebase. The user experience is centered on a three-pane layout where a scrolling narrative on the left synchronizes with a dynamic visual pane and a code pane on the right.
   1.2. Core Goal
   The primary objective is to build a functional, beautiful, and performant V1 of the scrollytelling experience using a modern TypeScript and Next.js stack. Success is defined by the seamless and intuitive synchronization between the user's scroll position and the content displayed in the static panes.
2. The Core Experience
   2.1. Desktop Layout
   The user interface is built on a static three-pane layout for desktop viewports.
   Left Pane (Narrative): This is the primary interactive column. It contains the main story, rendered from plain Markdown files. This pane is vertically scrollable, and its scroll position is the sole driver of the application's state.
   Top-Right Pane (Visuals): This pane is "sticky," meaning it remains fixed within the viewport as the user scrolls the narrative. It dynamically renders a specified React component for each step, passing in the necessary props. This allows for anything from a simple image display to a complex interactive visualization.
   Bottom-Right Pane (Code): This pane is also sticky and is dedicated to displaying source code. It features syntax highlighting and will automatically scroll to and emphasize the specific lines of code being discussed in the current narrative step.
   2.2. Scrollytelling Interaction Model
   The core interaction is designed to be fluid and intuitive.
   Engine: The react-scrollama library will power the scroll-triggered events.
   Activation: As the user scrolls the Left Pane, react-scrollama will monitor "step" sections. When a step section enters the designated viewport threshold, it becomes the "active step."
   State Synchronization: Activating a new step updates a single state variable in the main React component. This state change propagates as props to the Visual and Code panes, causing them to re-render with new content.
   Transitions: All content changes in the right-hand panes should be accompanied by a subtle cross-fade transition to ensure the experience feels smooth and polished.
3. Technical Specification
   3.1. Technology Stack
   Framework: Next.js (App Router, TypeScript)
   Language: TypeScript
   Styling: Tailwind CSS
   Deployment: Vercel, or any hosting provider that supports static Next.js sites.
   3.2. Core Libraries
   react-scrollama: The engine for handling scroll-triggered events.
   react-syntax-highlighter: The library for rendering and styling code. A dark theme like atomOneDark is recommended.
   showdown or marked: A lightweight library to convert Markdown strings from .md files into HTML.
   3.3. Data Flow & Static Generation
   The application will be fully static, ensuring maximum performance.
   Source of Truth: A central story.json file will define the sequence and content for every step of the narrative.
   Build-Time Fetching: All required content—the story.json file, all .md narrative files, and all source code files—will be read from the filesystem at build time within a Next.js Server Component.
   Result: The final output is a static site. All data is bundled with the application, requiring no API calls or database lookups at runtime.
4. Content Architecture
   4.1. The story.json Manifest
   This file orchestrates the narrative. Its structure should be considered a flexible starting point, adaptable during development as needed. The core idea is an array of "step" objects that provide the necessary data to render all three panes.
   Proposed Schema for a Step Object:
   {
   "id": "string",
   "prosePath": "string",
   "visualPane": {
   "componentPath": "string",
   "props": {}
   },
   "codePane": {
   "filePath": "string",
   "highlight": "string"
   }
   }

id: A unique string to identify the step (e.g., "intro-to-model").
prosePath: The path to the .md file for the narrative text (e.g., "/prose/01-intro.md").
visualPane.componentPath: The path to the React component to render in the top-right pane, relative to a base directory like src/components/. Example: "visuals/ImageDisplay".
visualPane.props: An object of props to be passed directly to the instantiated component. For an image, this might be { "src": "/images/overview.png", "alt": "..." }.
codePane.filePath: The path to the code file to display.
codePane.highlight: The line range to highlight (e.g., "10-25").
4.2. Directory Structure
This structure assumes the default Next.js src directory setup.
/
├── src/
│ ├── app/
│ │ └── page.tsx
│ ├── components/
│ │ ├── VisualPane.tsx
│ │ ├── CodePane.tsx
│ │ └── visuals/
│ │ ├── ImageDisplay.tsx // A generic image component
│ │ └── AttentionVisualizer.tsx // A custom interactive component
│ └── lib/
│ └── content.ts // Data loading utilities
├── content/
│ ├── prose/
│ │ └── 01-intro.md
│ ├── code/
│ │ └── model.py
│ └── story.json
├── public/
│ └── images/
│ └── overview.png
└── tailwind.config.js

5. Implementation Plan
   M1: Content Structure & Data Utilities
   Scaffold Content: Create the content and public directories. Populate them with placeholder content: a story.json file, at least one .md file, one code file, and one image.
   Create Data Loaders: In src/lib/content.ts, write the TypeScript functions to read and parse story.json, the .md files, and the code files from the filesystem. These will be used in the root page.tsx Server Component.
   M2: Static Layout & State Management
   Build the Layout: In src/app/page.tsx, use Tailwind CSS to create the static three-pane layout. The left pane should be a standard div, while the right column should be a sticky flex container holding the two visual panes.
   Create Client Wrapper: Create a client component ('use client') that will receive all the pre-loaded content as props from page.tsx. This component will manage the application's state.
   Initialize State: Inside the client wrapper, set up the primary state: const [activeStepId, setActiveStepId] = useState<string>(story[0].id);.
   M3: Scrollytelling Integration
   Integrate react-scrollama: Inside the client wrapper, map over the narrative steps. Render each step's prose inside a <Step> component from react-scrollama. The data prop of <Step> should be the step's id.
   Wrap in <Scrollama>: Enclose the mapped steps within the <Scrollama> provider component.
   Implement Handler: Provide an onStepEnter handler to <Scrollama> that calls setActiveStepId with the ID of the step that has entered the viewport.
   M4: Dynamic Pane Implementation
   Build VisualPane.tsx:
   This component will receive the visualPane object for the active step.
   It will use next/dynamic to dynamically import the React component specified by componentPath.
   Once loaded, it will render the component, spreading the props object onto it: <LoadedComponent {...props} />.
   Build CodePane.tsx:
   This component receives the codePane object for the active step.
   It will use react-syntax-highlighter to render the code content.
   It must use the lineProps prop to apply a style to the highlighted lines.
   Crucially, it must contain a useEffect hook that watches for changes to the highlight prop. When it changes, a ref should be used with ref.current.scrollIntoView({ behavior: 'smooth', block: 'center' }) to automatically scroll the relevant code into view.
   M5: Final Polish
   Add Transitions: Wrap the content inside the VisualPane and CodePane with a simple transition effect (e.g., using Tailwind CSS classes for opacity and duration) to handle the cross-fade on content change.
   Responsive Collapse: Add responsive Tailwind classes (lg:, md:) to the layout to ensure it collapses gracefully into a single, readable column on smaller screens.
   Review & Refine: Do a final pass on all styling, typography, and spacing to ensure a high-quality visual presentation.
