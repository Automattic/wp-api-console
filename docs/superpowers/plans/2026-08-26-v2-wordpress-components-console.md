# V2 WordPress Components Console Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a functional `/v2` console built with React 18 and `@wordpress/components` while reusing the V1 endpoint-selection `Header` and V1 request-history `Results` unchanged.

**Architecture:** A pathname boundary selects the existing V1 `App` or a new `V2App`, both backed by the same Redux store. V2 adds focused parameter and request-configuration panels around existing selectors/actions, then imports the V1 `Header` and `Results` directly so endpoint discovery, path entry, submission, OAuth, executed-request history, and response rendering each retain one implementation.

**Tech Stack:** React 18, Redux/react-redux 8, Vite/Vitest, `@wordpress/components`, existing schema-v1 request-config codec, existing API/result state.

---

## File structure

- Modify `package.json` and `package-lock.json` for React 18 and WordPress Components.
- Create `src/root-app.jsx` as the pathname boundary.
- Modify `src/index.jsx` to use `createRoot`.
- Modify React DOM tests to use React 18 roots.
- Create `src/v2/app.jsx` and `src/v2/style.css` for the V2 shell that imports the existing `Header` and `Results`.
- Create `src/v2/components/parameter-workspace/index.jsx` and `style.css` for Query/Body editing.
- Create `src/v2/components/request-config-panel/index.jsx` and `style.css` to place the existing secure editor in the V2 layout.
- Create focused tests under each new V2 component’s `tests/` directory.
- Modify `README.md` to document `/v2` and the unchanged V1 route.

### Task 1: Migrate the runtime and test renderer to React 18

**Files:**
- Modify: `package.json`
- Modify: `package-lock.json`
- Modify: `src/index.jsx`
- Modify: `src/app.test.jsx`
- Modify: `src/components/request-config-editor/tests/index.test.jsx`
- Create: `src/root-app.jsx`
- Create: `src/tests/root-app.test.jsx`

- [ ] **Step 1: Update package constraints and install dependencies**

Set these dependency versions:

```json
{
  "@wordpress/components": "^39.0.0",
  "react": "^18.3.1",
  "react-dom": "^18.3.1",
  "react-json-tree": "^0.20.0",
  "react-redux": "^8.1.3",
  "react-tagsinput": "^3.20.3"
}
```

Run:

```bash
npm install --legacy-peer-deps
```

Expected: `package-lock.json` updates and install exits 0. `--legacy-peer-deps` remains necessary because the unchanged V1 endpoint bar still uses `react-input-autosize`, whose published peer range stops at React 17.

- [ ] **Step 2: Write the failing pathname-boundary test**

Create `src/tests/root-app.test.jsx`:

```jsx
import { getAppVersion } from '../root-app';

it.each( [ '/v2', '/v2/' ] )( 'selects V2 for %s', pathname => {
	expect( getAppVersion( pathname ) ).toBe( 'v2' );
} );

it.each( [ '/', '/anything-else' ] )( 'keeps V1 for %s', pathname => {
	expect( getAppVersion( pathname ) ).toBe( 'v1' );
} );
```

- [ ] **Step 3: Run the test to verify RED**

Run:

```bash
npm test -- --run src/tests/root-app.test.jsx
```

Expected: FAIL because `src/root-app.jsx` does not exist.

- [ ] **Step 4: Add the pathname boundary and React 18 root**

Create `src/root-app.jsx`:

```jsx
import React from 'react';
import App from './app';
import V2App from './v2/app';

export const getAppVersion = pathname => /^\/v2\/?$/.test( pathname ) ? 'v2' : 'v1';

const RootApp = ( { pathname = window.location.pathname } ) => {
	const SelectedApp = getAppVersion( pathname ) === 'v2' ? V2App : App;
	return <SelectedApp />;
};

export default RootApp;
```

Replace `src/index.jsx` with:

```jsx
import React from 'react';
import { createRoot } from 'react-dom/client';
import RootApp from './root-app';

createRoot( document.getElementById( 'root' ) ).render( <RootApp /> );
```

- [ ] **Step 5: Migrate existing component tests to React 18 roots**

In `src/app.test.jsx` and `src/components/request-config-editor/tests/index.test.jsx`, replace `ReactDOM.render` and `ReactDOM.unmountComponentAtNode` with a per-test `createRoot`:

```jsx
import { createRoot } from 'react-dom/client';

let container;
let root;

beforeEach( () => {
	container = document.createElement( 'div' );
	document.body.appendChild( container );
	root = createRoot( container );
} );

afterEach( () => {
	act( () => root.unmount() );
	container.remove();
} );
```

Render with `act( () => root.render( <Component /> ) )`.

- [ ] **Step 6: Run focused and full tests**

Run:

```bash
npm test -- --run src/tests/root-app.test.jsx src/app.test.jsx src/components/request-config-editor/tests/index.test.jsx
npm test -- --run
```

Expected: all tests PASS without React 17 render API warnings.

- [ ] **Step 7: Commit**

```bash
git add package.json package-lock.json src/index.jsx src/root-app.jsx src/tests/root-app.test.jsx src/app.test.jsx src/components/request-config-editor/tests/index.test.jsx
git commit -m "chore: migrate console runtime to React 18"
```

### Task 2: Add the V2 shell while reusing the V1 header

**Files:**
- Create: `src/v2/app.jsx`
- Create: `src/v2/style.css`
- Create: `src/v2/tests/app.test.jsx`

- [ ] **Step 1: Write a failing shell test**

Create `src/v2/tests/app.test.jsx` with mocks for child panels and an assertion that the imported V1 header is first:

```jsx
import React from 'react';
import { createRoot } from 'react-dom/client';
import { act } from 'react-dom/test-utils';
import { vi } from 'vitest';

vi.mock( '../../components/header', () => ( { default: () => <div data-testid="v1-header" /> } ) );
vi.mock( '../components/parameter-workspace', () => ( { default: () => <div data-testid="parameters" /> } ) );
vi.mock( '../components/request-config-panel', () => ( { default: () => <div data-testid="request-config" /> } ) );
vi.mock( '../../components/results', () => ( { default: () => <div data-testid="v1-results" /> } ) );

import { V2Layout } from '../app';

it( 'reuses the V1 header and V1 results around the V2 workspace', () => {
	const container = document.createElement( 'div' );
	const root = createRoot( container );
	act( () => root.render( <V2Layout /> ) );
	expect( Array.from( container.firstChild.children ).map( node => node.dataset.testid || node.className ) )
		.toEqual( [ 'v1-header', 'v2-console__main' ] );
	expect( Array.from( container.querySelector( '.v2-console__main' ).children ).map( node => node.dataset.testid || node.className ) )
		.toEqual( [ 'v2-console__workspace', 'v1-results' ] );
	expect( container.querySelectorAll( '[data-testid="v1-header"]' ) ).toHaveLength( 1 );
	expect( container.querySelectorAll( '[data-testid="v1-results"]' ) ).toHaveLength( 1 );
	act( () => root.unmount() );
} );
```

- [ ] **Step 2: Run the test to verify RED**

Run:

```bash
npm test -- --run src/v2/tests/app.test.jsx
```

Expected: FAIL because `src/v2/app.jsx` does not exist.

- [ ] **Step 3: Implement the V2 shell**

Create `src/v2/app.jsx`:

```jsx
import React from 'react';
import { Provider } from 'react-redux';
import '@wordpress/components/build-style/style.css';
import '../app.css';
import './style.css';
import store from '../state';
import Header from '../components/header';
import ParameterWorkspace from './components/parameter-workspace';
import RequestConfigPanel from './components/request-config-panel';
import Results from '../components/results';

export const V2Layout = () => (
	<div className="App v2-console">
		<Header />
		<main className="v2-console__main">
			<section className="v2-console__workspace">
				<ParameterWorkspace />
				<RequestConfigPanel />
			</section>
			<Results />
		</main>
	</div>
);

const V2App = () => <Provider store={ store }><V2Layout /></Provider>;
export default V2App;
```

Create `src/v2/style.css` with fixed-header clearance and responsive two-column layout:

```css
.v2-console__main { padding-top: 60px; }
.v2-console__workspace { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 16px; padding: 16px; }
@media ( max-width: 900px ) { .v2-console__workspace { grid-template-columns: minmax(0, 1fr); } }
```

- [ ] **Step 4: Run the focused test and build**

Run:

```bash
npm test -- --run src/v2/tests/app.test.jsx src/tests/root-app.test.jsx
npm run build
```

Expected: tests PASS and Vite resolves the WordPress Components stylesheet.

- [ ] **Step 5: Commit**

```bash
git add src/v2 src/root-app.jsx
git commit -m "feat: add V2 application shell"
```

### Task 3: Build Query and Body parameter tabs with WordPress controls

**Files:**
- Create: `src/v2/components/parameter-workspace/index.jsx`
- Create: `src/v2/components/parameter-workspace/style.css`
- Create: `src/v2/components/parameter-workspace/tests/index.test.jsx`

- [ ] **Step 1: Write failing behavior tests**

Test the unconnected named export with a real Redux-independent render. Cover:

```jsx
it( 'shows only Query and Body tabs because Path stays in the V1 header', () => {
	renderWorkspace();
	expect( container.textContent ).toContain( 'Query' );
	expect( container.textContent ).toContain( 'Body' );
	expect( container.textContent ).not.toContain( 'Path' );
} );

it( 'dispatches an existing query action through a type-specific control', () => {
	const setQueryParam = vi.fn();
	renderWorkspace( { setQueryParam } );
	changeTheContextControlToEdit();
	expect( setQueryParam ).toHaveBeenCalledWith( 'context', 'edit' );
} );

it( 'renders endpoint types as read-only badges', () => {
	renderWorkspace();
	expect( container.querySelector( '[data-parameter-type="boolean"]' ).textContent ).toBe( 'boolean' );
	expect( container.querySelector( '[data-parameter-type] input' ) ).toBeNull();
} );
```

Use an endpoint fixture containing string, boolean, integer, and array parameters.

- [ ] **Step 2: Run the test to verify RED**

Run:

```bash
npm test -- --run src/v2/components/parameter-workspace/tests/index.test.jsx
```

Expected: FAIL because the component does not exist.

- [ ] **Step 3: Implement type-specific controls and tabs**

Create the component using `Card`, `CardHeader`, `CardBody`, `TabPanel`, `TextControl`, `NumberControl`, `ToggleControl`, `TextareaControl`, `Tooltip`, and `Button` from `@wordpress/components`. Export the unconnected component for tests and connect the default export to existing selectors/actions.

The control mapping is:

- `boolean` → `ToggleControl` preserving `false`;
- `integer`/`number` → `NumberControl`, normalizing finite edits back to JavaScript numbers;
- `array`/`object` → `TextareaControl` with JSON parsing and type validation, preserving mixed JSON arrays and objects;
- all other types → `TextControl`.

Invalid intermediate JSON stays local to the textarea and is not dispatched. Empty numeric values clear the parameter; non-finite values are not dispatched.

Each row includes a static `<span data-parameter-type={ parameter.type || 'string' }>` and a tertiary clear `Button` that calls `onChange( name )`. Build tabs only for Query and Body; do not read or dispatch path values.

Connect with:

```jsx
export default connect(
	state => ( {
		endpoint: getSelectedEndpoint( state ),
		queryParams: getQueryParams( state ),
		bodyParams: getBodyParams( state ),
	} ),
	{ setQueryParam, setBodyParam }
)( ParameterWorkspace );
```

- [ ] **Step 4: Add compact responsive table styling and accessible discovery help**

Use a four-column desktop grid (name/help, type, control, clear) and collapse name/type above controls below 600 px. Use V1-like 12–13 px typography, 4 px vertical row padding, 8 px gaps, and approximately 32–36 px controls/rows. Bound the internal parameter list to 222 px with vertical scrolling and keep its header sticky. When discovery provides `parameter.description`, expose it through a keyboard-focusable `@wordpress/components` `Tooltip` help button without increasing row height. Preserve visible focus and do not style type badges like editable inputs.

- [ ] **Step 5: Run focused and request reducer tests**

Run:

```bash
npm test -- --run src/v2/components/parameter-workspace/tests/index.test.jsx src/state/request/tests/reducer.test.js
```

Expected: all PASS.

- [ ] **Step 6: Commit**

```bash
git add src/v2/components/parameter-workspace
git commit -m "feat: add V2 parameter workspace"
```

### Task 4: Place the secure request configuration editor in a V2 card

**Files:**
- Create: `src/v2/components/request-config-panel/index.jsx`
- Create: `src/v2/components/request-config-panel/style.css`
- Create: `src/v2/components/request-config-panel/tests/index.test.jsx`

- [ ] **Step 1: Write the failing composition test**

Mock the existing editor and assert it is rendered once inside a WordPress Card:

```jsx
vi.mock( '../../../components/request-config-editor', () => ( {
	default: () => <div data-testid="existing-request-config-editor" />,
} ) );

it( 'reuses the secure schema-v1 editor', () => {
	renderPanel();
	expect( container.querySelectorAll( '[data-testid="existing-request-config-editor"]' ) ).toHaveLength( 1 );
	expect( container.textContent ).toContain( 'Request configuration JSON' );
} );
```

- [ ] **Step 2: Run the test to verify RED**

Run:

```bash
npm test -- --run src/v2/components/request-config-panel/tests/index.test.jsx
```

Expected: FAIL because the panel does not exist.

- [ ] **Step 3: Implement the panel without duplicating codec behavior**

Create a `Card` with `CardHeader`, heading text, and `CardBody` containing the existing connected `<RequestConfigEditor />`. Do not copy codec, selectors, debounce, clipboard, paste, resolution, or dispatch code into `src/v2`.

- [ ] **Step 4: Run security and editor tests**

Run:

```bash
npm test -- --run src/v2/components/request-config-panel/tests/index.test.jsx src/components/request-config-editor/tests/index.test.jsx src/request-config/tests src/state/request-config/tests
```

Expected: all PASS, including exclusions for results/history/authentication data and no automatic request submission.

- [ ] **Step 5: Commit**

```bash
git add src/v2/components/request-config-panel
git commit -m "feat: add V2 request configuration panel"
```

### Task 5: Restore V1 composition and verify both routes

**Files:**
- Modify: `src/app.jsx`
- Modify: `src/app.test.jsx`
- Modify: `src/app.css`
- Modify: `README.md`
- Modify as needed only for verified defects: `src/v2/**/*.css`

- [ ] **Step 1: Write the failing positive V1 composition test**

Update `src/app.test.jsx` to assert the original component sequence rather than asserting removed UI is absent:

```jsx
it( 'renders the original V1 header, query builder, and results sequence', () => {
	act( () => root.render( <App /> ) );
	expect( Array.from( container.querySelector( '.App' ).children ).map(
		node => node.getAttribute( 'data-testid' )
	) ).toEqual( [ 'header', 'query-builder', 'results' ] );
} );
```

- [ ] **Step 2: Run the V1 test to verify RED**

Run:

```bash
npm test -- --run src/app.test.jsx
```

Expected: FAIL because V1 still includes the shareable request workspace wrapper/editor.

- [ ] **Step 3: Restore the original V1 route composition**

Change `src/app.jsx` to render only the original sequence while retaining React 18 and the shared store:

```jsx
const App = () => (
	<Provider store={ store }>
		<div className="App">
			<Header />
			<QueryBuilder />
			<Results />
		</div>
	</Provider>
);
```

Remove only the now-unused V1 `.request-workspace` layout rules from `src/app.css`. Do not delete request-config modules because `/v2` uses them. Do not add tests whose purpose is asserting that removed UI remains absent.

- [ ] **Step 4: Verify V1 GREEN and V2 regressions**

Run:

```bash
npm test -- --run src/app.test.jsx src/v2/tests/app.test.jsx src/components/request-config-editor/tests/index.test.jsx
```

Expected: PASS, proving original V1 composition and V2 editor reuse.

- [ ] **Step 5: Document routes and shared components**

Add a README section stating:

```markdown
## Console versions

- `/` renders the original V1 composition: endpoint header, parameter builder, and newest-first request results.
- `/v2` renders the React 18 workspace using `@wordpress/components`.
- Both routes reuse the same endpoint-selection `Header` and request-history `Results` components.
- The shareable request configuration JSON editor is available only in `/v2`.
- Path parameters stay in the shared endpoint bar; V2 exposes Query and Body tabs in its parameter workspace.
```

- [ ] **Step 6: Run proactive diagnostics**

Run LSP diagnostics over `src/app.jsx`, `src/index.jsx`, `src/root-app.jsx`, and `src/v2/`. Resolve every blocking diagnostic before continuing.

- [ ] **Step 7: Run the full test suite and both builds**

Run:

```bash
npm test -- --run
npm run build
npm run build-wpcom
```

Expected: all tests PASS and both builds exit 0. Record unchanged legacy CSS warnings separately.

- [ ] **Step 8: Manually inspect both routes**

Verify `http://localhost:3000/` has the original V1 composition and `http://localhost:3000/v2` has the new WordPress Components workspace. On V2, validate Query/Body synchronization, JSON debounce without submission, the shared endpoint bar, and the shared newest-first results behavior.

- [ ] **Step 9: Run final repository checks and commit**

Run:

```bash
git diff --check
git status --short
```

Then run `lens_diagnostics` with `mode=all`. Commit the V1 restoration, README, V2 files, design, and plan locally after all checks pass.

## Self-review

- Spec coverage: `/` restored to its original Header/QueryBuilder/Results composition; `/v2` added; V1 header and V1 `Results` reused by V2; JSON editor only in V2; Path removed from V2 tabs; React 18 and WordPress Components included for the new workspace; responsive and accessibility requirements have explicit tasks.
- Security coverage: no task exports results/history/auth/user/token/cookie data; request-config regression tests remain mandatory.
- Placeholder scan: no TBD/TODO/future implementation placeholders are present.
- Type consistency: V2 introduces no result type or history state; parameter actions retain `( param, value )`; path remains owned by `LookupContainer`; results remain owned by the existing connected `Results` component.
