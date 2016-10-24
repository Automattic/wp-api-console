import React, { Component } from 'react';
import { connect } from 'react-redux';
import { groupBy, noop } from 'lodash';

import './style.css';

import { getSelectedVersion, getSelectedApi } from '../../state/ui/selectors';
import { getEndpoints } from '../../state/endpoints/selectors';
import { loadEndpoints } from '../../state/endpoints/actions';

class EndpointSelector extends Component {
  static defaultProps = {
    onSelect: noop
  }

  componentDidMount() {
    if (! this.props.endpoints.length && this.props.version) {
      this.props.loadEndpoints(this.props.api, this.props.version);
    }
  }

  componentWillReceiveProps(newProps) {
    if ( (newProps.api !== this.props.api || this.props.version !== newProps.version) &&
      ! newProps.endpoints.length &&
      newProps.version
    ) {
      newProps.loadEndpoints(newProps.api, newProps.version);
    }
  }

  render() {
    const { api, endpoints, onSelect, version} = this.props;
    const groupedEndpoints = groupBy(endpoints, 'group');

    return (
      <div className="endpoint-selector">
        { Object.keys(groupedEndpoints).map(group =>
          <div key={ group }>
            <div className="group">{ group }</div>
            <ul>
              { groupedEndpoints[group].map((endpoint, index) =>
                  <li key={ `${api}-${version}-${index}` } onClick={ () => onSelect(endpoint) }>
                    <span>{ endpoint.method }</span>
                    <code>{ endpoint.path_labeled }</code>
                    <strong>{ endpoint.group }</strong>
                    <em>{ endpoint.description }</em>
                  </li>
                )
              }
            </ul>
          </div>
        )}
      </div>
    );
  }
}

export default connect(
  state => {
    const api = getSelectedApi(state);
    const version = getSelectedVersion(state, api);
    const endpoints = getEndpoints(state, api, version);

    return {
      api,
      version,
      endpoints
    }
  },
  { loadEndpoints }
)(EndpointSelector);
