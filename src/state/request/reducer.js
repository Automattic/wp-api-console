import { createReducer } from '../../lib/redux/create-reducer';
import {
	SERIALIZE_URL,
	DESERIALIZE_URL,
	REQUEST_SET_METHOD,
	REQUEST_SELECT_ENDPOINT,
	REQUEST_UPDATE_URL,
	REQUEST_UPDATE_PATH_PART_VALUE,
	REQUEST_SET_QUERY_PARAM,
	REQUEST_SET_BODY_PARAM,
	UI_SELECT_API,
	UI_SELECT_VERSION,
} from '../actions';
import schema from './schema';
import { serializeStateForUrl, deserializeStateFromUrl } from '../../lib/utils';

const defaultState = {
	method: 'GET',
	endpoint: false,
	pathValues: {},
	url: '',
	queryParams: {},
	bodyParams: {},
	endpointPathLabeledForURLSerialize: '', // A key of which endpoint is selected, used for url serialization. This is a special case that requires coordination between reducers and is handled in middleware.
};

const reducer = createReducer( defaultState, {
	[ SERIALIZE_URL ]: ( state ) =>
		serializeStateForUrl( state, [ 'url', 'queryParams', 'pathValues', 'method', 'bodyParams', 'endpointPathLabeledForURLSerialize' ] ),
	[ DESERIALIZE_URL ]: ( state ) => {
		let newState = deserializeStateFromUrl( state, [ 'url', 'queryParams', 'pathValues', 'method', 'bodyParams', 'endpointPathLabeledForURLSerialize' ] );
		if ( ! newState.endpointPathLabeledForURLSerialize ) {
			newState.endpoint = false;
		}
		return newState;
	},
	[ REQUEST_SET_METHOD ]: ( state, { payload } ) => {
		return ( {
			...state,
			method: payload,
		} );
	},
	[ REQUEST_SELECT_ENDPOINT ]: ( state, { payload: { endpoint } } ) => {
		return ( {
			...state,
			endpoint,
			endpointPathLabeledForURLSerialize: endpoint?.pathLabeled || '',
			url: '',
		} );
	},
	[ REQUEST_UPDATE_URL ]: ( state, { payload } ) => {
		return ( {
			...state,
			url: payload,
		} );
	},
	[ REQUEST_UPDATE_PATH_PART_VALUE ]: ( state, { payload: { pathPart, value } } ) => {
		return ( {
			...state,
			pathValues: {
				...state.pathValues,
				[ pathPart ]: value,
			},
		} );
	},
	[ REQUEST_SET_BODY_PARAM ]: ( state, { payload: { param, value } } ) => {
		return ( {
			...state,
			bodyParams: {
				...state.bodyParams,
				[ param ]: value,
			},
		} );
	},
	[ REQUEST_SET_QUERY_PARAM ]: ( state, { payload: { param, value } } ) => {
		return ( {
			...state,
			queryParams: {
				...state.queryParams,
				[ param ]: value,
			},
		} );
	},
	[ UI_SELECT_VERSION ]: ( state, { payload: { param, value } } ) => {
		return ( {
			...state,
			endpoint: false,
			url: '',
		} );
	},
	[ UI_SELECT_API ]: ( state, { payload: { param, value } } ) => defaultState,
}, schema );

export default reducer;
