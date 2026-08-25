import { findByName } from '../api';
import { fetchEndpoints as sharedFetchEndpoints } from '../api/discovery';
import { RequestConfigError } from './errors';

const hasOwn = ( object, key ) => Object.prototype.hasOwnProperty.call( object, key );

const makeError = ( code, message ) => new RequestConfigError( code, message );

const getKnownKeys = ( values = {} ) => Object.keys( values );

const assertKnownKeys = ( kind, values, definitions = {} ) => {
	const unknown = getKnownKeys( values ).filter( ( key ) => ! hasOwn( definitions, key ) );
	if ( unknown.length ) {
		throw makeError(
			`UNKNOWN_${ kind.toUpperCase() }_PARAM`,
			`Unknown ${ kind } parameter: ${ unknown.join( ', ' ) }.`
		);
	}
};

const assertRequiredPathValues = ( pathValues = {}, pathDefinitions = {} ) => {
	const missing = getKnownKeys( pathDefinitions ).filter(
		( key ) => ! hasOwn( pathValues, key ) || undefined === pathValues[ key ]
	);
	if ( missing.length ) {
		throw makeError(
			'MISSING_PATH_VALUE',
			`Missing path value: ${ missing.join( ', ' ) }.`
		);
	}
};

const resolveApi = async ( request, findApi ) => {
	const api = findApi( request.api );
	if ( ! api ) {
		throw makeError( 'UNKNOWN_API', `Unknown API: ${ request.api }.` );
	}

	let versions;
	try {
		const versionData = await api.loadVersions();
		versions = versionData && versionData.versions;
	} catch ( error ) {
		throw makeError( 'VERSION_DISCOVERY_FAILED', error && error.message ? error.message : String( error ) );
	}

	if ( ! Array.isArray( versions ) || ! versions.includes( request.version ) ) {
		throw makeError( 'UNKNOWN_VERSION', `Unknown version: ${ request.version }.` );
	}

	return api;
};

const resolveEndpoint = async ( api, request, loadEndpoints ) => {
	let endpoints;
	try {
		endpoints = await loadEndpoints( api, request.version );
	} catch ( error ) {
		throw makeError( 'DISCOVERY_FAILED', error && error.message ? error.message : String( error ) );
	}

	if ( ! Array.isArray( endpoints ) ) {
		throw makeError( 'DISCOVERY_FAILED', 'Endpoint discovery did not return a list.' );
	}

	const matches = endpoints.filter(
		( endpoint ) => endpoint && endpoint.method === request.method && endpoint.pathLabeled === request.endpoint
	);

	if ( ! matches.length ) {
		throw makeError(
			'UNKNOWN_ENDPOINT',
			`Endpoint not found: ${ request.method } ${ request.endpoint }.`
		);
	}

	if ( matches.length > 1 ) {
		throw makeError(
			'AMBIGUOUS_ENDPOINT',
			`Endpoint is ambiguous: ${ request.method } ${ request.endpoint }.`
		);
	}

	return matches[ 0 ];
};

export const resolveRequestConfig = async ( config, dependencies = {} ) => {
	const request = config.request || {};
	const findApi = dependencies.findApi || findByName;
	const loadEndpoints = dependencies.fetchEndpoints || sharedFetchEndpoints;

	const api = await resolveApi( request, findApi );
	const endpoint = await resolveEndpoint( api, request, loadEndpoints );
	const definitions = endpoint.request || {};

	assertKnownKeys( 'path', request.pathValues, definitions.path );
	assertKnownKeys( 'query', request.queryParams, definitions.query );
	assertKnownKeys( 'body', request.bodyParams, definitions.body );
	assertRequiredPathValues( request.pathValues, definitions.path );

	return {
		api: request.api,
		version: request.version,
		endpoint,
		pathValues: request.pathValues,
		queryParams: request.queryParams,
		bodyParams: request.bodyParams,
	};
};
