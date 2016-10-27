import deepfreeze from 'deepfreeze';

import reducer from '../reducer';
import { REQUEST_SELECT_ENDPOINT } from '../../actions';

const endpoint = { path_labeled: 'myEndpoint' };

const state = {
  wpcom: {
    v1: [ endpoint ]
  }
};
deepfreeze(state);

it('should return old stateon unknown actions', () => {
  const action = { type: 'test' };

  expect(reducer(state, action)).toEqual(state);
});

it('should append endpoint to a new version', () => {
  const newEndpoint = { path_labeled: 'mynewEndpoint' };
  const action = {
    type: REQUEST_SELECT_ENDPOINT,
    payload: {
      apiName: 'wpcom',
      version: 'v2',
      endpoint: newEndpoint
    }
  };

  expect(reducer(state, action)).toEqual({
    wpcom: {
      v1: [ endpoint ],
      v2: [ newEndpoint ]
    }
  });
});

it('should append endpoint to a new api', () => {
  const newEndpoint = { path_labeled: 'mynewEndpoint' };
  const action = {
    type: REQUEST_SELECT_ENDPOINT,
    payload: {
      apiName: 'wporg',
      version: 'v1',
      endpoint: newEndpoint
    }
  };

  expect(reducer(state, action)).toEqual({
    wpcom: {
      v1: [ endpoint ]
    },
    wporg: {
      v1: [ newEndpoint ]
    }
  });
});

it('should merge endpoints for the same api and version', () => {
  const newEndpoint = { path_labeled: 'mynewEndpoint' };
  const action = {
    type: REQUEST_SELECT_ENDPOINT,
    payload: {
      apiName: 'wpcom',
      version: 'v1',
      endpoint: newEndpoint
    }
  };

  expect(reducer(state, action)).toEqual({
    wpcom: {
      v1: [ newEndpoint, endpoint ]
    }
  });
});
