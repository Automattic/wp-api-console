import { REQUEST_RESULTS_RECEIVE, REQUEST_TRIGGER } from '../actions';
import { getRequestMethod, getCompleteQueryUrl, getBodyParams } from '../request/selectors';
import { getSelectedApi, getSelectedVersion } from '../ui/selectors';
import { get } from '../../api';
import { getResponseStatus, getResponseError } from '../../lib/api';

window.responses = [];
const recordResponse = response => {
	window.response = response;
	window.responses.unshift( response );

	console.log(
		'%c window.response ready with ' +
			Object.keys( response ).length +
			' keys. Previous responses in window.responses[].'
		, 'color: #cccccc;'
	);
};

const receiveResults = ( {
	id,
	version,
	apiName,
	method,
	path,
	status,
	body,
	error,
	duration,
} ) => {
	recordResponse( {
		version,
		apiName,
		method,
		path,
		status,
		body,
		error,
		duration,
	} );
	return {
		type: REQUEST_RESULTS_RECEIVE,
		payload: { id, status, body, error, duration },
	};
};

const triggerRequest = ( { id, version, apiName, method, path } ) => {
	return {
		type: REQUEST_TRIGGER,
		payload: { id, version, apiName, method, path },
	};
};

export const request = () => ( dispatch, getState ) => {
	const state = getState();
	const apiName = getSelectedApi( state );
	const version = getSelectedVersion( state );
	const method = getRequestMethod( state );
	const path = getCompleteQueryUrl( state );
	const api = get( apiName );
	const body = getBodyParams( state );
	const start = new Date().getTime();
	const request = api.buildRequest( version, method, path, body );
	dispatch( triggerRequest( {
		id: start,
		version,
		apiName,
		method,
		path,
	} ) );

	return api.authProvider.request( request )
		.then( ( { status, body, error } ) => {
			const end = new Date().getTime();
			dispatch( receiveResults( {
				id: start,
				version,
				apiName,
				method,
				path,
				status: getResponseStatus( status, body, error ),
				body,
				error: getResponseError( status, body, error, true ),
				duration: end - start,
			} ) );
		} );
};
