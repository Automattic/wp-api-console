import { API_ENDPOINTS_RECEIVE } from '../actions';
import { get } from '../../api';
import { fetchEndpoints } from '../../api/discovery';

const receiveEndpoints = ( apiName, version, endpoints ) => {
	return {
		type: API_ENDPOINTS_RECEIVE,
		payload: {
			apiName,
			version,
			endpoints,
		},
	};
};

export const loadEndpoints = ( apiName, version ) => dispatch => {
	const api = get( apiName );
	return fetchEndpoints( api, version ).then( endpoints => {
		dispatch( receiveEndpoints( apiName, version, endpoints ) );
		return endpoints;
	} );
};
