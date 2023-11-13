import reducers from '../../state/reducer';
import {
	REQUEST_TRIGGER,
	API_ENDPOINTS_RECEIVE,
	REQUEST_SELECT_ENDPOINT,
} from '../../state/actions';
import { getEndpoints } from '../../state/endpoints/selectors';
import { loadEndpoints } from '../../state/endpoints/actions';

/**
 * This lets us serialize the state to the URL.
 *
 * Note: Serialization is only ran on REQUEST_TRIGGER actions.
 *
 * The entire state is not serialized. Reducers are responsible for implementing
 * SERIALIZE_URL and DESERIALIZE_URL actions to handle their own state if they want to
 * serialize it into the URL.  They don't have to serialize all keys as the results will
 * be deep merged over the current state by cache.js.
 *
 **/

// Given a state, return a string that can be used as a URL query string.
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

// Given URL Params, return a state enhancement object that can be used to enhance the state.
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

// This middleware is responsible for serializing the state to the URL.
// It also handles a special case of loading endpoints and setting the selected endpoint.
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
		const result = next( action );

		// Serialize and upate the URL.
		if ( actionsThatUpdateUrl.includes( action.type ) ) {
			const state = store.getState();
			const serializedState = serializeStateToURLString( state );

			const url = new URL( window.location );
			url.search = serializedState;
			window.history.pushState( {}, '', url );
		}

		// Choose the correct endpoint once per load.
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
