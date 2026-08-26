# V2 WordPress Components Console Design

## Goal

Add a functional `/v2` console with a new request workspace built using `@wordpress/components` on React 18, while restoring `/` to the original V1 composition and reusing the V1 endpoint-selection header and request-results history in both versions.

## Confirmed decisions

- `/` is restored to the original V1 composition from before the shareable request workspace: `Header`, `QueryBuilder`, then `Results`.
- The request configuration JSON editor is available only in `/v2`; its schema/state modules remain shared infrastructure.
- `/v2` renders a separate V2 application shell.
- The V1 `Header` component is reused directly in V2. Its API selector, version selector, method selector, endpoint lookup, path-value inputs, submit control, and user menu are not copied or reimplemented.
- Because path values remain editable in the reused V1 header, V2 does not add a Path parameter tab.
- V2 parameter navigation contains Query and Body tabs only.
- Endpoint-discovery parameter types are displayed as read-only badges.
- V2 uses React 18 and `@wordpress/components` for its new request-workspace cards, buttons, tabs, form controls, notices, and empty states.
- The request configuration JSON remains the same secure schema-v1 document and keeps the existing bidirectional synchronization behavior.
- The V1 `Results` component is reused directly below the V2 workspace. Its newest-first sequence of executed requests, per-request response view, copy/download actions, loading, duration, and error behavior are not copied or reimplemented.
- Imported JSON never executes a request automatically.
- Request history, results, authentication, tokens, cookies, and user data remain excluded from exported request configuration JSON.
- Work remains local; no remote artifacts are created.

## Route and application shell

`src/index.jsx` moves to React 18 `createRoot`. A small pathname boundary chooses the existing `App` for normal paths and `V2App` for `/v2` and `/v2/`. No routing library is added because only one static route boundary is required.

Both applications use the same Redux store. V1 renders its original `Header`, `QueryBuilder`, and `Results` sequence without the shareable JSON workspace. `V2App` renders the existing `Header` unchanged, followed by the V2-only request workspace (including the existing request-config editor) and the existing `Results` component unchanged. Reusing the same components and store preserves endpoint discovery, OAuth, parameter actions, request submission, request history/results, and request-configuration behavior without parallel implementations.

## Dependency migration

- Upgrade `react` and `react-dom` to React 18.
- Add `@wordpress/components` and its published stylesheet.
- Upgrade `react-redux` to the React-18-compatible 8.x line.
- Upgrade legacy packages with maintained React 18 releases when available (`react-json-tree`, `react-tagsinput`).
- Keep the V1 endpoint bar implementation and its focused packages unless a package is proven to break under React 18.
- Migrate component tests from `ReactDOM.render`/`unmountComponentAtNode` to React 18 roots.

## V1 restoration

`src/app.jsx` returns to the positive original composition `Header` → `QueryBuilder` → `Results`. The V1 route does not render `RequestConfigEditor` or the two-column `.request-workspace` wrapper. Tests assert the original component order and behavior; they do not add negative assertions that removed UI is absent.

The React 18 runtime migration and shared request-config state modules remain because `/v2` uses them; restoring V1 concerns route composition, not reverting shared infrastructure.

## Request workspace

The V2 workspace has two columns on desktop and one column on narrow screens:

1. **Parameters card**
   - Query and Body tabs.
   - One row per discovered parameter.
   - Parameter name, static type badge, value control, and clear action.
   - Discovery `description` text is available from a keyboard-focusable help control using `@wordpress/components` `Tooltip`, without increasing row height.
   - V1-like compact density uses 12–13 px typography, 4 px vertical row padding, 8 px grid gaps, and approximately 32–36 px controls/rows.
   - The parameter list scrolls internally at a 222 px maximum height while its table header remains sticky.
   - Controls map discovered types to WordPress controls:
     - `boolean` → `ToggleControl`
     - `integer`/`number` → `NumberControl`
     - `array`/`object` → `TextareaControl` with JSON validation, preserving mixed JSON values
     - other values → `TextControl`
   - Values dispatch the existing `setQueryParam` or `setBodyParam` actions.
   - Empty tabs display an explicit empty state.

2. **Request configuration card**
   - Reuses the existing schema-v1 codec, selectors, resolution thunk, secure exclusions, 500 ms debounce, formatting, paste, and copy behavior.
   - The existing editor remains the source of truth; V2 places it in the WordPress component layout rather than creating a second codec or synchronization path.

Path values are intentionally absent from this workspace because they remain in the reused V1 header.

## Request history and response

V2 renders the existing connected `src/components/results` component directly after the new request workspace.

- `getResults` continues to provide newest-first execution order.
- Every request keeps its current independent Tree/JSON response view state.
- Existing method, API, version, path, duration, loading, error, copy, and download behavior remains unchanged.
- No V2 request-history state, selector, list, response viewer, or copy/download path is introduced.
- Results/history remain in-session only and are never included in exported request configuration JSON.

## Responsive behavior

- At desktop widths, parameters and JSON are side by side.
- Below the workspace breakpoint, parameters stack above JSON.
- The reused V1 results continue to flow vertically below the workspace using their existing responsive behavior.
- The reused V1 header keeps its existing responsive behavior and remains the only endpoint-selection implementation.

## Accessibility

- Tabs and form controls use semantics provided by `@wordpress/components`.
- Type badges supplement labels and are not the only parameter identification.
- Existing V1 result controls retain their current keyboard and response-view semantics.
- Loading and errors retain their current result semantics without introducing a second interaction model.
- Focus appearance follows WordPress component defaults plus visible project fallbacks.

## Non-goals

- Reimplementing or visually replacing the V1 endpoint-selection header.
- Adding a third path-value editor.
- Adding a general routing framework.
- Reimplementing or redesigning the V1 request/results history.
- Persisting request/response history across page reloads.
- Exporting history, responses, authentication, user data, cookies, or tokens.
- Automatically submitting requests after JSON import.
- Adding tests whose only purpose is asserting that removed V1 UI remains absent.
