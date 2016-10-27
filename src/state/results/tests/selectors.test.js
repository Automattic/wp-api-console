import { getResults } from '../selectors';

const results = [
  { status: 200 }
];

const state = {
  results
};

it('should return the results', () => {
  expect(getResults(state)).toEqual(results);
});
