import { REQUEST_RESULTS_RECEIVE, REQUEST_TRIGGER, REQUEST_REFRESH, REQUEST_REFRESH_RECEIVE } from '../actions';
import { getRequestMethod, getCompleteQueryUrl, getBodyParams } from '../request/selectors';
import { getSelectedApi, getSelectedVersion } from '../ui/selectors';
import { get } from '../../api';
import { getResponseStatus, getResponseError } from '../../lib/api';
import { getResultById } from './selectors';

window.responses = [];
const recordResponse = response => {
	window.response = response;
	window.responses.unshift( response );

	console.log(
		'%c window.response ready with ' +
			Object.keys( response ).length +
			' keys. Previous responses in window.responses[].'
		, 'color: #777;'
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

const refreshResults = ( {
	id,
	status,
	body,
	error,
	duration,
} ) => {
	recordResponse( {
		status,
		body,
		error,
		duration,
	} );
	return {
		type: REQUEST_REFRESH_RECEIVE,
		payload: { id, status, body, error, duration },
	};
};

const triggerRequest = ( { id, version, apiName, method, path, queryData } ) => {
	return {
		type: REQUEST_TRIGGER,
		payload: { id, version, apiName, method, path, queryData },
	};
};

const triggerRefresh = ( { request } ) => {
	return {
		type: REQUEST_REFRESH,
		payload: { request },
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
	const queryData = { apiName, api, request: api.buildRequest( version, method, path, body ) };
	dispatch( triggerRequest( {
		id: start,
		version,
		apiName,
		method,
		path,
		queryData,
	} ) );

	return api.authProvider.request( queryData.request )
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



export const refresh = id => ( dispatch, getState ) => {
	const state = getState();
	const result = getResultById( state, id );
	const queryData = result.request.queryData;
	const start = new Date().getTime();
	dispatch( triggerRefresh( { queryData } ) );

	return queryData.api.authProvider.request( queryData.request )
		.then( ( { status, body, error } ) => {
			const end = new Date().getTime();
			dispatch( receiveResults( {
				id,
				apiVersion: queryData.request.apiVersion,
				apiName: queryData.request.apiName,
				method: queryData.request.method,
				path: queryData.request.path,
				status: getResponseStatus( status, body, error ),
				body,
				error: getResponseError( status, body, error, true ),
				duration: end - start,
			} ) );
		} );
};
