import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';

import reducer from './reducer';
import { boot } from './security/actions';
import { loadInitialState, persistState } from '../lib/redux/cache';
import initStateFromUrl from './init-state-from-url';

const store = createStore(
	reducer,
	loadInitialState( {}, reducer ),
	applyMiddleware( thunk )
);
persistState( store, reducer );
store.dispatch( boot() );
initStateFromUrl( store );

export default store;
