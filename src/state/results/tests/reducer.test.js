import deepFreeze from 'deep-freeze';

import reducer from '../reducer';
import { REQUEST_RESULTS_RECEIVE } from '../../actions';

const result = {
  id: '1',
  request: {
    version: 'v1',
    apiName: 'wpcom',
    method: 'GET',
    path: '/path',
    duration: 100
  },
  response: {
    status: 200,
    body: {},
    error: false
  }
};
const state = deepFreeze([ result ]);

it('should return old stateon unknown actions', () => {
  const action = { type: 'test' };

  expect(reducer(state, action)).toEqual(state);
});

it('should append a new result', () => {
  const newEndpoint = { path_labeled: 'mynewEndpoint' };
  const action = {
    type: REQUEST_RESULTS_RECEIVE,
    payload: {
      id: '2',
      version: 'v1',
      apiName: 'wpcom',
      method: 'POST',
      path: '/path2',
      duration: 140,
      status: 500,
      body: false,
      error: 'unknown error'
    }
  };

  expect(reducer(state, action)).toEqual([
    {
      id: '2',
      request: {
        version: 'v1',
        apiName: 'wpcom',
        method: 'POST',
        path: '/path2',
        duration: 140
      },
      response: {
        status: 500,
        body: false,
        error: 'unknown error'
      }
    },
    result
  ]);
});
