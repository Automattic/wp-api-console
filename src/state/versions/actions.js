import { API_VERSIONS_RECEIVE } from '../actions';
import { get } from '../../api';

const receiveVersions = ( apiName, versions ) => {
	return {
		type: API_VERSIONS_RECEIVE,
		payload: {
			apiName,
			versions,
		},
	};
};

export const loadVersions = apiName => ( dispatch, getState ) => {
	const api = get( apiName );
	api.loadVersions()
		.then( ( { versions } ) => {
			dispatch( receiveVersions( apiName, versions ) );
		} );
};
