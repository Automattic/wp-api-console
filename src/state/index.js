import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import router, { getStateFromUrl } from './router';
import reducer from './reducer';
import { boot } from './security/actions';
import { loadInitialState, persistState } from '../lib/redux/cache';

const store = createStore(
	reducer,
	loadInitialState( {}, getStateFromUrl(), reducer ),
	applyMiddleware( thunk, router )
);
persistState( store, reducer );
store.dispatch( boot() );

export default store;
