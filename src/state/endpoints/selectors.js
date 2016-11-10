import { get } from 'lodash';

export const getEndpoints = ( state, apiName, version ) =>
	get( state.endpoints, [ apiName, version ], [] )
;
