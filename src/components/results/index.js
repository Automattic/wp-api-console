import React from 'react';
import { connect } from 'react-redux';
import classnames from 'classnames';
import JSONTree from 'react-json-tree';

import './style.css';

import RequestHeader from './header';
import { getResults } from '../../state/results/selectors';

const Results = ({ results }) => {
  const jsonTheme = {
    scheme: 'bright',
    author: 'chris kempson (http://chriskempson.com)',
    base00: '#000000',
    base01: '#303030',
    base02: '#505050',
    base03: '#b0b0b0',
    base04: '#d0d0d0',
    base05: '#e0e0e0',
    base06: '#f5f5f5',
    base07: '#ffffff',
    base08: '#fb0120',
    base09: '#fc6d24',
    base0A: '#fda331',
    base0B: '#a1c659',
    base0C: '#76c7b7',
    base0D: '#6fb3d2',
    base0E: '#d381c3',
    base0F: '#be643c'
  };

  return (
    <div className="results">
      { results.map((result, index) =>
        <div key={result.id} className={ classnames('request', { error: !! result.response.error }) }>
          <RequestHeader request={ result.request } response={ result.response } />
          <div className="response">
            { !! result.response.body &&
              <JSONTree theme={ jsonTheme } data={ result.response.body } shouldExpandNode={() => false} />
            }
          </div>
        </div>
      )}
    </div>
  );
};

export default connect(
  state => {
    return {
      results: getResults(state)
    }
  }
)(Results);
