import { getVersions } from '../selectors';

const versions = [ 'v1', 'v2' ];
const state = {
  versions: {
    wpcom: versions
  }
};

it('should return empty array if unknown apiName', () => {
  expect(getVersions(state, 'wporg')).toEqual([]);
});

it('should return the right verions', () => {
  expect(getVersions(state, 'wpcom')).toEqual(versions);
});
