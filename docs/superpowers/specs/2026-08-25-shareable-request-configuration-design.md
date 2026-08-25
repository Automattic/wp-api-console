# Shareable Request Configuration Design

## Summary

Add a local-only, versioned JSON format that lets a pull request author copy a fully configured API request into testing instructions. A reviewer can paste the same JSON into WP API Console, validate it, and apply it to the interface without manually reconstructing the API, version, endpoint, path values, query parameters, or body parameters.

The feature never includes authentication data and never sends a request automatically.

## Goals

- Reproduce a configured request faithfully from JSON.
- Make the JSON readable and deterministic for pull request descriptions.
- Keep generation, editing, formatting, copying, and application in one JSON workspace.
- Reject malformed, incompatible, or stale configurations before changing the visible request.
- Preserve the existing browser-only architecture; no server storage, links, collections, or remote services.

## Non-goals

- Sharing OAuth tokens, cookies, authorization headers, or other credentials.
- Encoding configuration in a URL.
- Supporting attached files, Base64 payloads, or local file references.
- Importing Postman collections or other external formats.
- Placeholder or environment-variable substitution in schema version 1.
- Saving a library of configurations.
- Executing a request after applying a configuration.
- Including response data, request history, UI preferences, author, title, or description.

## User workflow

1. The author configures an endpoint in WP API Console.
2. The author clicks **From request** in the JSON workspace.
3. The console creates deterministic, two-space-indented JSON.
4. The author reviews query and body values for sensitive information.
5. The author clicks **Copy JSON** and pastes it into pull request testing instructions.
6. The reviewer copies that JSON into the same editor.
7. Valid JSON is formatted automatically when pasted. The reviewer can also click **Format JSON**.
8. The reviewer clicks **Apply to request**.
9. The console validates and resolves the configuration, then replaces the visible request atomically.
10. The reviewer explicitly triggers the request using the existing submit control.

## Layout and interaction design

The main workspace becomes two equal-width columns:

- **Left column:** Query parameters followed by Body parameters.
- **Right column:** a permanently visible **Request configuration JSON** editor.

There are no import/export tabs and no modal. Generation and application are two directions through the same JSON document.

The editor uses `react-simple-code-editor` with PrismJS JSON highlighting. Both libraries support the project's React 16.14 runtime. Schema version 1 does not add custom line numbers.

The editor exposes four actions:

- **From request:** replace editor text with a freshly generated configuration.
- **Format JSON:** parse and reformat valid editor text with two-space indentation.
- **Copy JSON:** copy the current formatted editor text.
- **Apply to request:** validate, resolve, and apply the editor text without executing it.

Request changes do not overwrite edited JSON automatically. Synchronization from the interface is always explicit through **From request**.

When valid JSON is pasted, the paste handler formats it immediately. Invalid pasted JSON remains editable and produces an inline parse error. Clipboard failure also produces an inline error and preserves the editor text.

## JSON contract

Schema version 1 has this shape:

```json
{
  "schemaVersion": 1,
  "request": {
    "api": "WP.COM API",
    "version": "v1.1",
    "method": "GET",
    "endpoint": "/sites/$site/comments/$comment_ID",
    "pathValues": {
      "$site": "example.wordpress.com",
      "$comment_ID": "42"
    },
    "queryParams": {
      "context": "display"
    },
    "bodyParams": {}
  }
}
```

### Contract rules

- `schemaVersion` must equal the number `1`.
- All documented object properties are required.
- Unknown object properties are rejected at every schema level.
- `api`, `version`, `method`, and `endpoint` are non-empty strings.
- `pathValues`, `queryParams`, and `bodyParams` are objects with string keys and JSON-serializable values.
- Values may be strings, numbers, booleans, `null`, arrays, or objects.
- Present values are preserved, including `""`, `false`, `0`, and `null`.
- JavaScript `undefined`, functions, symbols, cyclic objects, and files are rejected or cannot enter the JSON contract.
- Maps are emitted with lexicographically sorted keys.
- Top-level and request properties are emitted in the fixed order shown above.
- Formatting uses `JSON.stringify(config, null, 2)` and one trailing newline.

The contract stores a stable endpoint identity rather than serializing the complete endpoint discovery object. Endpoint identity is the tuple `api + version + method + endpoint`, where `endpoint` is the current `pathLabeled` value.

## Architecture

### 1. Request configuration codec

A pure codec owns the external format. It:

- builds an allowlisted configuration object from Redux selectors;
- validates JSON-serializability;
- sorts parameter maps;
- parses JSON text;
- validates the strict versioned schema;
- formats valid configuration deterministically;
- returns structured errors rather than mutating application state.

The codec receives only the selected API, selected version, selected endpoint, and request values. It never receives the security, history, results, versions, or endpoint-cache slices, which makes credential exclusion structural rather than heuristic.

### 2. Exact API lookup and endpoint resolution

The existing `api.get(name)` falls back to the default API when a name is unknown. Import validation must not use that fallback. Add an exact lookup that returns no API for an unknown name.

After schema validation, the resolver:

1. resolves the API by exact name;
2. calls the API's version loader and verifies the requested version;
3. loads discovery data without changing the selected API or version;
4. parses the discovered endpoints through the existing API adapter;
5. finds exactly one endpoint whose `method` and `pathLabeled` match the configuration;
6. validates path, query, and body keys against that canonical endpoint;
7. verifies that every endpoint path placeholder has a supplied value;
8. returns the canonical endpoint and normalized request values.

Discovery loading should be extracted into a shared promise-returning helper. The current endpoint-loading Redux thunk can dispatch the helper's result, while the configuration resolver can call the helper without dispatching intermediate UI state.

Zero endpoint matches produce an unknown-endpoint error. Multiple matches produce an ambiguous-endpoint error. Network and response-parsing failures remain distinct from compatibility failures.

### 3. Atomic Redux application

Only a fully parsed, schema-valid, and resolved configuration can dispatch `REQUEST_CONFIG_APPLY`.

The single action contains:

- exact API name;
- exact version;
- canonical endpoint object;
- path values;
- query values;
- body values.

The `ui` reducer handles the action by replacing `api` and `version`. The `request` reducer handles the same action by replacing its complete state with the canonical endpoint, endpoint method, empty manual URL, and imported parameter values. Redux invokes both slice reducers during one dispatch, so observers never see a partially imported request.

The action does not modify results, history, endpoint cache, or credentials. After a successful application, the normal authentication boot process may run for a newly selected API, but no credential is read from the configuration and no API request is submitted automatically.

### 4. JSON editor component

A dedicated connected component owns draft editor text, formatting status, validation/resolution progress, and inline errors. Draft text remains local component state because it is not application request state and should not enter the existing Redux persistence cache.

The component obtains the current request configuration through selectors for **From request**. It dispatches the asynchronous resolve-and-apply thunk only for **Apply to request**.

## Data flow

### Generate from the interface

```text
Redux selectors
  -> allowlisted configuration object
  -> JSON-serializability check
  -> stable key ordering
  -> deterministic formatting
  -> local editor draft
```

### Apply from JSON

```text
Editor draft
  -> JSON parse
  -> strict schema validation
  -> exact API lookup
  -> version verification
  -> endpoint discovery and canonical resolution
  -> parameter compatibility validation
  -> one REQUEST_CONFIG_APPLY dispatch
  -> updated interface, no request execution
```

Every failure before the final dispatch leaves the current request unchanged.

## Validation and errors

The editor displays a specific actionable error for:

- malformed JSON;
- missing or unsupported `schemaVersion`;
- missing required property;
- unknown property;
- invalid property type;
- non-serializable generated value;
- unknown API;
- unavailable version;
- discovery network failure;
- invalid discovery response;
- unknown endpoint;
- ambiguous endpoint identity;
- unknown path, query, or body parameter;
- missing endpoint path value;
- clipboard permission or API failure.

While resolution is active, **Apply to request** is disabled to prevent concurrent applications. Other request controls remain visible, but the eventual atomic action applies only the configuration that was validated.

## Security and privacy

- Authentication data is absent from the schema.
- Export uses an explicit allowlist, not Redux-state serialization.
- Tokens, cookies, authorization headers, user profiles, results, and history never enter codec input.
- Imported JSON is parsed only as data and is never evaluated as JavaScript.
- The editor shows a permanent warning that query and body values may contain sensitive data.
- Version 1 allows real query and body values by product decision; placeholder support is deferred to a future schema version.
- No configuration is uploaded or stored by this feature. The existing persistence of the active console request remains unchanged.

## Testing strategy

### Codec unit tests

- Generate the exact schema from representative Redux selector values.
- Produce stable property and map ordering.
- Preserve empty strings, `false`, `0`, `null`, arrays, and nested objects.
- Reject cyclic and otherwise non-serializable generated values.
- Round-trip a valid configuration through format and parse.
- Prove that sentinel credentials in unrelated state do not appear in output.

### Schema unit tests

- Accept the documented schema version 1 example.
- Reject unknown properties at every level.
- Reject missing properties and wrong types.
- Reject unsupported schema versions.

### Resolver unit tests

- Resolve an exact API, version, method, and path.
- Reject fallback to the default API.
- Reject unavailable versions.
- Distinguish discovery failure, no match, and multiple matches.
- Reject unknown parameter keys and missing path values.
- Return the canonical discovered endpoint object.

### Redux unit tests

- Apply API, version, canonical endpoint, and all parameter values in one action.
- Replace rather than merge previous request values.
- Leave results, history, endpoint cache, and security slices unchanged for the apply action.
- Confirm no request-trigger action is dispatched.

### Editor component tests

- Generate formatted JSON from the current request.
- Format valid pasted JSON immediately.
- Preserve invalid pasted text and display a parse error.
- Format valid text on demand.
- Copy exactly the formatted editor text.
- Report clipboard failure.
- Disable application while resolution is active.
- Display resolver errors without changing the request.
- Dispatch application only after successful validation and resolution.

### Final verification

- Run the complete Vitest suite.
- Run the production Vite build.
- Confirm the browser workflow manually for both a WP.COM API endpoint and a WP REST API namespace.

## Alternatives considered

### Replay existing Redux actions

Selecting API, version, endpoint, and individual parameters through existing actions would minimize new reducer code. It was rejected because endpoint discovery is asynchronous and observers could see incomplete intermediate states.

### Serialize the complete Redux state

The existing local-storage serializer could provide a quick export. It was rejected because it contains internal, unstable, irrelevant, and potentially sensitive state.

### Serialize the complete endpoint object

Embedding discovery metadata would avoid endpoint lookup. It was rejected because snapshots become stale, enlarge pull request instructions, and allow imported data to define endpoint behavior rather than resolving the canonical endpoint.

### Existing `react-json-tree`

The project already uses this library for response visualization. It was rejected for this feature because it is read-only and does not support raw JSON paste/edit workflows.

### `@uiw/react-codemirror`

The current release was rejected because it requires React 17 while this project uses React 16.14.

### `vanilla-jsoneditor`

It was rejected as excessive for schema version 1 because its unpacked package and dependency surface are much larger than the required editing, highlighting, formatting, and validation capabilities.

## Acceptance criteria

- A developer can generate deterministic JSON from a selected, fully configured endpoint.
- The generated JSON includes API, version/namespace, method, endpoint identity, path values, query values, and body values.
- The generated JSON excludes authentication and unrelated application state.
- A reviewer can paste the JSON, see it formatted, and apply it without manual form entry.
- Applying valid JSON reproduces the request exactly and does not execute it.
- Invalid, incompatible, or unresolved JSON leaves the current request unchanged and presents an actionable error.
- Query and Body are stacked in the left half of the main workspace.
- The single editable JSON workspace occupies the right half.
- All automated tests and the production build pass.
