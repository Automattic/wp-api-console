import get from 'lodash/get';

export const isReady = ( state, apiName ) =>
	get( state.security, [ apiName, 'ready' ], false );

export const isLoggedin = ( state, apiName ) =>
	get( state.security, [ apiName, 'isLoggedin' ], false );

export const getUser = ( state, apiName ) =>
	get( state.security, [ apiName, 'user' ], false );
