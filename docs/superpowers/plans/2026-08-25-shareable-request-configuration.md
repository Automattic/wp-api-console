# Shareable Request Configuration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a local, strict, versioned JSON workspace that reproduces a configured API request without sharing authentication data or executing the request automatically.

**Architecture:** A pure request-configuration codec owns parsing, strict schema validation, stable formatting, and allowlisted generation. An asynchronous resolver verifies API/version/endpoint references against live discovery before one Redux action atomically replaces the selected API, version, and request. A permanent React JSON editor occupies the right half of the request workspace while Query and Body are stacked on the left.

**Tech Stack:** React 16.14, Redux 4 with redux-thunk, Vitest/jsdom, `is-my-json-valid`, `react-simple-code-editor`, PrismJS, Vite 6.

---

## Scope and file map

### New production files

- `src/request-config/errors.js` — typed request-configuration errors.
- `src/request-config/schema.js` — strict external schema version 1.
- `src/request-config/codec.js` — allowlisted generation, serialization checks, parse, validation, stable formatting.
- `src/request-config/resolve.js` — exact API/version/endpoint/parameter resolution.
- `src/api/discovery.js` — shared promise-returning endpoint discovery helper.
- `src/state/request-config/selectors.js` — allowlisted Redux-to-codec input selector.
- `src/state/request-config/actions.js` — validate, resolve, atomically apply, then boot selected API authentication.
- `src/components/request-config-editor/index.jsx` — connected JSON editor and actions.
- `src/components/request-config-editor/style.css` — right-column editor layout and status styles.

### New test files

- `src/request-config/tests/codec.test.js`
- `src/request-config/tests/resolve.test.js`
- `src/api/tests/discovery.test.js`
- `src/state/request-config/tests/selectors.test.js`
- `src/state/request-config/tests/actions.test.js`
- `src/components/request-config-editor/tests/index.test.jsx`

### Existing files to modify

- `package.json`, `package-lock.json` — editor and syntax-highlighting dependencies.
- `src/api/index.js` — exact API lookup.
- `src/state/endpoints/actions.js` — reuse promise-returning discovery helper.
- `src/state/actions.js` — atomic apply action type.
- `src/state/ui/reducer.js` — apply imported API and version.
- `src/state/request/reducer.js` — replace the complete request atomically.
- `src/state/ui/tests/reducer.test.js` — add UI apply coverage; create this file because the slice currently only has selector tests.
- `src/state/request/tests/reducer.test.js` — add complete replacement coverage.
- `src/app.jsx` — render the two-column request workspace.
- `src/app.css` — workspace grid and responsive layout.
- `src/components/query-builder/style.css` — stack Query above Body.
- `README.md` — document the shareable configuration workflow and security boundary.

## Task 1: Add the compatible JSON editor dependencies

**Files:**

- Modify: `package.json`
- Modify: `package-lock.json`

- [ ] **Step 1: Confirm the baseline suite passes before dependency changes**

Run:

```bash
cd /Users/gabriel/Projects/wp-api-console
npm test -- --run
```

Expected: 19 test files and 89 tests pass.

- [ ] **Step 2: Install React 16-compatible editor packages**

Run:

```bash
npm install --legacy-peer-deps react-simple-code-editor@^0.14.1 prismjs@^1.30.0
```

Expected: `package.json` lists both packages under `dependencies`; `package-lock.json` is updated without changing the React major version.

- [ ] **Step 3: Verify dependency installation did not break the suite**

Run:

```bash
npm test -- --run
```

Expected: all existing tests pass.

- [ ] **Step 4: Commit the dependency change**

```bash
git add package.json package-lock.json
git commit -m "build: add request configuration editor dependencies"
```

## Task 2: Build the strict versioned codec

**Files:**

- Create: `src/request-config/errors.js`
- Create: `src/request-config/schema.js`
- Create: `src/request-config/codec.js`
- Create: `src/request-config/tests/codec.test.js`

- [ ] **Step 1: Write failing codec tests**

Create `src/request-config/tests/codec.test.js`:

```js
import {
 createRequestConfig,
 formatJsonText,
 formatRequestConfig,
 parseRequestConfig,
} from '../codec';
import { RequestConfigError } from '../errors';

const source = {
 api: 'WP.COM API',
 version: 'v1.1',
 endpoint: {
  method: 'POST',
  pathLabeled: '/sites/$site/comments/new',
  request: {
   path: { $site: { type: 'string' } },
   query: { z: {}, empty: {}, disabled: {}, count: {} },
   body: { metadata: {}, content: {} },
  },
 },
 pathValues: { $site: 'example.wordpress.com', ignored: 'secret' },
 queryParams: { z: 'last', empty: '', disabled: false, count: 0, ignored: 'secret' },
 bodyParams: { metadata: { zebra: 1, alpha: null }, content: 'Hello', ignored: 'secret' },
};

it( 'creates an allowlisted version 1 configuration', () => {
 expect( createRequestConfig( source ) ).toEqual( {
  schemaVersion: 1,
  request: {
   api: 'WP.COM API',
   version: 'v1.1',
   method: 'POST',
   endpoint: '/sites/$site/comments/new',
   pathValues: { $site: 'example.wordpress.com' },
   queryParams: { count: 0, disabled: false, empty: '', z: 'last' },
   bodyParams: { content: 'Hello', metadata: { alpha: null, zebra: 1 } },
  },
 } );
} );

it( 'formats deterministically with two spaces and one trailing newline', () => {
 const formatted = formatRequestConfig( createRequestConfig( source ) );
 expect( formatted ).toBe( JSON.stringify( createRequestConfig( source ), null, 2 ) + '\n' );
} );

it( 'formats valid pasted JSON without requiring the request schema', () => {
 expect( formatJsonText( '{"b":2,"a":1}' ) ).toBe( '{\n  "a": 1,\n  "b": 2\n}\n' );
} );

it( 'preserves contract field order when formatting configuration text', () => {
 const config = createRequestConfig( source );
 expect( formatJsonText( JSON.stringify( config ) ) ).toBe( formatRequestConfig( config ) );
} );

it( 'round-trips a valid request configuration', () => {
 const config = createRequestConfig( source );
 expect( parseRequestConfig( formatRequestConfig( config ) ) ).toEqual( config );
} );

it.each( [
 [ 'extra top-level property', { schemaVersion: 1, request: createRequestConfig( source ).request, extra: true } ],
 [ 'unsupported version', { schemaVersion: 2, request: createRequestConfig( source ).request } ],
 [ 'missing request field', { schemaVersion: 1, request: { api: 'WP.COM API' } } ],
] )( 'rejects %s', ( label, value ) => {
 expect( () => parseRequestConfig( JSON.stringify( value ) ) )
  .toThrow( RequestConfigError );
} );

it( 'rejects malformed JSON with a parse error code', () => {
 try {
  parseRequestConfig( '{' );
  throw new Error( 'Expected parseRequestConfig to throw' );
 } catch ( error ) {
  expect( error ).toBeInstanceOf( RequestConfigError );
  expect( error.code ).toBe( 'INVALID_JSON' );
 }
} );

it( 'rejects generation when a path value is missing', () => {
 try {
  createRequestConfig( { ...source, pathValues: {} } );
  throw new Error( 'Expected createRequestConfig to throw' );
 } catch ( error ) {
  expect( error ).toMatchObject( { code: 'MISSING_PATH_VALUE' } );
 }
} );

it.each( [
 [ 'undefined', { value: undefined } ],
 [ 'function', { value: () => true } ],
 [ 'non-finite number', { value: Number.POSITIVE_INFINITY } ],
] )( 'rejects non-JSON %s values', ( label, metadata ) => {
 expect( () => createRequestConfig( {
  ...source,
  bodyParams: { metadata, content: 'Hello' },
 } ) ).toThrow( RequestConfigError );
} );

it( 'rejects cyclic generated values', () => {
 const cyclic = {};
 cyclic.self = cyclic;
 expect( () => createRequestConfig( {
  ...source,
  bodyParams: { metadata: cyclic, content: 'Hello' },
 } ) ).toThrow( RequestConfigError );
} );
```

- [ ] **Step 2: Run the codec tests and verify failure**

Run:

```bash
npm test -- --run src/request-config/tests/codec.test.js
```

Expected: FAIL because `../codec` and `../errors` do not exist.

- [ ] **Step 3: Add the typed error**

Create `src/request-config/errors.js`:

```js
export class RequestConfigError extends Error {
 constructor( code, message, details = [] ) {
  super( message );
  this.name = 'RequestConfigError';
  this.code = code;
  this.details = details;
 }
}
```

- [ ] **Step 4: Add the strict schema**

Create `src/request-config/schema.js`:

```js
const valuesSchema = {
 type: 'object',
 additionalProperties: true,
};

export default {
 type: 'object',
 additionalProperties: false,
 required: [ 'schemaVersion', 'request' ],
 properties: {
  schemaVersion: {
   type: 'number',
   enum: [ 1 ],
  },
  request: {
   type: 'object',
   additionalProperties: false,
   required: [
    'api',
    'version',
    'method',
    'endpoint',
    'pathValues',
    'queryParams',
    'bodyParams',
   ],
   properties: {
    api: { type: 'string', minLength: 1 },
    version: { type: 'string', minLength: 1 },
    method: { type: 'string', minLength: 1 },
    endpoint: { type: 'string', minLength: 1 },
    pathValues: valuesSchema,
    queryParams: valuesSchema,
    bodyParams: valuesSchema,
   },
  },
 },
};
```

- [ ] **Step 5: Implement the codec**

Create `src/request-config/codec.js`:

```js
import validator from 'is-my-json-valid';

import { RequestConfigError } from './errors';
import schema from './schema';

const validate = validator( schema, { greedy: true } );
const hasOwn = ( object, key ) => Object.prototype.hasOwnProperty.call( object, key );

const assertJsonValue = ( value, seen = new Set(), path = '$' ) => {
 if ( value === null || 'string' === typeof value || 'boolean' === typeof value ) {
  return;
 }
 if ( 'number' === typeof value ) {
  if ( Number.isFinite( value ) ) {
   return;
  }
  throw new RequestConfigError( 'NON_SERIALIZABLE_VALUE', `${ path } is not a finite number.` );
 }
 if ( 'object' !== typeof value ) {
  throw new RequestConfigError( 'NON_SERIALIZABLE_VALUE', `${ path } is not JSON serializable.` );
 }
 if ( seen.has( value ) ) {
  throw new RequestConfigError( 'NON_SERIALIZABLE_VALUE', `${ path } contains a cycle.` );
 }
 const prototype = Object.getPrototypeOf( value );
 if ( ! Array.isArray( value ) && prototype !== Object.prototype && prototype !== null ) {
  throw new RequestConfigError( 'NON_SERIALIZABLE_VALUE', `${ path } is not a plain JSON object.` );
 }
 seen.add( value );
 if ( Array.isArray( value ) ) {
  value.forEach( ( item, index ) => assertJsonValue( item, seen, `${ path }[${ index }]` ) );
 } else {
  Object.keys( value ).forEach( key => assertJsonValue( value[ key ], seen, `${ path }.${ key }` ) );
 }
 seen.delete( value );
};

const sortJsonValue = value => {
 if ( Array.isArray( value ) ) {
  return value.map( sortJsonValue );
 }
 if ( value && 'object' === typeof value ) {
  return Object.keys( value ).sort().reduce( ( sorted, key ) => {
   sorted[ key ] = sortJsonValue( value[ key ] );
   return sorted;
  }, {} );
 }
 return value;
};

const pickDefinedValues = ( definitions = {}, values = {} ) => {
 return Object.keys( definitions ).sort().reduce( ( selected, key ) => {
  if ( hasOwn( values, key ) && undefined !== values[ key ] ) {
   assertJsonValue( values[ key ], new Set(), `$.${ key }` );
   selected[ key ] = sortJsonValue( values[ key ] );
  }
  return selected;
 }, {} );
};

export const createRequestConfig = source => {
 if ( ! source.endpoint ) {
  throw new RequestConfigError( 'MISSING_ENDPOINT', 'Select an endpoint before generating JSON.' );
 }
 const requestDefinition = source.endpoint.request || {};
 const pathDefinitions = requestDefinition.path || {};
 const pathValues = pickDefinedValues( pathDefinitions, source.pathValues );
 const missingPathValues = Object.keys( pathDefinitions ).filter( key => ! hasOwn( pathValues, key ) );
 if ( missingPathValues.length ) {
  throw new RequestConfigError(
   'MISSING_PATH_VALUE',
   `Missing path value: ${ missingPathValues.join( ', ' ) }.`
  );
 }
 return {
  schemaVersion: 1,
  request: {
   api: source.api,
   version: source.version,
   method: source.endpoint.method,
   endpoint: source.endpoint.pathLabeled,
   pathValues,
   queryParams: pickDefinedValues( requestDefinition.query, source.queryParams ),
   bodyParams: pickDefinedValues( requestDefinition.body, source.bodyParams ),
  },
 };
};

const formatValue = value => {
 assertJsonValue( value );
 return JSON.stringify( sortJsonValue( value ), null, 2 ) + '\n';
};

export const formatJsonText = text => {
 try {
  const parsed = JSON.parse( text );
  return validate( parsed ) ? formatRequestConfig( parsed ) : formatValue( parsed );
 } catch ( error ) {
  if ( error instanceof RequestConfigError ) {
   throw error;
  }
  throw new RequestConfigError( 'INVALID_JSON', error.message );
 }
};

export const formatRequestConfig = config => {
 const request = config.request;
 const ordered = {
  schemaVersion: config.schemaVersion,
  request: {
   api: request.api,
   version: request.version,
   method: request.method,
   endpoint: request.endpoint,
   pathValues: sortJsonValue( request.pathValues ),
   queryParams: sortJsonValue( request.queryParams ),
   bodyParams: sortJsonValue( request.bodyParams ),
  },
 };
 assertJsonValue( ordered );
 return JSON.stringify( ordered, null, 2 ) + '\n';
};

export const parseRequestConfig = text => {
 let parsed;
 try {
  parsed = JSON.parse( text );
 } catch ( error ) {
  throw new RequestConfigError( 'INVALID_JSON', error.message );
 }
 if ( ! validate( parsed ) ) {
  const details = ( validate.errors || [] ).map( error => `${ error.field || 'data' } ${ error.message }` );
  throw new RequestConfigError( 'INVALID_SCHEMA', details.join( '; ' ), details );
 }
 assertJsonValue( parsed );
 return parsed;
};
```

- [ ] **Step 6: Run codec tests and verify they pass**

Run:

```bash
npm test -- --run src/request-config/tests/codec.test.js
```

Expected: all codec tests pass.

- [ ] **Step 7: Commit the codec**

```bash
git add src/request-config
git commit -m "feat: add request configuration codec"
```

## Task 3: Add allowlisted state selection

**Files:**

- Create: `src/state/request-config/selectors.js`
- Create: `src/state/request-config/tests/selectors.test.js`

- [ ] **Step 1: Write the failing selector security test**

Create `src/state/request-config/tests/selectors.test.js`:

```js
import { getRequestConfigSource } from '../selectors';

it( 'selects only request configuration inputs', () => {
 const endpoint = { method: 'GET', pathLabeled: '/me', request: {} };
 const state = {
  ui: { api: 'WP.COM API', version: 'v1.1', theme: 'private' },
  request: {
   endpoint,
   pathValues: { $site: 'example.wordpress.com' },
   queryParams: { context: 'display' },
   bodyParams: { content: 'Hello' },
   url: '/private-url',
  },
  security: { token: 'never-export-this-token' },
  results: { body: { private: true } },
  history: { secret: true },
 };

 const selected = getRequestConfigSource( state );
 expect( selected ).toEqual( {
  api: 'WP.COM API',
  version: 'v1.1',
  endpoint,
  pathValues: { $site: 'example.wordpress.com' },
  queryParams: { context: 'display' },
  bodyParams: { content: 'Hello' },
 } );
 expect( JSON.stringify( selected ) ).not.toContain( 'never-export-this-token' );
} );
```

- [ ] **Step 2: Run the selector test and verify failure**

Run:

```bash
npm test -- --run src/state/request-config/tests/selectors.test.js
```

Expected: FAIL because `../selectors` does not exist.

- [ ] **Step 3: Implement the allowlisted selector**

Create `src/state/request-config/selectors.js`:

```js
export const getRequestConfigSource = state => ( {
 api: state.ui.api,
 version: state.ui.version,
 endpoint: state.request.endpoint,
 pathValues: state.request.pathValues,
 queryParams: state.request.queryParams,
 bodyParams: state.request.bodyParams,
} );
```

- [ ] **Step 4: Run selector and codec tests**

Run:

```bash
npm test -- --run src/state/request-config/tests/selectors.test.js src/request-config/tests/codec.test.js
```

Expected: both test files pass.

- [ ] **Step 5: Commit the selector**

```bash
git add src/state/request-config
git commit -m "feat: select shareable request state"
```

## Task 4: Share endpoint discovery and add exact API lookup

**Files:**

- Create: `src/api/discovery.js`
- Create: `src/api/tests/discovery.test.js`
- Modify: `src/api/index.js`
- Modify: `src/state/endpoints/actions.js`

- [ ] **Step 1: Write failing discovery tests**

Create `src/api/tests/discovery.test.js`:

```js
import { fetchEndpoints } from '../discovery';

it( 'fetches and parses endpoint discovery', async () => {
 const endpoints = [ { method: 'GET', pathLabeled: '/me' } ];
 const api = {
  getDiscoveryUrl: vi.fn( () => 'https://example.com/help' ),
  parseEndpoints: vi.fn( body => body.endpoints ),
 };
 const set = vi.fn( () => Promise.resolve( { body: { endpoints } } ) );
 const http = { get: vi.fn( () => ( { set } ) ) };

 await expect( fetchEndpoints( api, 'v1.1', http ) ).resolves.toEqual( endpoints );
 expect( http.get ).toHaveBeenCalledWith( 'https://example.com/help' );
 expect( set ).toHaveBeenCalledWith( 'accept', 'application/json' );
} );

it( 'propagates discovery failures', async () => {
 const failure = new Error( 'network down' );
 const api = { getDiscoveryUrl: () => 'https://example.com/help' };
 const http = { get: () => ( { set: () => Promise.reject( failure ) } ) };
 await expect( fetchEndpoints( api, 'v1.1', http ) ).rejects.toBe( failure );
} );
```

- [ ] **Step 2: Run the discovery tests and verify failure**

Run:

```bash
npm test -- --run src/api/tests/discovery.test.js
```

Expected: FAIL because `../discovery` does not exist.

- [ ] **Step 3: Implement the shared discovery helper**

Create `src/api/discovery.js`:

```js
import superagent from 'superagent';

export const fetchEndpoints = ( api, version, http = superagent ) => {
 return http
  .get( api.getDiscoveryUrl( version ) )
  .set( 'accept', 'application/json' )
  .then( response => api.parseEndpoints( response.body ) );
};
```

- [ ] **Step 4: Add exact API lookup without changing existing fallback behavior**

In `src/api/index.js`, replace the final exports with:

```js
export const apis = APIs.map( api => api.name );
export const getDefault = () => APIs[ 0 ];
export const findByName = name => APIs.find( api => api.name === name );
export const get = name => findByName( name ) || getDefault();
```

- [ ] **Step 5: Reuse the helper and return its promise from endpoint loading**

Replace `src/state/endpoints/actions.js` with:

```js
import { API_ENDPOINTS_RECEIVE } from '../actions';
import { fetchEndpoints } from '../../api/discovery';
import { get } from '../../api';

const receiveEndpoints = ( apiName, version, endpoints ) => {
 return {
  type: API_ENDPOINTS_RECEIVE,
  payload: {
   apiName,
   version,
   endpoints,
  },
 };
};

export const loadEndpoints = ( apiName, version ) => dispatch => {
 const api = get( apiName );
 return fetchEndpoints( api, version ).then( endpoints => {
  dispatch( receiveEndpoints( apiName, version, endpoints ) );
  return endpoints;
 } );
};
```

- [ ] **Step 6: Run API and endpoint tests**

Run:

```bash
npm test -- --run src/api/tests src/state/endpoints/tests
```

Expected: discovery tests and all existing API/endpoint tests pass.

- [ ] **Step 7: Commit discovery changes**

```bash
git add src/api src/state/endpoints/actions.js
git commit -m "refactor: share endpoint discovery loading"
```

## Task 5: Resolve imported references before changing state

**Files:**

- Create: `src/request-config/resolve.js`
- Create: `src/request-config/tests/resolve.test.js`

- [ ] **Step 1: Write failing resolver tests**

Create `src/request-config/tests/resolve.test.js`:

```js
import { resolveRequestConfig } from '../resolve';
import { RequestConfigError } from '../errors';

const endpoint = {
 method: 'GET',
 pathLabeled: '/sites/$site/comments/$comment_ID',
 request: {
  path: { $site: {}, $comment_ID: {} },
  query: { context: {}, pretty: {} },
  body: {},
 },
};

const config = {
 schemaVersion: 1,
 request: {
  api: 'WP.COM API',
  version: 'v1.1',
  method: 'GET',
  endpoint: '/sites/$site/comments/$comment_ID',
  pathValues: { $site: 'example.wordpress.com', $comment_ID: '42' },
  queryParams: { context: 'display' },
  bodyParams: {},
 },
};

const createDependencies = overrides => ( {
 findApi: vi.fn( () => ( {
  name: 'WP.COM API',
  loadVersions: () => Promise.resolve( { versions: [ 'v1', 'v1.1' ] } ),
 } ) ),
 fetchEndpoints: vi.fn( () => Promise.resolve( [ endpoint ] ) ),
 ...overrides,
} );

it( 'returns the canonical discovered endpoint and values', async () => {
 await expect( resolveRequestConfig( config, createDependencies() ) ).resolves.toEqual( {
  api: 'WP.COM API',
  version: 'v1.1',
  endpoint,
  pathValues: config.request.pathValues,
  queryParams: config.request.queryParams,
  bodyParams: config.request.bodyParams,
 } );
} );

it( 'rejects an unknown API without using a fallback', async () => {
 const dependencies = createDependencies( { findApi: vi.fn( () => undefined ) } );
 await expect( resolveRequestConfig( config, dependencies ) )
  .rejects.toMatchObject( { code: 'UNKNOWN_API' } );
} );

it( 'rejects an unavailable version', async () => {
 const dependencies = createDependencies( {
  findApi: () => ( { loadVersions: () => Promise.resolve( { versions: [ 'v1' ] } ) } ),
 } );
 await expect( resolveRequestConfig( config, dependencies ) )
  .rejects.toMatchObject( { code: 'UNKNOWN_VERSION' } );
} );

it( 'distinguishes discovery failures', async () => {
 const dependencies = createDependencies( {
  fetchEndpoints: () => Promise.reject( new Error( 'network down' ) ),
 } );
 await expect( resolveRequestConfig( config, dependencies ) )
  .rejects.toMatchObject( { code: 'DISCOVERY_FAILED' } );
} );

it( 'rejects unknown and ambiguous endpoints', async () => {
 await expect( resolveRequestConfig( config, createDependencies( {
  fetchEndpoints: () => Promise.resolve( [] ),
 } ) ) ).rejects.toMatchObject( { code: 'UNKNOWN_ENDPOINT' } );

 await expect( resolveRequestConfig( config, createDependencies( {
  fetchEndpoints: () => Promise.resolve( [ endpoint, { ...endpoint } ] ),
 } ) ) ).rejects.toMatchObject( { code: 'AMBIGUOUS_ENDPOINT' } );
} );

it.each( [
 [ 'queryParams', { unknown: true }, 'UNKNOWN_QUERY_PARAM' ],
 [ 'bodyParams', { unknown: true }, 'UNKNOWN_BODY_PARAM' ],
 [ 'pathValues', { $site: 'example.wordpress.com', $comment_ID: '42', $unknown: 'x' }, 'UNKNOWN_PATH_PARAM' ],
] )( 'rejects unknown %s', async ( property, value, code ) => {
 const changed = {
  ...config,
  request: { ...config.request, [ property ]: value },
 };
 await expect( resolveRequestConfig( changed, createDependencies() ) )
  .rejects.toMatchObject( { code } );
} );

it( 'rejects a missing path value', async () => {
 const changed = {
  ...config,
  request: { ...config.request, pathValues: { $site: 'example.wordpress.com' } },
 };
 await expect( resolveRequestConfig( changed, createDependencies() ) )
  .rejects.toMatchObject( { code: 'MISSING_PATH_VALUE' } );
} );

it( 'always rejects with typed request configuration errors', async () => {
 try {
  await resolveRequestConfig( config, createDependencies( { findApi: () => undefined } ) );
  throw new Error( 'Expected resolveRequestConfig to throw' );
 } catch ( error ) {
  expect( error ).toBeInstanceOf( RequestConfigError );
 }
} );
```

- [ ] **Step 2: Run resolver tests and verify failure**

Run:

```bash
npm test -- --run src/request-config/tests/resolve.test.js
```

Expected: FAIL because `../resolve` does not exist.

- [ ] **Step 3: Implement exact resolution**

Create `src/request-config/resolve.js`:

```js
import { findByName } from '../api';
import { fetchEndpoints } from '../api/discovery';
import { RequestConfigError } from './errors';

const hasOwn = ( object, key ) => Object.prototype.hasOwnProperty.call( object, key );

const assertKnownKeys = ( kind, values, definitions = {} ) => {
 const unknown = Object.keys( values ).filter( key => ! hasOwn( definitions, key ) );
 if ( unknown.length ) {
  throw new RequestConfigError(
   `UNKNOWN_${ kind.toUpperCase() }_PARAM`,
   `Unknown ${ kind } parameter: ${ unknown.join( ', ' ) }.`
  );
 }
};

export const resolveRequestConfig = async ( config, dependencies = {} ) => {
 const findApi = dependencies.findApi || findByName;
 const loadEndpoints = dependencies.fetchEndpoints || fetchEndpoints;
 const request = config.request;
 const api = findApi( request.api );
 if ( ! api ) {
  throw new RequestConfigError( 'UNKNOWN_API', `Unknown API: ${ request.api }.` );
 }

 let versionData;
 try {
  versionData = await api.loadVersions();
 } catch ( error ) {
  throw new RequestConfigError( 'VERSION_DISCOVERY_FAILED', error.message );
 }
 if ( ! versionData.versions.includes( request.version ) ) {
  throw new RequestConfigError( 'UNKNOWN_VERSION', `Unavailable version: ${ request.version }.` );
 }

 let endpoints;
 try {
  endpoints = await loadEndpoints( api, request.version );
 } catch ( error ) {
  throw new RequestConfigError( 'DISCOVERY_FAILED', error.message );
 }
 const matches = endpoints.filter( candidate => (
  candidate.method === request.method && candidate.pathLabeled === request.endpoint
 ) );
 if ( ! matches.length ) {
  throw new RequestConfigError( 'UNKNOWN_ENDPOINT', `Endpoint not found: ${ request.method } ${ request.endpoint }.` );
 }
 if ( matches.length > 1 ) {
  throw new RequestConfigError( 'AMBIGUOUS_ENDPOINT', `Endpoint is ambiguous: ${ request.method } ${ request.endpoint }.` );
 }

 const endpoint = matches[ 0 ];
 const definition = endpoint.request || {};
 assertKnownKeys( 'path', request.pathValues, definition.path );
 assertKnownKeys( 'query', request.queryParams, definition.query );
 assertKnownKeys( 'body', request.bodyParams, definition.body );
 const missingPathValues = Object.keys( definition.path || {} )
  .filter( key => ! hasOwn( request.pathValues, key ) || undefined === request.pathValues[ key ] );
 if ( missingPathValues.length ) {
  throw new RequestConfigError(
   'MISSING_PATH_VALUE',
   `Missing path value: ${ missingPathValues.join( ', ' ) }.`
  );
 }

 return {
  api: request.api,
  version: request.version,
  endpoint,
  pathValues: request.pathValues,
  queryParams: request.queryParams,
  bodyParams: request.bodyParams,
 };
};
```

- [ ] **Step 4: Run all request-configuration tests**

Run:

```bash
npm test -- --run src/request-config/tests
```

Expected: codec and resolver tests pass.

- [ ] **Step 5: Commit the resolver**

```bash
git add src/request-config
git commit -m "feat: resolve shared request references"
```

## Task 6: Apply resolved configuration atomically in Redux

**Files:**

- Modify: `src/state/actions.js`
- Modify: `src/state/ui/reducer.js`
- Modify: `src/state/request/reducer.js`
- Create: `src/state/ui/tests/reducer.test.js`
- Modify: `src/state/request/tests/reducer.test.js`
- Create: `src/state/request-config/actions.js`
- Create: `src/state/request-config/tests/actions.test.js`

- [ ] **Step 1: Add failing reducer tests for one atomic action**

Create `src/state/ui/tests/reducer.test.js`:

```js
import reducer from '../reducer';
import { REQUEST_CONFIG_APPLY } from '../../actions';

it( 'applies API and version together', () => {
 const state = { api: 'Old API', version: 'v1' };
 const action = {
  type: REQUEST_CONFIG_APPLY,
  payload: { api: 'WP.COM API', version: 'v1.1' },
 };
 expect( reducer( state, action ) ).toEqual( { api: 'WP.COM API', version: 'v1.1' } );
} );
```

Append to `src/state/request/tests/reducer.test.js`:

```js
it( 'atomically replaces the complete request configuration', () => {
 const importedEndpoint = {
  method: 'POST',
  pathLabeled: '/sites/$site/comments/new',
  request: { path: { $site: {} }, query: {}, body: { content: {} } },
 };
 const action = {
  type: REQUEST_CONFIG_APPLY,
  payload: {
   api: 'WP.COM API',
   version: 'v1.1',
   endpoint: importedEndpoint,
   pathValues: { $site: 'example.wordpress.com' },
   queryParams: {},
   bodyParams: { content: 'Hello' },
  },
 };

 expect( reducer( state, action ) ).toEqual( {
  method: 'POST',
  endpoint: importedEndpoint,
  pathValues: { $site: 'example.wordpress.com' },
  url: '',
  queryParams: {},
  bodyParams: { content: 'Hello' },
 } );
} );
```

Also add `REQUEST_CONFIG_APPLY` to the import from `../../actions` in that test file.

- [ ] **Step 2: Run reducer tests and verify failure**

Run:

```bash
npm test -- --run src/state/ui/tests/reducer.test.js src/state/request/tests/reducer.test.js
```

Expected: FAIL because `REQUEST_CONFIG_APPLY` and reducer handlers do not exist.

- [ ] **Step 3: Define and handle the atomic action**

Add to `src/state/actions.js`:

```js
export const REQUEST_CONFIG_APPLY = 'REQUEST_CONFIG_APPLY';
```

Add `REQUEST_CONFIG_APPLY` to imports and handlers in `src/state/ui/reducer.js`:

```js
[ REQUEST_CONFIG_APPLY ]: ( state, { payload } ) => ( {
 api: payload.api,
 version: payload.version,
} ),
```

Add `REQUEST_CONFIG_APPLY` to imports and handlers in `src/state/request/reducer.js`:

```js
[ REQUEST_CONFIG_APPLY ]: ( state, { payload } ) => ( {
 method: payload.endpoint.method,
 endpoint: payload.endpoint,
 pathValues: payload.pathValues,
 url: '',
 queryParams: payload.queryParams,
 bodyParams: payload.bodyParams,
} ),
```

- [ ] **Step 4: Run reducer tests and verify pass**

Run:

```bash
npm test -- --run src/state/ui/tests/reducer.test.js src/state/request/tests/reducer.test.js
```

Expected: both reducer test files pass.

- [ ] **Step 5: Write the failing async action test**

Create `src/state/request-config/tests/actions.test.js`:

```js
import { REQUEST_CONFIG_APPLY } from '../../actions';
import { createApplyRequestConfiguration } from '../actions';

it( 'parses, resolves, applies once, then boots authentication', async () => {
 const parsed = { schemaVersion: 1, request: {} };
 const resolved = {
  api: 'WP.COM API',
  version: 'v1.1',
  endpoint: { method: 'GET' },
  pathValues: {},
  queryParams: {},
  bodyParams: {},
 };
 const parse = vi.fn( () => parsed );
 const resolve = vi.fn( () => Promise.resolve( resolved ) );
 const bootAction = { type: 'BOOT_AUTH' };
 const bootApi = vi.fn( () => bootAction );
 const dispatch = vi.fn();
 const apply = createApplyRequestConfiguration( { parse, resolve, bootApi } );

 await expect( apply( '{"schemaVersion":1}' )( dispatch ) ).resolves.toEqual( resolved );
 expect( parse ).toHaveBeenCalledWith( '{"schemaVersion":1}' );
 expect( resolve ).toHaveBeenCalledWith( parsed );
 expect( dispatch.mock.calls ).toEqual( [
  [ { type: REQUEST_CONFIG_APPLY, payload: resolved } ],
  [ bootAction ],
 ] );
} );

it( 'does not dispatch when parsing or resolution fails', async () => {
 const failure = new Error( 'invalid configuration' );
 const dispatch = vi.fn();
 const apply = createApplyRequestConfiguration( {
  parse: () => ( { schemaVersion: 1 } ),
  resolve: () => Promise.reject( failure ),
  bootApi: vi.fn(),
 } );
 await expect( apply( '{}' )( dispatch ) ).rejects.toBe( failure );
 expect( dispatch ).not.toHaveBeenCalled();
} );
```

- [ ] **Step 6: Run the action tests and verify failure**

Run:

```bash
npm test -- --run src/state/request-config/tests/actions.test.js
```

Expected: FAIL because `../actions` does not exist.

- [ ] **Step 7: Implement the async action with injectable dependencies**

Create `src/state/request-config/actions.js`:

```js
import { REQUEST_CONFIG_APPLY } from '../actions';
import { boot } from '../security/actions';
import { parseRequestConfig } from '../../request-config/codec';
import { resolveRequestConfig } from '../../request-config/resolve';

export const createApplyRequestConfiguration = ( dependencies = {} ) => {
 const parse = dependencies.parse || parseRequestConfig;
 const resolve = dependencies.resolve || resolveRequestConfig;
 const bootApi = dependencies.bootApi || boot;

 return text => async dispatch => {
  const config = parse( text );
  const resolved = await resolve( config );
  dispatch( {
   type: REQUEST_CONFIG_APPLY,
   payload: resolved,
  } );
  dispatch( bootApi( resolved.api ) );
  return resolved;
 };
};

export const applyRequestConfiguration = createApplyRequestConfiguration();
```

- [ ] **Step 8: Run all state tests**

Run:

```bash
npm test -- --run src/state
```

Expected: all state tests pass and no request-trigger action is dispatched by the import action test.

- [ ] **Step 9: Commit atomic application**

```bash
git add src/state
git commit -m "feat: apply request configurations atomically"
```

## Task 7: Build the permanent JSON editor

**Files:**

- Create: `src/components/request-config-editor/index.jsx`
- Create: `src/components/request-config-editor/style.css`
- Create: `src/components/request-config-editor/tests/index.test.jsx`

- [ ] **Step 1: Write failing editor component tests**

Create `src/components/request-config-editor/tests/index.test.jsx`:

```jsx
import React from 'react';
import ReactDOM from 'react-dom';
import { act } from 'react-dom/test-utils';

import { RequestConfigEditor } from '../index';

vi.mock( 'react-simple-code-editor', () => ( {
 default: props => (
  <textarea
   aria-label="Request configuration JSON"
   value={ props.value }
   onChange={ event => props.onValueChange( event.target.value ) }
   onPaste={ props.onPaste }
  />
 ),
} ) );

const source = {
 api: 'WP.COM API',
 version: 'v1.1',
 endpoint: {
  method: 'GET',
  pathLabeled: '/me',
  request: { path: {}, query: {}, body: {} },
 },
 pathValues: {},
 queryParams: {},
 bodyParams: {},
};

const findButton = ( container, label ) => Array.from( container.querySelectorAll( 'button' ) )
 .find( button => button.textContent === label );

let container;
beforeEach( () => {
 container = document.createElement( 'div' );
 document.body.appendChild( container );
 Object.defineProperty( navigator, 'clipboard', {
  configurable: true,
  value: { writeText: vi.fn( () => Promise.resolve() ) },
 } );
} );

afterEach( () => {
 ReactDOM.unmountComponentAtNode( container );
 container.remove();
} );

const renderEditor = applyRequestConfiguration => {
 act( () => {
  ReactDOM.render(
   <RequestConfigEditor
    source={ source }
    applyRequestConfiguration={ applyRequestConfiguration || vi.fn( () => Promise.resolve() ) }
   />,
   container
  );
 } );
};

it( 'generates and copies formatted request JSON', async () => {
 renderEditor();
 act( () => findButton( container, 'From request' ).click() );
 const editor = container.querySelector( 'textarea' );
 expect( editor.value ).toContain( '"schemaVersion": 1' );
 await act( async () => findButton( container, 'Copy JSON' ).click() );
 expect( navigator.clipboard.writeText ).toHaveBeenCalledWith( editor.value );
} );

it( 'formats valid pasted JSON', () => {
 renderEditor();
 const editor = container.querySelector( 'textarea' );
 const event = new Event( 'paste', { bubbles: true, cancelable: true } );
 Object.defineProperty( event, 'clipboardData', {
  value: { getData: () => '{"b":2,"a":1}' },
 } );
 act( () => editor.dispatchEvent( event ) );
 expect( editor.value ).toBe( '{\n  "a": 1,\n  "b": 2\n}\n' );
} );

it( 'preserves invalid pasted text and shows an error', () => {
 renderEditor();
 const editor = container.querySelector( 'textarea' );
 const event = new Event( 'paste', { bubbles: true, cancelable: true } );
 Object.defineProperty( event, 'clipboardData', { value: { getData: () => '{' } } );
 act( () => editor.dispatchEvent( event ) );
 expect( editor.value ).toBe( '{' );
 expect( container.querySelector( '.request-config-editor__error' ).textContent ).toBeTruthy();
} );

it( 'applies text without triggering a request', async () => {
 const applyRequestConfiguration = vi.fn( () => Promise.resolve() );
 renderEditor( applyRequestConfiguration );
 act( () => findButton( container, 'From request' ).click() );
 await act( async () => findButton( container, 'Apply to request' ).click() );
 expect( applyRequestConfiguration ).toHaveBeenCalledTimes( 1 );
} );
```

- [ ] **Step 2: Run editor tests and verify failure**

Run:

```bash
npm test -- --run src/components/request-config-editor/tests/index.test.jsx
```

Expected: FAIL because the editor component does not exist.

- [ ] **Step 3: Implement the editor component**

Create `src/components/request-config-editor/index.jsx`:

```jsx
import React, { Component } from 'react';
import { connect } from 'react-redux';
import Editor from 'react-simple-code-editor';
import Prism from 'prismjs';
import 'prismjs/components/prism-json';
import 'prismjs/themes/prism.css';

import './style.css';

import {
 createRequestConfig,
 formatJsonText,
 formatRequestConfig,
} from '../../request-config/codec';
import { getRequestConfigSource } from '../../state/request-config/selectors';
import { applyRequestConfiguration } from '../../state/request-config/actions';

export class RequestConfigEditor extends Component {
 state = {
  value: '',
  error: '',
  applying: false,
 };

 setError = error => {
  this.setState( { error: error && error.message ? error.message : String( error ) } );
 };

 fromRequest = () => {
  try {
   const value = formatRequestConfig( createRequestConfig( this.props.source ) );
   this.setState( { value, error: '' } );
  } catch ( error ) {
   this.setError( error );
  }
 };

 format = () => {
  try {
   this.setState( { value: formatJsonText( this.state.value ), error: '' } );
  } catch ( error ) {
   this.setError( error );
  }
 };

 onPaste = event => {
  const pasted = event.clipboardData.getData( 'text' );
  event.preventDefault();
  try {
   this.setState( { value: formatJsonText( pasted ), error: '' } );
  } catch ( error ) {
   this.setState( { value: pasted }, () => this.setError( error ) );
  }
 };

 copy = async () => {
  try {
   await navigator.clipboard.writeText( this.state.value );
   this.setState( { error: '' } );
  } catch ( error ) {
   this.setError( error );
  }
 };

 apply = async () => {
  this.setState( { applying: true, error: '' } );
  try {
   await this.props.applyRequestConfiguration( this.state.value );
  } catch ( error ) {
   this.setError( error );
  } finally {
   this.setState( { applying: false } );
  }
 };

 highlight = code => Prism.highlight( code, Prism.languages.json, 'json' );

 render() {
  const { value, error, applying } = this.state;
  return (
   <section className="request-config-editor">
    <header className="request-config-editor__title">Request configuration JSON</header>
    <Editor
     value={ value }
     onValueChange={ nextValue => this.setState( { value: nextValue, error: '' } ) }
     onPaste={ this.onPaste }
     highlight={ this.highlight }
     padding={ 16 }
     textareaClassName="request-config-editor__textarea"
     preClassName="request-config-editor__highlight"
     aria-label="Request configuration JSON"
    />
    { error && <div className="request-config-editor__error" role="alert">{ error }</div> }
    <div className="request-config-editor__warning">
     Review query and body values for sensitive data before publishing.
    </div>
    <div className="request-config-editor__actions">
     <button type="button" onClick={ this.fromRequest } disabled={ ! this.props.source.endpoint }>
      From request
     </button>
     <button type="button" onClick={ this.format } disabled={ ! value }>Format JSON</button>
     <button type="button" onClick={ this.copy } disabled={ ! value }>Copy JSON</button>
     <button type="button" onClick={ this.apply } disabled={ ! value || applying }>
      { applying ? 'Applying…' : 'Apply to request' }
     </button>
    </div>
   </section>
  );
 }
}

export default connect(
 state => ( { source: getRequestConfigSource( state ) } ),
 { applyRequestConfiguration }
)( RequestConfigEditor );
```

- [ ] **Step 4: Add editor styling**

Create `src/components/request-config-editor/style.css`:

```css
.request-config-editor {
 background: white;
 border-left: 1px solid #d5e2ec;
 box-sizing: border-box;
 display: flex;
 flex-direction: column;
 min-width: 0;
}

.request-config-editor__title {
 background: #f8fafb;
 border-bottom: 1px solid #d5e2ec;
 color: #72a8cd;
 font-size: 14px;
 padding: 10px 12px;
 text-transform: uppercase;
}

.request-config-editor > div:first-of-type {
 background: #f7f9fa;
 font-family: "SFMono-Regular", Consolas, "Liberation Mono", monospace;
 font-size: 13px;
 line-height: 20px;
 min-height: 320px;
 overflow: auto;
}

.request-config-editor__textarea,
.request-config-editor__highlight {
 outline: none;
 white-space: pre !important;
}

.request-config-editor__error {
 background: #ffe4e4;
 color: #a42828;
 font-size: 12px;
 padding: 10px 12px;
}

.request-config-editor__warning {
 background: #fff8e8;
 border-left: 3px solid #d9a441;
 color: #7d6229;
 font-size: 12px;
 margin: 12px;
 padding: 10px;
}

.request-config-editor__actions {
 display: flex;
 flex-wrap: wrap;
 gap: 8px;
 justify-content: flex-end;
 padding: 0 12px 12px;
}

.request-config-editor__actions button {
 background: white;
 border: 1px solid #9bb5c6;
 color: #356d8e;
 cursor: pointer;
 padding: 8px 10px;
}

.request-config-editor__actions button:last-child {
 background: #2e92cc;
 border-color: #2e92cc;
 color: white;
}

.request-config-editor__actions button:disabled {
 cursor: default;
 opacity: 0.5;
}
```

- [ ] **Step 5: Run editor tests and fix only implementation defects**

Run:

```bash
npm test -- --run src/components/request-config-editor/tests/index.test.jsx
```

Expected: all editor tests pass.

- [ ] **Step 6: Commit the editor**

```bash
git add src/components/request-config-editor
git commit -m "feat: add request configuration JSON editor"
```

## Task 8: Place Query and Body left and JSON right

**Files:**

- Modify: `src/app.jsx`
- Modify: `src/app.css`
- Modify: `src/components/query-builder/style.css`

- [ ] **Step 1: Update the application composition**

In `src/app.jsx`, import the editor:

```js
import RequestConfigEditor from './components/request-config-editor';
```

Replace the standalone `<QueryBuilder />` with:

```jsx
<div className="request-workspace">
 <QueryBuilder />
 <RequestConfigEditor />
</div>
```

Keep `<Header />` before the workspace and `<Results />` after it.

- [ ] **Step 2: Add the two-column workspace layout**

Append to `src/app.css`:

```css
.request-workspace {
 border-bottom: 1px solid #eaf1f6;
 display: grid;
 grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
 padding: 60px 16px 24px;
}

@media (max-width: 900px) {
 .request-workspace {
  grid-template-columns: minmax(0, 1fr);
 }

 .request-config-editor {
  border-left: 0;
  border-top: 1px solid #d5e2ec;
 }
}
```

- [ ] **Step 3: Stack Query and Body**

Replace `src/components/query-builder/style.css` with:

```css
.builder {
 align-items: stretch;
 display: flex;
 flex-direction: column;
 font-size: 14px;
 gap: 16px;
 justify-content: flex-start;
 min-width: 0;
 padding-right: 16px;
}

.builder > div {
 box-sizing: border-box;
 min-height: 20px;
 min-width: 0;
 position: relative;
 width: 100%;
}

@media (max-width: 900px) {
 .builder {
  padding-bottom: 16px;
  padding-right: 0;
 }
}
```

- [ ] **Step 4: Run proactive diagnostics before the build**

Run the LSP diagnostics tool on:

```text
src/app.jsx
src/components/query-builder
src/components/request-config-editor
```

Expected: no errors.

- [ ] **Step 5: Run the full test suite**

Run:

```bash
npm test -- --run
```

Expected: all existing and newly added tests pass.

- [ ] **Step 6: Run the production build**

Run:

```bash
npm run build
```

Expected: build succeeds. Existing non-blocking legacy CSS warnings may remain; no new errors are accepted.

- [ ] **Step 7: Perform manual layout verification**

Run:

```bash
npm start
```

Verify at `http://localhost:3000`:

1. Query is above Body in the left half.
2. The JSON editor fills the right half.
3. Selecting and filling an endpoint does not overwrite editor draft text.
4. **From request** creates readable JSON.
5. Valid paste formats immediately.
6. **Apply to request** reproduces values and does not submit.
7. At viewport widths below 900px, the editor stacks below Query and Body.

Stop the development server after verification.

- [ ] **Step 8: Commit the workspace layout**

```bash
git add src/app.jsx src/app.css src/components/query-builder/style.css
git commit -m "feat: add shareable request workspace layout"
```

## Task 9: Document usage and complete verification

**Files:**

- Modify: `README.md`

- [ ] **Step 1: Add the workflow to the README**

Add this section after the local configuration instructions in `README.md`:

```md
## Sharing a configured request

The request workspace can generate and apply a versioned JSON representation of the selected API request.

1. Select an API, version, and endpoint, then fill the path, query, and body values.
2. Click **From request** in **Request configuration JSON**.
3. Review query and body values for sensitive data.
4. Click **Copy JSON** and paste the JSON into pull request testing instructions.
5. A reviewer can paste the JSON into the editor and click **Apply to request**.
6. Applying a configuration fills the console but never sends the request automatically.

Authentication tokens, cookies, user data, response data, and request history are never included. Schema version 1 does include explicit path, query, and body values, so review them before sharing.
```

- [ ] **Step 2: Run targeted and complete tests**

Run:

```bash
npm test -- --run src/request-config src/state/request-config src/components/request-config-editor
npm test -- --run
```

Expected: targeted tests pass, followed by the complete suite passing.

- [ ] **Step 3: Run final diagnostics**

Run `lens_diagnostics` with `mode=all`.

Expected: no blocking errors remain in edited files.

- [ ] **Step 4: Run the final production build**

Run:

```bash
npm run build
```

Expected: successful Vite production build with no new blocking warnings.

- [ ] **Step 5: Verify no generated or staged artifacts are present**

Run:

```bash
git status --short
git diff --check
```

Expected: only the intended README change is uncommitted before the final task commit; `git diff --check` prints nothing.

- [ ] **Step 6: Commit documentation**

```bash
git add README.md
git commit -m "docs: explain shareable request configurations"
```

- [ ] **Step 7: Record final evidence**

Run:

```bash
git status --short
git log --oneline -9
```

Expected: clean working tree and the task commits visible locally. Do not push, open a pull request, create an issue, or publish artifacts.
