import React from 'react';
import { connect } from 'react-redux';

import { apis } from '../../api';
import { getSelectedApi } from '../../state/ui/selectors';
import { selectApi } from '../../state/ui/actions';
import OptionSelector from '../option-selector';

const ApiSelector = ({ value, selectApi }) => {
  return (
    <OptionSelector value={value} choices={apis} onChange={selectApi} isHeader />
  );
}

export default connect(
  state => {
    return {
      value: getSelectedApi(state),
      choices: apis
    }
  },
  { selectApi }
)(ApiSelector);
