import { createReducer } from '../../lib/redux/create-reducer';
import {
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
};

const reducer = createReducer( defaultState, {
	[ 'SERIALIZE_URL' ]: ( state ) =>
		serializeStateForUrl( state, [ 'url', 'queryParams', 'pathValues', 'method', 'bodyParams' ] ),
	[ 'DESERIALIZE_URL' ]: ( state ) =>
		deserializeStateFromUrl( state, [ 'url', 'queryParams', 'pathValues', 'method', 'bodyParams' ] ),
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
