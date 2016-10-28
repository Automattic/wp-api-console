import deepFreeze from 'deep-freeze';

import reducer from '../reducer';
import {
  SECURITY_RECEIVE_USER,
  SECURITY_CHECK_FAILED,
  SECURITY_LOGOUT
} from '../../actions';

const state = deepFreeze({
  wpcom: {
    ready: false,
    isLoggedin: false,
    user: false
  }
});

it('should return old stateon unknown actions', () => {
  const action = { type: 'test' };

  expect(reducer(state, action)).toEqual(state);
});

describe('Receive User', () => {
  it('should update api state on login success', () => {
    const user = { username: 'manil' };
    const action = {
      type: SECURITY_RECEIVE_USER,
      payload: {
        apiName: 'wpcom',
        user
      }
    };

    expect(reducer(state, action)).toEqual({
      wpcom: {
        user,
        ready: true,
        isLoggedin: true
      }
    });
  });

  it('should append new api state on login success', () => {
    const user = { username: 'manil' };
    const action = {
      type: SECURITY_RECEIVE_USER,
      payload: {
        apiName: 'wporg',
        user
      }
    };

    expect(reducer(state, action)).toEqual({
      wpcom: {
        user: false,
        ready: false,
        isLoggedin: false
      },
      wporg: {
        user,
        ready: true,
        isLoggedin: true
      }
    });
  });
});


describe('Security check failed', () => {
  it('should update api state', () => {
    const user = { username: 'manil' };
    const action = {
      type: SECURITY_CHECK_FAILED,
      payload: {
        apiName: 'wpcom'
      }
    };

    expect(reducer(state, action)).toEqual({
      wpcom: {
        user: false,
        ready: true,
        isLoggedin: false
      }
    });
  });

  it('should append new api state', () => {
    const user = { username: 'manil' };
    const action = {
      type: SECURITY_CHECK_FAILED,
      payload: {
        apiName: 'wporg'
      }
    };

    expect(reducer(state, action)).toEqual({
      wpcom: {
        user: false,
        ready: false,
        isLoggedin: false
      },
      wporg: {
        user: false,
        ready: true,
        isLoggedin: false
      }
    });
  });
});

describe('Logout success', () => {
  it('should update api state', () => {
    const user = { username: 'manil' };
    const action = {
      type: SECURITY_LOGOUT,
      payload: {
        apiName: 'wpcom'
      }
    };

    expect(reducer(state, action)).toEqual({
      wpcom: {
        user: false,
        ready: true,
        isLoggedin: false
      }
    });
  });

  it('should append new api state', () => {
    const user = { username: 'manil' };
    const action = {
      type: SECURITY_LOGOUT,
      payload: {
        apiName: 'wporg'
      }
    };

    expect(reducer(state, action)).toEqual({
      wpcom: {
        user: false,
        ready: false,
        isLoggedin: false
      },
      wporg: {
        user: false,
        ready: true,
        isLoggedin: false
      }
    });
  });
});
