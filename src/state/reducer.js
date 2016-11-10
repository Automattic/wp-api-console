import { combineReducers } from 'redux';

import endpoints from './endpoints/reducer';
import history from './history/reducer';
import request from './request/reducer';
import results from './results/reducer';
import security from './security/reducer';
import ui from './ui/reducer';
import versions from './versions/reducer';

export default combineReducers( { endpoints, history, request, results, security, ui, versions } );
