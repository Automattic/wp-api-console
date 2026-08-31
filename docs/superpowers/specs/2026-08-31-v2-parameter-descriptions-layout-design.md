# V2 Parameter Descriptions Layout Design

## Goal

Give request parameters more horizontal space and make endpoint documentation visible without requiring tooltip interaction.

## Desktop layout

The V2 request workspace uses a 70% / 30% split:

- **Request parameters:** 70%
- **Request configuration JSON:** 30%

The existing 16px gap remains between the panels.

## Responsive layout

Below 900px, the workspace keeps its existing single-column layout. The request parameters panel appears before the request configuration panel.

## Parameter table

The table displays these columns:

1. Parameter
2. Type
3. Value
4. Description
5. Clear action

Descriptions are rendered as visible text. The existing information icon and tooltip are removed to avoid duplicate documentation. Parameters without a description display an em dash (`—`).

On narrow screens, the description moves to its own row within the parameter entry so it remains readable.

## Accessibility

Description text is part of the document flow and does not require pointer hover or keyboard focus. Existing labels for value controls and clear actions remain unchanged.

## Testing

Update existing component tests to verify visible descriptions, normalized object descriptions, the missing-description fallback, and removal of tooltip controls. Do not add CSS implementation tests.

Run focused component tests, the full test suite, and the production build.
