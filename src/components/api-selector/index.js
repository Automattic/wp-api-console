import React, { Component } from 'react';
import { connect } from 'react-redux';

import { apis } from '../../api';
import { getSelectedApi } from '../../state/ui/selectors';
import { selectApi } from '../../state/ui/actions';
import { boot } from '../../state/security/actions';
import OptionSelector from '../option-selector';

class ApiSelector extends Component {
  componentDidMount() {
    this.props.boot(this.props.value);
  }

  selectApi = newApi => {
    this.props.boot(newApi);
    this.props.selectApi(newApi);
  };

  render() {
    const { value } = this.props;
    return (
      <OptionSelector value={ value } choices={ apis } onChange={ this.selectApi } isHeader />
    );
  }
}

export default connect(
  state => {
    return {
      value: getSelectedApi(state),
      choices: apis
    }
  },
  { selectApi, boot }
)(ApiSelector);
