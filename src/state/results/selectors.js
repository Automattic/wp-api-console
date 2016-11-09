import { values } from 'lodash';

export const getResults = state =>
  values(state.results).sort((a, b) => b.id - a.id);
