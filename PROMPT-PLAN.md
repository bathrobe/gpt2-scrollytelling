### Step 1

- [x] Initialize dependencies and Tailwind CSS per the PRD

Set up the project dependencies needed to execute the PRD exactly as written. Install `react-scrollama`, `react-syntax-highlighter`, and either `marked` or `showdown` for Markdown-to-HTML conversion (choose one; `marked` is fine). Ensure Tailwind CSS is configured for the existing Next.js (App Router) project: create a `tailwind.config.js` at the root with the standard `content` glob paths that include `src/**/*.{ts,tsx}` and `app/**/*.{ts,tsx}`, enable any default plugins if you prefer, and confirm `postcss.config.mjs` is already present (it exists in this repo). Verify `src/app/globals.css` imports Tailwind’s base, components, and utilities layers at the top of the file. This step ensures stylistic utilities and core libraries are available before you start building components and layout.

If any of these packages are already installed, only add the missing ones. Keep versions current and compatible. After installation, run the dev server once to make sure Next.js boots and Tailwind classes are being applied (e.g., temporarily add a `bg-red-200` class to a visible element and confirm it takes effect, then remove it). Do not introduce additional libraries beyond those specified in the PRD.

### Step 2

- [x] Scaffold the content and public directories with placeholder assets

Create the directories and placeholder files described by the PRD so that there is a minimal, working data set. Under the project root, create a `content/` directory with three subfolders: `content/prose/`, `content/code/`, and the `content/story.json` file at the top level of `content/`. In `content/prose/`, add a single placeholder Markdown file named `01-intro.md` with a few paragraphs of narrative text. In `content/code/`, add a small example source file (the PRD example is `model.py`; you can use that exact filename) with at least 40 lines to make scrolling/highlighting meaningful. In `public/images/` (create it if it doesn’t exist), add one placeholder image file, e.g., `overview.png`. These placeholders will be referenced from `story.json`.

In `content/story.json`, define an initial array of one or two step objects that match the PRD schema exactly. For example, use an `id` like `"intro-to-model"`, a `prosePath` like `"/prose/01-intro.md"`, a `visualPane` with `componentPath` set to `"visuals/ImageDisplay"` and `props` containing `{"src":"/images/overview.png","alt":"Overview"}`, and a `codePane` with `filePath` set to a path under `/content/code/` (e.g., `"/code/model.py"`) and `highlight` set to a small range string like `"10-25"`. Make sure paths begin with a forward slash as shown and are consistent with how you will read files from the filesystem at build time.

### Step 3

- [ ] Implement `src/lib/content.ts` data loaders to read all content at build time

Create a new `src/lib/content.ts` module that exports small, focused functions to load the story manifest and associated files synchronously during build-time execution. Add a function to read and parse `content/story.json` (e.g., `loadStoryManifest`). Add a function to read a Markdown file from disk by a leading-slash path (e.g., `"/prose/01-intro.md"`) and return both the raw Markdown and the HTML string after conversion using your chosen library (`marked` is recommended). Add a function to read a code file from disk (by its leading-slash path under `content/code/`) into a string. Keep the function signatures simple and permissive with TypeScript—use `any` for the manifest step shape initially to reduce friction.

Add a small utility that converts a `highlight` string like `"10-25"` into a zero-based start/end line index pair, gracefully handling inclusive ranges. Document assumptions: lines are 1-based in the manifest; convert to 0-based for internal logic. Finally, add a top-level function, e.g., `loadStoryData()`, that reads the manifest, then maps each step into a final object that includes the prose HTML, the raw code string, and the parsed highlight range, returning the full array to be used by the page. Ensure all file paths are resolved from the project root using Node’s `path` and `fs` modules and that this logic runs only in server contexts (no `use client`).

### Step 4

- [ ] Build the three-pane static layout in `src/app/page.tsx` (Server Component)

Open or create `src/app/page.tsx` as a Server Component. At the top of the module, call the `loadStoryData()` function from `src/lib/content.ts` to fetch the fully prepared data at build time. Construct the skeleton layout using Tailwind CSS: a responsive container that becomes a two-column grid or flex layout on large screens. The left column is a vertically scrollable narrative area (normal flow), and the right column is a sticky container split into two vertically stacked panes of equal height. Apply `sticky top-0` to the right column so it remains fixed while the left column scrolls. Assign appropriate heights (e.g., `h-screen` on the sticky column), padding, and background colors to ensure clarity.

Render a client-side child component (created in the next step) and pass in the loaded data via props. Keep `page.tsx` responsible only for data loading and shell layout, not for scroll event handling. Ensure this page remains a Server Component by not adding `"use client"` to it and by not importing client-only libraries directly here.

### Step 5

- [ ] Create a client wrapper to manage active step state and scroll events

Create a new client component (e.g., `src/components/ScrollyClient.tsx`) with `"use client"` at the top. It should accept the fully loaded story data from the server page via props. Initialize `const [activeStepId, setActiveStepId] = useState<string>(story[0].id);`. Use `react-scrollama` to wrap the left-pane narrative content: place a `<Scrollama onStepEnter={...}>` around a mapped list of `<Step data={step.id}>` elements, where each step wraps the rendered prose HTML for that step. Set the handler so that when a step enters, it calls `setActiveStepId(id)`. Choose a conservative `offset` and/or threshold so steps activate near mid-viewport for clarity (e.g., offset around 0.6–0.7).

Make the left pane contain properly spaced sections (each step is its own block with margin and max-width for readability). Ensure the right column content is also rendered by this client component, while its container and dimensions come from the server page. Wire the `activeStepId` into the right panes by selecting the corresponding step from the story array and passing that step’s `visualPane` and `codePane` to their respective components.

### Step 6

- [ ] Implement `src/components/VisualPane.tsx` with dynamic component loading and cross-fade

Create a `VisualPane` component that accepts the active step’s `visualPane` object with `componentPath` and `props`. Use `next/dynamic` to load a component lazily; because Next.js requires statically analyzable import paths, implement a small resolver function that maps known `componentPath` strings to concrete dynamic imports (e.g., `"visuals/ImageDisplay"` and `"visuals/AttentionVisualizer"`). If the incoming `componentPath` is unknown, render a simple fallback (e.g., a bordered box with a message). Once loaded, render the component with the given props using JSX spread.

Add a simple cross-fade transition that triggers when the `componentPath` changes. A practical approach is to key the wrapper element by `componentPath` so React remounts on step change, and apply Tailwind classes such as `transition-opacity duration-300` with an `opacity-0` to `opacity-100` effect as it mounts. Keep the component purely presentational and functional (no OOP patterns), and use permissive prop typing as needed to keep development friction low.

### Step 7

- [ ] Implement `src/components/CodePane.tsx` with syntax highlighting and auto-scroll to highlighted lines

Create a `CodePane` component that accepts the active step’s `codePane` object and the loaded code string plus the parsed highlight range. Render the code using `react-syntax-highlighter` with a dark theme like `atomOneDark`. Make line numbers visible for clarity. Use the `lineProps` prop to apply a distinctive background to lines in the highlight range. To auto-scroll, create a ref for an element within the highlighted range (e.g., the first highlighted line) and use an effect that runs whenever the highlight range changes to call `ref.current.scrollIntoView({ behavior: 'smooth', block: 'center' })`.

Add the same cross-fade approach used in the `VisualPane` so code transitions feel smooth when the active step changes. Ensure the code pane’s container is scrollable independently if its content exceeds the vertical space in the sticky right column. Prefer clear, small helper functions to compute whether a line is in range and to build line props, keeping the file focused and easy to test mentally.

### Step 8

- [ ] Wire data flow from the server page to client panes with simple, permissive types

Update `src/app/page.tsx` to pass the loaded story data to `ScrollyClient`. In the client layer, compute the `activeStep` by finding the step with `id === activeStepId`. Provide that object’s `visualPane` and `codePane` (along with precomputed prose HTML and code string) as props to `VisualPane` and `CodePane`. In the left pane, render the prose HTML for each step inside the corresponding `<Step>` container by setting `dangerouslySetInnerHTML={{ __html: proseHtml }}`. This follows the PRD’s requirement that the narrative is rendered from Markdown.

Use `any` for the step type at first to avoid blocking on typing; if you introduce types, keep them minimal and aligned with the PRD’s schema. Avoid adding new fields or changing schema names to prevent scope creep. Keep the data flow one-way: the left pane’s scroll triggers updates to `activeStepId`, which drives renders in the right panes.

### Step 9

- [ ] Add responsive behavior so the layout collapses gracefully on smaller screens

Enhance the Tailwind classes so that on large screens (`lg:`) the layout shows two columns with a sticky right column and on smaller screens it stacks into a single column with the narrative first and the visual/code panes below it. Ensure spacing, padding, and typography are comfortable and readable on mobile. Keep the interactions straightforward—no additional gestures or controls beyond scrolling—staying within the bounds of the PRD. Verify that the sticky behavior only applies on viewports where two columns are present.

### Step 10

- [ ] Final polish: transitions, spacing, and a quick content review

Review both pane transitions and basic spacing to ensure the experience feels smooth. Confirm that cross-fade transitions are applied to both the visual and code panes on step change. Check that headings, paragraph spacing, and code font all read cleanly. Make sure the initial active step is the first step in the manifest, and that switching steps via scroll updates both panes reliably. Keep changes minimal and within the PRD—do not introduce theming systems, new libraries, or extra components beyond those specified. Once satisfied, run a production build locally to confirm there are no build-time issues with server/client boundaries and that all content is statically included.
