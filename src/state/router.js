
import { REQUEST_TRIGGER, API_VERSIONS_RECEIVE, REQUEST_SELECT_ENDPOINT } from './actions';
import { defaultState as defaultRequestState } from './request/reducer';
import { defaultState as defaultUiState } from './ui/reducer';
import { loadEndpoints } from './endpoints/actions';
import { getEndpoints } from './endpoints/selectors';

function getUrlParams() {
	return new URL( window.location.href ).searchParams;
}

function encodeString( val ) {
	return ( val === null || val === undefined ) ? '' : encodeURIComponent( val );
}

function encodeObject( val ) {
	return ( typeof val === 'object' ) && Object.keys( val ).length === 0 ? '' : encodeURIComponent( JSON.stringify( val ) );
}

function decodeString( val ) {
	return decodeURIComponent( val );
}

function decodeObject( val ) {
	return JSON.parse( decodeURIComponent( val ) );
}

export const getUrlFromState = state => {

	const { request, ui } = state;

	const params = {
		bodyParams: encodeObject( request.bodyParams ),
		endpoint: encodeString( request.endpoint ? request.endpoint.pathLabeled : '' ),
		method: encodeString( request.method ),
		pathValues: encodeObject( request.pathValues ),
		queryParams: encodeObject( request.queryParams ),
		url: encodeString( request.url ),
		api: encodeString( ui.api ),
		version: encodeString( ui.version ),
	};

	// Discard empty params
	Object.keys( params ).forEach( key => ! params[ key ] && ( delete params[ key ] ) );

	// Construct url
	const urlParams = new URLSearchParams( params );
	const url = window.location.origin + window.location.pathname + '?' + urlParams.toString();

	return url;
};

export const getStateFromUrl = () => {
	const urlParams = getUrlParams();

	if ( urlParams.toString() === '' ) {
		return false;
	}

	const state = { request: { ...defaultRequestState }, ui: { ...defaultUiState } };

	try {
		for ( const [ key, value ] of urlParams.entries() ) {
			switch ( key ) {
				case 'bodyParams':
					state.request.bodyParams = decodeObject( value );
					break;
				case 'method':
					state.request.method = decodeString( value );
					break;
				case 'pathValues':
					state.request.pathValues = decodeObject( value );
					break;
				case 'queryParams':
					state.request.queryParams = decodeObject( value );
					break;
				case 'url':
					state.request.url = decodeString( value );
					break;
				case 'api':
					state.ui.api = decodeString( value );
					break;
				case 'version':
					state.ui.version = decodeString( value );
					break;
				default:
					break;
			}
		}
	} catch ( e ) {
		// Fail without breaking the app
		console.error( 'Could not parse state from url params.', e );
		return false;
	}

	return state;
};

const router = ( { getState, dispatch } ) => {

	// Determine if we need to load and select the endpoint
	let isInitializingEndpoint = false;

	const { ui = {} } = getStateFromUrl();
	const endpointUrlParam = getUrlParams().get( 'endpoint' );
	const endpointPathLabeled = endpointUrlParam ? decodeURIComponent( endpointUrlParam ) : false;
	const apiName = ui.api;
	const apiVersion = ui.version;

	if ( endpointPathLabeled && apiName && apiVersion ) {
		loadEndpoints( apiName, apiVersion )( dispatch );
		isInitializingEndpoint = true;
	}

	return next => action => {
		const state = getState();

		switch ( action.type ) {
			case REQUEST_TRIGGER:
				const url = getUrlFromState( state );
				window.history.pushState( {}, document.title, url );
				break;
			case API_VERSIONS_RECEIVE:
				// Once the endpoint is loaded, select the endpoint.
				if ( isInitializingEndpoint ) {
					const endpoints = getEndpoints( state, apiName, apiVersion );
					const endpoint = endpoints.find( ( { pathLabeled } ) => pathLabeled === endpointPathLabeled );
					if ( endpoint ) {
						dispatch( { type: REQUEST_SELECT_ENDPOINT, payload: { endpoint } } );
					}
					isInitializingEndpoint = false;
				}
				break;
			default:
				break;
		}

		return next( action );
	};
};

export default router;
