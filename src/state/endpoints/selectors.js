import get from 'lodash/get';

export const getEndpoints = ( state, apiName, version ) =>
	get( state.endpoints, [ apiName, version ], [] )
;
