import { UI_SELECT_API, UI_SELECT_VERSION } from '../actions';

export const selectApi = api => {
  return {
    type: UI_SELECT_API,
    payload: api
  };
};

export const selectVersion = version => {
  return {
    type: UI_SELECT_VERSION,
    payload: version
  };
}
