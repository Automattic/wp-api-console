import { createReducer } from '../../lib/redux/create-reducer';
import { API_VERSIONS_RECEIVE } from '../actions';
import schema from './schema';

const versions = createReducer( {}, {
	[API_VERSIONS_RECEIVE]: ( state, { payload: { apiName, versions } } ) => {
		return ( {
			...state,
			[apiName]: versions,
		} );},
}, schema );

export default versions;
