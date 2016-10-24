import { combineReducers } from 'redux';

import endpoints from './endpoints/reducer';
import request from './request/reducer';
import results from './results/reducer';
import ui from './ui/reducer';
import versions from './versions/reducer';

export default combineReducers({ endpoints, request, results, ui, versions });
