import { createReducer } from '../../lib/redux/create-reducer';
import { API_ENDPOINTS_RECEIVE } from '../actions';
import schema from './schema';

const endpoints = createReducer( {}, {
	[ API_ENDPOINTS_RECEIVE ]: ( state, { payload: { apiName, version, endpoints } } ) => {
		return {
			...state,
			[ apiName ]: {
				...state[ apiName ],
				[ version ]: endpoints,
			},
		};
	},
}, schema );

export default endpoints;
