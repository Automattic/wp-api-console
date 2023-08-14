import { API_VERSIONS_RECEIVE } from '../actions';
import { get } from '../../api';
import { selectVersion } from '../ui/actions';
import { getSelectedVersion } from '../ui/selectors';

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
			const selectedVersion = getSelectedVersion( getState() );
			dispatch( receiveVersions( apiName, versions ) );
		} );
};
