import React from 'react';
import { connect } from 'react-redux';

import './style.css';

import { getSelectedEndpoint, getQueryParams, getBodyParams } from '../../state/request/selectors';
import { setQueryParam, setBodyParam } from '../../state/request/actions';
import ParamBuilder from '../param-builder';

const QueryBuilder = ({ bodyParams, endpoint, queryParams, setBodyParam, setQueryParam }) => {
  return (
    <div className="builder">
      { endpoint && <ParamBuilder title="Query"
          params={endpoint.request.query}
          values={queryParams}
          onChange={ setQueryParam } /> }
      { endpoint && <ParamBuilder title="Body"
          params={endpoint.request.body}
          values={bodyParams}
          onChange={ setBodyParam }/> }
    </div>
  );
};

export default connect(
  state => {
    return {
      endpoint: getSelectedEndpoint(state),
      queryParams: getQueryParams(state),
      bodyParams: getBodyParams(state)
    }
  },
  { setQueryParam, setBodyParam }
)(QueryBuilder);
