import { isReady, isLoggedin, getUser } from '../selectors';

const user = { username: 'lydia' };

const state = {
  security: {
    wpcom: {
      ready: true,
      isLoggedin: true,
      user
    }
  }
};

describe('isReady', () => {
  it('should return false if api unknown', () => {
    expect(isReady(state, 'wporg')).toEqual(false);
  });

  it('should return the right value from state', () => {
    expect(isReady(state, 'wpcom')).toEqual(true);
  });
});

describe('isLoggedin', () => {
  it('should return false if api unknown', () => {
    expect(isReady(state, 'wporg')).toEqual(false);
  });

  it('should return the right value from state', () => {
    expect(isLoggedin(state, 'wpcom')).toEqual(true);
  });
});

describe('getUser', () => {
  it('should return false if api unknown', () => {
    expect(isReady(state, 'wporg')).toEqual(false);
  });

  it('should return the right value from state', () => {
    expect(getUser(state, 'wpcom')).toEqual(user);
  });
});
