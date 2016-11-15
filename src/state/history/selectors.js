import get from 'lodash/get';

export const getRecentEndpoints = ( state, apiName, version ) =>
	get( state.history, [ apiName, version ], [] )
;
