import reducers from '../../state/reducer';
import {
	REQUEST_TRIGGER,
	API_ENDPOINTS_RECEIVE,
	REQUEST_SELECT_ENDPOINT,
} from '../../state/actions';
import { getEndpoints } from '../../state/endpoints/selectors';
import { loadEndpoints } from '../../state/endpoints/actions';

export const serializeStateToURLString = ( state ) => {
	const serializedState = reducers( state, { type: 'SERIALIZE_URL' } );

	const urlParams = new URLSearchParams();
	for ( const [ key, value ] of Object.entries( serializedState ) ) {
		if ( typeof value === 'string' && value ) {
			urlParams.set( key, value );
		}
	}
	return urlParams.toString();
};

export const deserializeURLParamsToStateEnhancement = ( urlParams ) => {
	// Convert urlParams to a plain object
	let paramsObject = {};
	for ( let [ key, value ] of urlParams.entries() ) {
		paramsObject[ key ] = value;
	}

	// Let each reducer handle its own state
	const deserializedState = reducers( paramsObject, { type: 'DESERIALIZE_URL' } );
	return deserializedState;
};

// On these actions, we compute the new URL and push it to the browser history
const actionsThatUpdateUrl = [ REQUEST_TRIGGER ];

export const serializeMiddleware = ( store ) => {
	// Outer section of middleware, runs once when the middleware is created.

	// When first loading, check the URL params to see if we need to send a request to load endpoints.
	const urlParams = new URL( window.location.href ).searchParams;
	const stateEnhancement = deserializeURLParamsToStateEnhancement( urlParams );

	let {
		ui: { api: apiFromUrl, version: versionFromUrl },
		request: { endpointPathLabeledForURLSerialize },
	} = stateEnhancement;

	// In the case that the outer url provides a endpointPathLabeledForURLSerialize,
	// we need to 1.) Fetch the entire list of endpoints, then 2.) Select the endpoint.
	// This is a workaround we do because state.request.endpoint is too large to
	// store in the URL.
	let isInitializingEndpoint = false;
	if ( endpointPathLabeledForURLSerialize && apiFromUrl && versionFromUrl ) {
		const { dispatch } = store;
		loadEndpoints( apiFromUrl, versionFromUrl )( dispatch );
		isInitializingEndpoint = true;
	}

	// The actual middleware that runs on every request.
	return ( next ) => ( action ) => {
		const result = next( action ); // Let the action pass through all middleware and reducers

		if ( actionsThatUpdateUrl.includes( action.type ) ) {
			const state = store.getState();

			const serializedState = serializeStateToURLString( state );

			const url = new URL( window.location );
			url.search = serializedState;
			window.history.pushState( {}, '', url );
		}

		if ( isInitializingEndpoint && action.type === API_ENDPOINTS_RECEIVE ) {
			const state = store.getState();
			const endpoints = getEndpoints( state, state.ui.api, state.ui.version );
			const endpoint = endpoints.find(
				( { pathLabeled } ) => pathLabeled === endpointPathLabeledForURLSerialize
			);
			if ( endpoint ) {
				store.dispatch( { type: REQUEST_SELECT_ENDPOINT, payload: { endpoint } } );
			}
			isInitializingEndpoint = false;
		}

		return result;
	};
};

export default serializeMiddleware;
