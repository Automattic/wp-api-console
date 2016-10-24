import { API_VERSIONS_RECEIVE } from '../actions';

const versions = (state = {}, action) => {
  switch (action.type) {
    case API_VERSIONS_RECEIVE:
      const { apiName, versions } = action.payload;
      return {
        ...state,
        [apiName]: versions
      };
    default:
      return state;
  }
};

export default versions;
