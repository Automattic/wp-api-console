import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';

import reducer from './reducer';
import { boot } from './security/actions';

const store = createStore(
  reducer,
  applyMiddleware(thunk)
);

store.dispatch(boot());

export default store;
