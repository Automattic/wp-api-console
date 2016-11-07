import deepFreeze from 'deep-freeze';

import reducer from '../reducer';
import { REQUEST_RESULTS_RECEIVE, REQUEST_TRIGGER } from '../../actions';

const result = {
  id: '1',
  loading: true,
  request: {
    version: 'v1',
    apiName: 'wpcom',
    method: 'GET',
    path: '/path'
  }
};
const state = deepFreeze({ '1': result });

it('should return old stateon unknown actions', () => {
  const action = { type: 'test' };

  expect(reducer(state, action)).toEqual(state);
});

it('should append a new result when we trigger a request', () => {
  const action = {
    type: REQUEST_TRIGGER,
    payload: {
      id: '2',
      version: 'v1',
      apiName: 'wpcom',
      method: 'POST',
      path: '/path2'
    }
  };

  expect(reducer(state, action)).toEqual({
    '2': {
      id: '2',
      loading: true,
      request: {
        version: 'v1',
        apiName: 'wpcom',
        method: 'POST',
        path: '/path2'
      }
    },
    '1': result
  });

  it('should update the result when we receive results', () => {
    const action = {
      type: REQUEST_RESULTS_RECEIVE,
      payload: {
        id: '1',
        duration: 140,
        status: 500,
        body: false,
        error: 'unknown error'
      }
    };

    expect(reducer(state, action)).toEqual({
      '1': {
        id: '1',
        loading: false,
        duration: 140,
        request: {
          version: 'v1',
          apiName: 'wpcom',
          method: 'GET',
          path: '/path'
        },
        response: {
          status: 500,
          body: false,
          error: 'unknown error'
        }
      },
      result
    });
  });
});
