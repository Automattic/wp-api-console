import React, { Component } from 'react';
import { connect } from 'react-redux';
import ClickOutside from 'react-click-outside';

import './style.css';

import OptionSelector from '../option-selector';
import UrlPart from '../url-part';
import EndpointSelector from '../endpoint-selector';
import { getSelectedApi, getSelectedVersion } from '../../state/ui/selectors';
import { updateMethod, selectEndpoint, updateUrl, updatePathValue } from '../../state/request/actions';
import { getMethod, getSelectedEndpoint, getUrl, getPathValues, getEndpointPathParts } from '../../state/request/selectors';

class LookupContainer extends Component {
  state = {
    showEndpoints: false
  };

  setUrl = event => {
    this.props.updateUrl(event.target.value);
  };

  showEndpoints = event => {
    event.stopPropagation();
    this.setState({ showEndpoints: true });
  };

  hideEndpoints = event => {
    this.setState({ showEndpoints: false });
  };

  selectEndpoint = endpoint => {
    const { apiName, version } = this.props;
    this.hideEndpoints();
    this.props.selectEndpoint(apiName, version, endpoint);
  };

  resetEndpoint = () => {
    this.selectEndpoint(false);
    this.setState({ showEndpoints: true });
  };

  renderEndpointPath() {
    const { pathParts } = this.props;
    const getParamValue = param => this.props.pathValues[param] ? this.props.pathValues[param] : '';

    return pathParts.map((part, index) =>
      part[0] === '$'
        ? <UrlPart key={ index }
            value={ getParamValue(part) }
            defaultValue={ part }
            onChange={ event => this.props.updatePathValue(part, event.target.value) }
            autosize />
        : <div key={ index } className="url-segment">{ part }</div>
    )
  }

  render() {
    const { method, endpoint, url, updateMethod } = this.props;
    const { showEndpoints } = this.state;
    const methods = [ 'GET', 'POST', 'PUT', 'DELETE', 'PATCH' ];

    return (
      <div className="lookup-container">
        <OptionSelector
          value={ endpoint ? endpoint.method : method }
          choices={ endpoint ? [ endpoint.method ] : methods }
          onChange={ updateMethod } />
        <div className="parts">
          { ! endpoint && <UrlPart value={ url } onChange={ this.setUrl } onClick={ this.showEndpoints } /> }
          { endpoint && this.renderEndpointPath() }
        </div>
        { endpoint
            ? <div className="right-icon close"><a onClick={ this.resetEndpoint }></a></div>
            : <div className="right-icon search"><a></a></div>
        }
        { showEndpoints &&
          <ClickOutside onClickOutside={ this.hideEndpoints }>
            <EndpointSelector onSelect={ this.selectEndpoint }/>
          </ClickOutside>
        }
      </div>
    );
  }
}

export default connect(
  state => {
    return {
      apiName: getSelectedApi(state),
      version: getSelectedVersion(state),
      endpoint: getSelectedEndpoint(state),
      url: getUrl(state),
      pathValues: getPathValues(state),
      method: getMethod(state),
      pathParts: getEndpointPathParts(state)
    };
  },
  { updateMethod, selectEndpoint, updateUrl, updatePathValue }
)(LookupContainer);
