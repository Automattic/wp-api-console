import { get } from 'lodash';

export const getRecentEndpoints = ( state, apiName, version ) =>
	get( state.history, [ apiName, version ], [] )
;
