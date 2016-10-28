import { getEndpoints } from '../selectors';

const endpoints = [
  { path_labeled: 'myEndpoint' }
];

const state = {
  endpoints: {
    wpcom: {
      v1: endpoints
    }
  }
};

it('should return empty array if unknown apiName', () => {
  expect(getEndpoints(state, 'wporg', 'v1')).toEqual([]);
});

it('should return empty array if unknown version', () => {
  expect(getEndpoints(state, 'wpcom', 'v11')).toEqual([]);
});

it('should return the endpoints', () => {
  expect(getEndpoints(state, 'wpcom', 'v1')).toEqual(endpoints);
});
