import { UI_SELECT_API, UI_SELECT_VERSION } from '../actions';
import { getDefault } from '../../api';

const reducer = (state = { api: getDefault().name , version: null }, action) => {
  switch (action.type) {
    case UI_SELECT_API:
      return {
        version: null,
        api: action.payload
      };
    case UI_SELECT_VERSION:
      return {
        ...state,
        version: action.payload
      };
    default:
      return state;
  }
};

export default reducer;
