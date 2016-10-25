import React, { Component } from 'react';
import { connect } from 'react-redux';
import { groupBy, noop } from 'lodash';

import './style.css';

import { getSelectedVersion, getSelectedApi } from '../../state/ui/selectors';
import { getEndpoints } from '../../state/endpoints/selectors';
import { getRecentEndpoints } from '../../state/history/selectors';
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
    if ( (newProps.api !== this.props.api || this.props.version !== newProps.version) &&
      ! newProps.endpoints.length &&
      newProps.version
    ) {
      newProps.loadEndpoints(newProps.api, newProps.version);
    }
  }

  renderEndpoints(endpoints) {
    const { onSelect } = this.props;

    return endpoints.map((endpoint, index) =>
      <li key={ index } onClick={ () => onSelect(endpoint) }>
        <span>{ endpoint.method }</span>
        <code>{ endpoint.path_labeled }</code>
        <strong>{ endpoint.group }</strong>
        <em>{ endpoint.description }</em>
      </li>
    );
  }

  render() {
    const { endpoints, recentEndpoints } = this.props;
    const groupedEndpoints = groupBy(endpoints, 'group');

    return (
      <div className="endpoint-selector">
        { recentEndpoints.length > 0 && <div>
            <div className="group history">Recent</div>
            <ul>{ this.renderEndpoints(recentEndpoints) }</ul>
          </div>
        }
        { Object.keys(groupedEndpoints).map(group =>
          <div key={ group }>
            <div className="group">{ group }</div>
            <ul>{ this.renderEndpoints(groupedEndpoints[group]) }</ul>
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
    const recentEndpoints = getRecentEndpoints(state, api, version);

    return {
      api,
      version,
      endpoints,
      recentEndpoints
    }
  },
  { loadEndpoints }
)(EndpointSelector);
