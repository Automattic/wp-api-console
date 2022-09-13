import { getNamedCaptureGroups } from '../lib/pcre-parser';

export const guessEndpointDocumentation = ( method, namespace, computedPath ) => {
	// Try to guess some info about the endpoints
	let group = '';
	let groupPlural = '';
	let groupSingular = '';
	let description = '';

	computedPath = computedPath || '/';

	const verbMatch = computedPath.match( /^(\/?sites\/[$\w.]+)?\/([\w-]*)(\/|$)/ );

	if ( verbMatch ) {
		group = verbMatch[ 2 ];
		switch ( group ) {
			case 'media':
				groupPlural = 'media items';
				break;
			case 'feedback':
				groupPlural = 'feedback posts';
				break;
			case 'types':
				groupPlural = 'post types';
				break;
			case 'statuses':
				groupPlural = 'post statuses';
				break;
			default:
				groupPlural = group;
				break;
		}

		if ( group === 'statuses' ) {
			groupSingular = 'post status';
		} else if ( group === 'sites' || computedPath === '/' ) {
			group = 'auto-discovery';
		} else {
			groupSingular = groupPlural.replace( /ies$/, 'y' ).replace( /s$/, '' );
		}

		function getDescription() {
			if ( group === 'auto-discovery' ) {
				if ( computedPath === '/' ) {
					return 'List endpoints in the ' + namespace + ' namespace';
				} else {
					return 'List endpoints in the ' + namespace + ' namespace (site-specific)';
				}
			}

			if ( namespace === 'wp/v2' ) {
				if ( group === 'settings' ) {
					switch ( method ) {
						case 'GET':
							return 'Get site settings';
						default:
							return 'Edit site settings';
					}
				}

				if ( /\/users\/me$/.test( computedPath ) ) {
					switch ( method ) {
						case 'GET':
							return 'Get the current user';
						case 'POST':
						case 'PUT':
						case 'PATCH':
							return 'Edit the current user';
						case 'DELETE':
							return 'Delete the current user';
						default: // make eslint happy
							return 'Unknown action with the current user';
					}
				}

				if ( /\/revisions(\/|$)/.test( computedPath ) ) {
					groupPlural = 'revisions of a ' + groupSingular;
					groupSingular = 'revision of a ' + groupSingular;
				}

				if ( /\$(id|status|taxonomy|type)$/.test( computedPath ) ) {
					switch ( method ) {
						case 'GET':
							return 'Get a ' + groupSingular;
						case 'POST':
						case 'PUT':
						case 'PATCH':
							return 'Edit a ' + groupSingular;
						case 'DELETE':
							return 'Delete a ' + groupSingular;
						default:
							return '';
					}
				} else {
					switch ( method ) {
						case 'GET':
							return 'List ' + groupPlural;
						case 'POST':
							return 'Create a ' + groupSingular;
						default:
							return '';
					}
				}
			}

			return '';
		}

		description = getDescription() || '';
	}

	return {
		group,
		description,
	};
};

export const parseEndpoints = data => {
	const endpoints = [];

	Object.keys( data.routes ).forEach( url => {
		const route = data.routes[ url ];
		// Drop the /wp/v2
		const pathPattern = data.namespace ? url.substr( data.namespace.length + 1 ) : url;
		route.endpoints.forEach( rawEndpoint => {
			rawEndpoint.methods.forEach( method => {
				// Parsing Arguments
				const args = Object.keys( rawEndpoint.args ).reduce( ( memo, key ) => {
					const { description = '', type = 'string' } = rawEndpoint.args[ key ];
					return {
						...memo,
						[ key ]: { type, description },
					};
				}, {} );

				// Parsing path
				const path = {};
				let pathLabel = '';
				let pathFormat = '';
				let at = 0;
				for ( const { name, pattern, start, end } of getNamedCaptureGroups( pathPattern ) ) {
					const varName = `$${ name }`;
					path[ varName ] = { description: '', type: pattern };

					const nonParamPrefix = pathPattern.slice( at, start );
					pathLabel += nonParamPrefix + varName;
					pathFormat += nonParamPrefix + '%s';
					at = end;
				}
				const nonParamSuffix = pathPattern.slice( at );
				pathLabel += nonParamSuffix;
				pathFormat += nonParamSuffix;

				const { group, description } = guessEndpointDocumentation( method, data.namespace, pathLabel );

				const request = { path };
				if ( method === 'GET' || method === 'DELETE' ) {
					request.query = args;
				} else {
					request.body = args;
				}

				const endpoint = {
					pathFormat: pathFormat || '/',
					pathLabeled: pathLabel || '/',
					request,
					description,
					group,
					method,
				};

				endpoints.push( endpoint );
			} );
		} );
	} );

	return endpoints;
};

const createApi = ( authProvider, name, url, namespaces = [ 'wp/v2' ] ) => {
	return {
		getDiscoveryUrl: version => `${ url }${ version }?context=help`,
		loadVersions: () => new Promise( resolve => resolve( { versions: namespaces } ) ),
		buildRequest: ( version, method, path, body ) => {
			return {
				url: url + version + path,
				apiNamespace: version,
				method,
				path,
				body,
			};
		},
		baseUrl: url,
		authProvider,
		name,
		parseEndpoints,
	};
};

export default createApi;
