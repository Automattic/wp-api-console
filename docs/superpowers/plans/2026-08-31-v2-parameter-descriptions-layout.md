# V2 Parameter Descriptions Layout Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Widen the V2 parameter panel to 70%, shrink the JSON panel to 30%, and render each parameter description in a visible table column.

**Architecture:** Keep the existing two-card V2 workspace and parameter normalization helpers. Change only the workspace grid ratio, parameter table markup, and responsive table styles; remove the now-redundant tooltip UI.

**Tech Stack:** React 18, Redux, `@wordpress/components`, CSS Grid, Vitest, jsdom.

---

### Task 1: Specify visible parameter descriptions

**Files:**

- Modify: `src/v2/components/parameter-workspace/tests/index.test.jsx`

- [ ] **Step 1: Replace the tooltip behavior test**

Replace the tooltip-focused test with assertions for visible description text, missing-description fallback, and no help button:

```jsx
it( 'shows discovery descriptions in a visible column without tooltip controls', () => {
 renderWorkspace();

 expect(
  container.querySelector( '[data-parameter-description="enabled"]' ).textContent
 ).toBe( 'Whether the feature is enabled.' );
 expect( container.querySelector( '[data-parameter-description="count"]' ).textContent ).toBe(
  '—'
 );
 expect( container.querySelector( '[aria-label="About enabled"]' ) ).toBeNull();
} );
```

- [ ] **Step 2: Update object-description coverage**

Replace the tooltip lookup in the normalization test with:

```jsx
expect( container.querySelector( '[data-parameter-description="context"]' ).textContent ).toBe(
 'display: Use the display context.\nedit: Use the edit context.'
);
```

- [ ] **Step 3: Run the focused test and verify failure**

Run:

```bash
npm test -- --run src/v2/components/parameter-workspace/tests/index.test.jsx
```

Expected: the new description-cell selectors fail because the component still renders tooltip buttons.

### Task 2: Render the description column

**Files:**

- Modify: `src/v2/components/parameter-workspace/index.jsx`

- [ ] **Step 1: Remove the unused Tooltip import**

Remove `Tooltip` from the `@wordpress/components` import list.

- [ ] **Step 2: Add the Description header**

Change the table header to:

```jsx
<div className="v2-parameter-workspace__table-header" aria-hidden="true">
 <span>Parameter</span>
 <span>Type</span>
 <span>Value</span>
 <span>Description</span>
 <span />
</div>
```

- [ ] **Step 3: Replace the tooltip with visible text**

Keep the name cell limited to the parameter name:

```jsx
<div className="v2-parameter-workspace__name-cell">
 <code className="v2-parameter-workspace__name">{ name }</code>
</div>
```

After the value control, add:

```jsx
<p
 className="v2-parameter-workspace__description"
 data-parameter-description={ name }
>
 { description || '—' }
</p>
```

- [ ] **Step 4: Run the focused test**

Run:

```bash
npm test -- --run src/v2/components/parameter-workspace/tests/index.test.jsx
```

Expected: all parameter-workspace tests pass.

### Task 3: Apply the 70/30 and responsive layout

**Files:**

- Modify: `src/v2/style.css`
- Modify: `src/v2/components/parameter-workspace/style.css`

- [ ] **Step 1: Change the workspace columns**

In `src/v2/style.css`, use:

```css
.v2-console__workspace {
 align-items: stretch;
 display: grid;
 grid-template-columns: minmax( 0, 7fr ) minmax( 280px, 3fr );
 gap: 16px;
 padding: 16px;
}
```

Keep the existing single-column rule below 900px.

- [ ] **Step 2: Add the description table column**

Use five desktop columns in `src/v2/components/parameter-workspace/style.css`:

```css
.v2-parameter-workspace__table-header,
.v2-parameter-workspace__row {
 align-items: center;
 display: grid;
 gap: 8px;
 grid-template-columns:
  minmax( 110px, 0.75fr )
  72px
  minmax( 180px, 1.25fr )
  minmax( 180px, 1.5fr )
  auto;
 padding: 4px 12px;
}
```

Remove `.v2-parameter-workspace__help` styles and add:

```css
.v2-parameter-workspace__description {
 color: #646970;
 line-height: 1.4;
 margin: 0;
 min-width: 0;
 overflow-wrap: anywhere;
 white-space: pre-line;
}
```

- [ ] **Step 3: Make descriptions readable on narrow screens**

Inside the existing `@media ( max-width: 600px )` block, add:

```css
.v2-parameter-workspace__description {
 grid-column: 1 / -1;
}
```

No CSS implementation tests are added.

- [ ] **Step 4: Run verification**

Run:

```bash
npm test -- --run src/v2/components/parameter-workspace/tests/index.test.jsx
npm test -- --run
npm run build
```

Expected: focused tests pass, all 207+ tests pass, and the production build completes with only existing legacy warnings.

- [ ] **Step 5: Commit the completed change**

```bash
git add \
  docs/superpowers/specs/2026-08-31-v2-parameter-descriptions-layout-design.md \
  docs/superpowers/plans/2026-08-31-v2-parameter-descriptions-layout.md \
  src/v2/style.css \
  src/v2/components/parameter-workspace/index.jsx \
  src/v2/components/parameter-workspace/style.css \
  src/v2/components/parameter-workspace/tests/index.test.jsx
git commit -m "Improve V2 parameter documentation layout"
```
