import deepFreeze from 'deep-freeze';

import reducer from '../reducer';
import { REQUEST_SELECT_ENDPOINT } from '../../actions';

const endpoint = { path_labeled: 'myEndpoint' };
const state = deepFreeze({
  wpcom: {
    v1: [ endpoint ]
  }
});

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

it('should not merge duplicate endpoints for the same api and version', () => {
  const action = {
    type: REQUEST_SELECT_ENDPOINT,
    payload: {
      apiName: 'wpcom',
      version: 'v1',
      endpoint: endpoint
    }
  };

  expect(reducer(state, action)).toEqual({
    wpcom: {
      v1: [ endpoint ]
    }
  });
});

it('should put duplicate endpoints at the front of the history', () => {
  const newEndpoint = { path_labeled: 'mynewEndpoint' };
  const state2 = deepFreeze({
    wpcom: {
      v1: [ newEndpoint, endpoint ]
    }
  });
  const action = {
    type: REQUEST_SELECT_ENDPOINT,
    payload: {
      apiName: 'wpcom',
      version: 'v1',
      endpoint: endpoint
    }
  };

  expect(reducer(state2, action)).toEqual({
    wpcom: {
      v1: [ endpoint, newEndpoint ]
    }
  });
});
