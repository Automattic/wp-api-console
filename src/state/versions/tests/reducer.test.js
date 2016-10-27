import deepfreeze from 'deepfreeze';

import reducer from '../reducer';
import { API_VERSIONS_RECEIVE } from '../../actions';

const versions = [ 'v1' ];
const state = {
  wpcom: versions
};
deepfreeze(state);

it('should return old stateon unknown actions', () => {
  const action = { type: 'test' };

  expect(reducer(state, action)).toEqual(state);
});

it('should append a new api', () => {
  const newVersions = ['wpv2', 'wpv3'];
  const action = {
    type: API_VERSIONS_RECEIVE,
    payload: {
      apiName: 'wporg',
      versions: newVersions
    }
  };

  expect(reducer(state, action)).toEqual({
    wpcom: versions,
    wporg: newVersions
  });
});

it('should replace versions of an existing api', () => {
  const newVersions = ['wpv2', 'wpv3'];
  const action = {
    type: API_VERSIONS_RECEIVE,
    payload: {
      apiName: 'wpcom',
      versions: newVersions
    }
  };

  expect(reducer(state, action)).toEqual({
    wpcom: newVersions
  });
});
