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
			query: { z: {}, empty: {}, disabled: {}, count: {}, nullable: {} },
			body: { metadata: {}, content: {}, list: {} },
		},
	},
	pathValues: { $site: 'example.wordpress.com', ignored: 'secret' },
	queryParams: {
		z: 'last',
		empty: '',
		disabled: false,
		count: 0,
		nullable: null,
		ignored: 'secret',
	},
	bodyParams: {
		metadata: { zebra: 1, alpha: null, nested: { z: false, a: '' } },
		content: 'Hello',
		list: [ 3, { z: true, a: 0 }, null ],
		ignored: 'secret',
	},
	security: { token: 'never-export-this-token' },
};

const expectedConfig = {
	schemaVersion: 1,
	request: {
		api: 'WP.COM API',
		version: 'v1.1',
		method: 'POST',
		endpoint: '/sites/$site/comments/new',
		pathValues: { $site: 'example.wordpress.com' },
		queryParams: { count: 0, disabled: false, empty: '', nullable: null, z: 'last' },
		bodyParams: {
			content: 'Hello',
			list: [ 3, { a: 0, z: true }, null ],
			metadata: { alpha: null, nested: { a: '', z: false }, zebra: 1 },
		},
	},
};

it( 'creates an allowlisted version 1 configuration with endpoint identity', () => {
	const config = createRequestConfig( source );

	expect( config ).toEqual( expectedConfig );
	expect( JSON.stringify( config ) ).not.toContain( 'never-export-this-token' );
	expect( config.request.endpoint ).not.toBe( source.endpoint );
} );

it( 'includes only defined endpoint-declared parameters', () => {
	const config = createRequestConfig( {
		...source,
		queryParams: { ...source.queryParams, z: undefined },
		bodyParams: { ...source.bodyParams, content: undefined },
	} );

	expect( config.request.queryParams ).not.toHaveProperty( 'z' );
	expect( config.request.bodyParams ).not.toHaveProperty( 'content' );
} );

it.each( [
	[ 'a hidden allowlisted path value', 'pathValues', '$site' ],
	[ 'an accessor allowlisted query value', 'queryParams', 'count' ],
] )( 'rejects %s', ( _label, parameterName, key ) => {
	const parameters = { ...source[ parameterName ] };
	if ( 'pathValues' === parameterName ) {
		Object.defineProperty( parameters, key, {
			configurable: true,
			enumerable: false,
			value: 'example.wordpress.com',
			writable: true,
		} );
	} else {
		Object.defineProperty( parameters, key, {
			configurable: true,
			enumerable: true,
			get: () => 0,
		} );
	}

	expect( () =>
		createRequestConfig( {
			...source,
			[ parameterName ]: parameters,
		} )
	).toThrowError( RequestConfigError );

	try {
		createRequestConfig( {
			...source,
			[ parameterName ]: parameters,
		} );
		throw new Error( 'Expected createRequestConfig to throw' );
	} catch ( error ) {
		expect( error ).toMatchObject( { code: 'NON_SERIALIZABLE_VALUE' } );
	}
} );

it( 'formats deterministically with fixed contract order and one trailing newline', () => {
	const config = createRequestConfig( source );
	const formatted = formatRequestConfig( config );

	expect( formatted ).toBe( JSON.stringify( expectedConfig, null, 2 ) + '\n' );
	expect( formatted.endsWith( '\n\n' ) ).toBe( false );
} );

it( 'formats valid generic JSON deterministically without requiring the request schema', () => {
	expect( formatJsonText( '{"z":[{"b":2,"a":1}],"a":true}' ) ).toBe(
		'{\n  "a": true,\n  "z": [\n    {\n      "a": 1,\n      "b": 2\n    }\n  ]\n}\n'
	);
} );

it( 'sorts integer-like object keys lexicographically at every depth', () => {
	expect(
		formatJsonText( '{"2":"outer two","10":"outer ten","nested":{"2":"two","10":"ten"}}' )
	).toBe(
		'{\n  "10": "outer ten",\n  "2": "outer two",\n  "nested": {\n    "10": "ten",\n    "2": "two"\n  }\n}\n'
	);
} );

it( 'preserves fixed contract field order when formatting valid configuration text', () => {
	const shuffled = {
		request: {
			bodyParams: expectedConfig.request.bodyParams,
			pathValues: expectedConfig.request.pathValues,
			endpoint: expectedConfig.request.endpoint,
			method: expectedConfig.request.method,
			queryParams: expectedConfig.request.queryParams,
			version: expectedConfig.request.version,
			api: expectedConfig.request.api,
		},
		schemaVersion: 1,
	};

	expect( formatJsonText( JSON.stringify( shuffled ) ) ).toBe(
		formatRequestConfig( expectedConfig )
	);
} );

it( 'round-trips scalar, array, and object parameter values', () => {
	const config = createRequestConfig( source );

	expect( parseRequestConfig( formatRequestConfig( config ) ) ).toEqual( expectedConfig );
} );

it( 'rejects malformed JSON with a distinct typed error', () => {
	expect( () => parseRequestConfig( '{' ) ).toThrowError( RequestConfigError );

	try {
		parseRequestConfig( '{' );
	} catch ( error ) {
		expect( error ).toMatchObject( { code: 'INVALID_JSON' } );
		expect( error.details ).toEqual( [] );
	}
} );

describe.each( [
	[
		'an extra top-level property',
		( value ) => ( { ...value, extra: true } ),
		'UNKNOWN_PROPERTY',
	],
	[
		'an extra request property',
		( value ) => ( {
			...value,
			request: { ...value.request, auth: 'secret' },
		} ),
		'UNKNOWN_PROPERTY',
	],
	[
		'a missing schema version',
		( value ) => ( { request: value.request } ),
		'MISSING_SCHEMA_VERSION',
	],
	[
		'a missing request property',
		( value ) => {
			const request = { ...value.request };
			delete request.bodyParams;
			return { ...value, request };
		},
		'MISSING_REQUIRED_PROPERTY',
	],
	[
		'a wrong field type',
		( value ) => ( {
			...value,
			request: { ...value.request, method: false },
		} ),
		'INVALID_PROPERTY_TYPE',
	],
	[
		'an unsupported version',
		( value ) => ( { ...value, schemaVersion: 2 } ),
		'UNSUPPORTED_SCHEMA_VERSION',
	],
] )( 'schema validation', ( label, change, code ) => {
	it( `rejects ${ label } with a typed schema error`, () => {
		try {
			parseRequestConfig( JSON.stringify( change( expectedConfig ) ) );
			throw new Error( 'Expected parseRequestConfig to throw' );
		} catch ( error ) {
			expect( error ).toBeInstanceOf( RequestConfigError );
			expect( error.code ).toBe( code );
			expect( error.details.length ).toBeGreaterThan( 0 );
		}
	} );
} );

it( 'allows arbitrary parameter-map keys containing JSON values', () => {
	const config = {
		...expectedConfig,
		request: {
			...expectedConfig.request,
			bodyParams: {
				'arbitrary-key': { any: [ 'JSON', 1, true, null ] },
			},
		},
	};

	expect( parseRequestConfig( JSON.stringify( config ) ) ).toEqual( config );
} );

it( 'requires a selected endpoint', () => {
	expect( () => createRequestConfig( { ...source, endpoint: null } ) ).toThrowError(
		RequestConfigError
	);
	expect( () => createRequestConfig( { ...source, endpoint: null } ) ).toThrowError(
		/Select an endpoint/
	);
} );

it.each( [
	[ 'absent', {} ],
	[ 'undefined', { $site: undefined } ],
] )( 'defaults an %s required path value to an empty string', ( _label, pathValues ) => {
	expect( createRequestConfig( { ...source, pathValues } ).request.pathValues ).toEqual( {
		$site: '',
	} );
} );

it.each( [ '', 0, false, null ] )( 'preserves an explicit path value: %j', pathValue => {
	expect(
		createRequestConfig( { ...source, pathValues: { $site: pathValue } } ).request.pathValues
	).toEqual( { $site: pathValue } );
} );

it.each( [
	[ 'undefined', { value: undefined } ],
	[ 'function', { value: () => true } ],
	[ 'symbol', Symbol( 'value' ) ],
	[ 'non-finite number', { value: Number.POSITIVE_INFINITY } ],
	[ 'non-plain object', new Date( 0 ) ],
] )( 'rejects non-JSON %s values', ( label, metadata ) => {
	expect( () =>
		createRequestConfig( {
			...source,
			bodyParams: { ...source.bodyParams, metadata },
		} )
	).toThrowError( RequestConfigError );
} );

it( 'rejects sparse arrays', () => {
	const sparse = [];
	sparse[ 1 ] = 'value';

	expect( () =>
		createRequestConfig( {
			...source,
			bodyParams: { ...source.bodyParams, list: sparse },
		} )
	).toThrowError( RequestConfigError );
} );

it( 'rejects array subclasses', () => {
	class ArraySubclass extends Array {}
	const subclass = new ArraySubclass( 'value' );

	expect( () =>
		createRequestConfig( {
			...source,
			bodyParams: { ...source.bodyParams, list: subclass },
		} )
	).toThrowError( RequestConfigError );
} );

it( 'rejects non-enumerable array properties containing functions', () => {
	const arrayWithHiddenFunction = [ 'value' ];
	Object.defineProperty( arrayWithHiddenFunction, 'hidden', {
		value: () => true,
	} );

	expect( () =>
		createRequestConfig( {
			...source,
			bodyParams: { ...source.bodyParams, list: arrayWithHiddenFunction },
		} )
	).toThrowError( RequestConfigError );
} );

it( 'rejects cyclic generated values', () => {
	const cyclic = {};
	cyclic.self = cyclic;

	try {
		createRequestConfig( {
			...source,
			bodyParams: { ...source.bodyParams, metadata: cyclic },
		} );
		throw new Error( 'Expected createRequestConfig to throw' );
	} catch ( error ) {
		expect( error ).toMatchObject( { code: 'NON_SERIALIZABLE_VALUE' } );
	}
} );
