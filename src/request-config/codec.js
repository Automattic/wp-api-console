import validator from 'is-my-json-valid';

import { RequestConfigError } from './errors';
import schema from './schema';

const validate = validator( schema, { greedy: true } );
const hasOwn = ( object, key ) => Object.prototype.hasOwnProperty.call( object, key );

const nonSerializable = ( path, reason ) => {
	throw new RequestConfigError( 'NON_SERIALIZABLE_VALUE', `${ path } ${ reason }` );
};

const assertJsonValue = ( value, seen = new Set(), path = '$' ) => {
	if ( value === null || 'string' === typeof value || 'boolean' === typeof value ) {
		return;
	}
	if ( 'number' === typeof value ) {
		if ( Number.isFinite( value ) ) {
			return;
		}
		nonSerializable( path, 'is not a finite number.' );
	}
	if ( 'object' !== typeof value ) {
		nonSerializable( path, 'is not JSON serializable.' );
	}
	if ( seen.has( value ) ) {
		nonSerializable( path, 'contains a cycle.' );
	}

	const prototype = Object.getPrototypeOf( value );
	if ( Array.isArray( value ) ) {
		if ( prototype !== Array.prototype ) {
			nonSerializable( path, 'is not a plain JSON array.' );
		}
	} else if ( prototype !== Object.prototype && prototype !== null ) {
		nonSerializable( path, 'is not a plain JSON object.' );
	}
	if ( Object.getOwnPropertySymbols( value ).length ) {
		nonSerializable( path, 'contains a symbol property.' );
	}

	seen.add( value );
	if ( Array.isArray( value ) ) {
		for ( let index = 0; index < value.length; index++ ) {
			if ( ! hasOwn( value, index ) ) {
				nonSerializable( `${ path }[${ index }]`, 'is undefined.' );
			}
		}
		Object.getOwnPropertyNames( value )
			.filter( ( key ) => 'length' !== key )
			.forEach( ( key ) => {
				const descriptor = Object.getOwnPropertyDescriptor( value, key );
				if ( descriptor.get || descriptor.set ) {
					nonSerializable( `${ path }.${ key }`, 'is an accessor property.' );
				}
				assertJsonValue( descriptor.value, seen, `${ path }[${ key }]` );
				if ( ! /^0$|^[1-9][0-9]*$/.test( key ) || Number( key ) >= value.length ) {
					nonSerializable( path, 'contains a non-index property.' );
				}
			} );
	} else {
		const enumerableKeys = Object.keys( value );
		if ( Object.getOwnPropertyNames( value ).length !== enumerableKeys.length ) {
			nonSerializable( path, 'contains a non-enumerable property.' );
		}
		enumerableKeys.forEach( ( key ) => {
			const descriptor = Object.getOwnPropertyDescriptor( value, key );
			if ( descriptor.get || descriptor.set ) {
				nonSerializable( `${ path }.${ key }`, 'is an accessor property.' );
			}
			assertJsonValue( descriptor.value, seen, `${ path }.${ key }` );
		} );
	}
	seen.delete( value );
};

const assignJsonProperty = ( object, key, value ) => {
	Object.defineProperty( object, key, {
		configurable: true,
		enumerable: true,
		value,
		writable: true,
	} );
};

const sortJsonValue = ( value ) => {
	if ( Array.isArray( value ) ) {
		return value.map( sortJsonValue );
	}
	if ( value && 'object' === typeof value ) {
		return Object.keys( value )
			.sort()
			.reduce( ( sorted, key ) => {
				assignJsonProperty( sorted, key, sortJsonValue( value[ key ] ) );
				return sorted;
			}, {} );
	}
	return value;
};

const contractKeyOrder = {
	$: [ 'schemaVersion', 'request' ],
	'$.request': [
		'api',
		'version',
		'method',
		'endpoint',
		'pathValues',
		'queryParams',
		'bodyParams',
	],
};

const stringifyJsonValue = ( value, depth = 0, path = '$', keyOrder = {} ) => {
	if ( ! value || 'object' !== typeof value ) {
		return JSON.stringify( value );
	}

	const indentation = '  '.repeat( depth );
	const childIndentation = '  '.repeat( depth + 1 );
	if ( Array.isArray( value ) ) {
		if ( ! value.length ) {
			return '[]';
		}
		const items = value.map(
			( item, index ) =>
				`${ childIndentation }${ stringifyJsonValue(
					item,
					depth + 1,
					`${ path }[${ index }]`,
					keyOrder
				) }`
		);
		return `[\n${ items.join( ',\n' ) }\n${ indentation }]`;
	}

	const keys = keyOrder[ path ] || Object.keys( value ).sort();
	if ( ! keys.length ) {
		return '{}';
	}
	const properties = keys.map(
		( key ) =>
			`${ childIndentation }${ JSON.stringify( key ) }: ${ stringifyJsonValue(
				value[ key ],
				depth + 1,
				`${ path }.${ key }`,
				keyOrder
			) }`
	);
	return `{\n${ properties.join( ',\n' ) }\n${ indentation }}`;
};

const pickDefinedValues = ( definitions = {}, values = {} ) =>
	Object.keys( definitions )
		.sort()
		.reduce( ( selected, key ) => {
			if ( values && hasOwn( values, key ) ) {
				const descriptor = Object.getOwnPropertyDescriptor( values, key );
				if ( ! descriptor.enumerable ) {
					nonSerializable( `$.${ key }`, 'is a non-enumerable property.' );
				}
				if ( descriptor.get || descriptor.set ) {
					nonSerializable( `$.${ key }`, 'is an accessor property.' );
				}
				if ( undefined !== descriptor.value ) {
					assertJsonValue( descriptor.value, new Set(), `$.${ key }` );
					assignJsonProperty( selected, key, sortJsonValue( descriptor.value ) );
				}
			}
			return selected;
		}, {} );

const schemaError = () => {
	const details = ( validate.errors || [] ).map(
		( error ) => `${ error.field || 'data' } ${ error.message }`
	);
	return new RequestConfigError(
		'INVALID_SCHEMA',
		details.join( '; ' ) || 'Request configuration does not match schema version 1.',
		details
	);
};

const assertValidConfig = ( config ) => {
	if ( ! validate( config ) ) {
		throw schemaError();
	}
};

export const createRequestConfig = ( source ) => {
	if ( ! source.endpoint ) {
		throw new RequestConfigError(
			'MISSING_ENDPOINT',
			'Select an endpoint before generating JSON.'
		);
	}

	const requestDefinition = source.endpoint.request || {};
	const pathDefinitions = requestDefinition.path || {};
	const pathValues = pickDefinedValues( pathDefinitions, source.pathValues );
	const missingPathValues = Object.keys( pathDefinitions ).filter(
		( key ) => ! hasOwn( pathValues, key )
	);
	if ( missingPathValues.length ) {
		throw new RequestConfigError(
			'MISSING_PATH_VALUE',
			`Missing path value: ${ missingPathValues.join( ', ' ) }.`,
			missingPathValues
		);
	}

	const config = {
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
	assertJsonValue( config );
	assertValidConfig( config );
	return config;
};

export const formatRequestConfig = ( config ) => {
	assertJsonValue( config );
	assertValidConfig( config );

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
	return stringifyJsonValue( ordered, 0, '$', contractKeyOrder ) + '\n';
};

export const formatJsonText = ( text ) => {
	let parsed;
	try {
		parsed = JSON.parse( text );
	} catch ( error ) {
		throw new RequestConfigError( 'INVALID_JSON', error.message );
	}

	if ( validate( parsed ) ) {
		return formatRequestConfig( parsed );
	}
	return stringifyJsonValue( parsed ) + '\n';
};

export const parseRequestConfig = ( text ) => {
	let parsed;
	try {
		parsed = JSON.parse( text );
	} catch ( error ) {
		throw new RequestConfigError( 'INVALID_JSON', error.message );
	}
	assertValidConfig( parsed );
	return parsed;
};
