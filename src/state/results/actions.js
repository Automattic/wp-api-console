import { REQUEST_RESULTS_RECEIVE, REQUEST_TRIGGER, SET_LEFT_DIFF } from '../actions';
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

const triggerRequest = ( { id, request } ) => {
	return {
		type: REQUEST_TRIGGER,
		payload: { id, request },
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
	const request = { apiName, api, version, method, path, body };
	dispatch( triggerRequest( {
		id: start,
		request,
	} ) );

	return api.authProvider.request( api.buildRequest( request.version, request.method, request.path, request.body ) )
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
	const request = result.request;
	const start = new Date().getTime();
	dispatch( triggerRequest( {
		id,
		request,
	} ) );

	return request.api.authProvider.request( request.api.buildRequest( request.version, request.method, request.path, request.body ) )
		.then( ( { status, body, error } ) => {
			const end = new Date().getTime();
			dispatch( receiveResults( {
				id,
				apiVersion: request.apiVersion,
				apiName: request.apiName,
				method: request.method,
				path: request.path,
				status: getResponseStatus( status, body, error ),
				body,
				error: getResponseError( status, body, error, true ),
				duration: end - start,
			} ) );
		} );
};

export const setLeftDiff = json => {
	return {
		type: SET_LEFT_DIFF,
		payload: {
			json,
		},
	};
};
