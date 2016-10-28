import { getSelectedApi, getSelectedVersion } from '../selectors';

const state = {
  ui: {
    api: 'wpcom',
    version: 'v1',
  }
};

it('should return the selected api', () => {
  expect(getSelectedApi(state)).toEqual('wpcom');
});

it('should return the selected version', () => {
  expect(getSelectedVersion(state)).toEqual('v1');
});
