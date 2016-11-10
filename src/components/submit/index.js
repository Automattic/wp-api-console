import React from 'react';
import { connect } from 'react-redux';

import './style.css';

import { request } from '../../state/results/actions';

const Submit = ( { request } ) => <div id="submit" onClick={ request } />;

export default connect( undefined, { request } )( Submit );
