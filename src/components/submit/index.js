import React from 'react';
import { connect } from 'react-redux';

import './style.css';

import { request } from '../../state/results/actions';

const Submit = ({ request }) => {
  return <div id="submit" onClick={request}></div>
};

export default connect(undefined, { request })(Submit);
