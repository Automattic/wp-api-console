import { combineReducers } from 'redux';

import endpoints from './endpoints/reducer';
import request from './request/reducer';
import results from './results/reducer';
import security from './security/reducer';
import ui from './ui/reducer';
import versions from './versions/reducer';

export default combineReducers({ endpoints, request, results, security, ui, versions });
