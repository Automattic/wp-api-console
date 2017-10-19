import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';

import reducer from './reducer';
import { boot } from './security/actions';
import { loadInitialState, persistState } from '../lib/redux/cache';

const middlewares = [ thunk ];
if ( process.env.NODE_ENV === 'development' ) {
	const { createLogger } = require( 'redux-logger' );
	const logger = createLogger( { collapsed: () => true } );
	middlewares.push( logger );
}

const store = createStore(
	reducer,
	loadInitialState( {}, reducer ),
	applyMiddleware( ...middlewares )
);
persistState( store, reducer );
store.dispatch( boot() );

export default store;
