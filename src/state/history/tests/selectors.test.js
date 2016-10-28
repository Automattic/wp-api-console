import { getRecentEndpoints } from '../selectors';

const endpoints = [
  { path_labeled: 'myEndpoint' }
];

const state = {
  history: {
    wpcom: {
      v1: endpoints
    }
  }
};

it('should return empty array if unknown apiName', () => {
  expect(getRecentEndpoints(state, 'wporg', 'v1')).toEqual([]);
});

it('should return empty array if unknown version', () => {
  expect(getRecentEndpoints(state, 'wpcom', 'v11')).toEqual([]);
});

it('should return the endpoints', () => {
  expect(getRecentEndpoints(state, 'wpcom', 'v1')).toEqual(endpoints);
});
