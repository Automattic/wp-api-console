import React from 'react';
import { connect } from 'react-redux';
import classnames from 'classnames';
import JSONTree from 'react-json-tree';

import './style.css';

import RequestHeader from './header';
import { getResults } from '../../state/results/selectors';
import { stringify } from './utils';

const Results = ( { results } ) => {
	const jsonTheme = {
		extend: 'default',
		nestedNodeItemString: ( node, expandedNodes, type, expanded ) => {
			return {
				className: expanded ? 'expanded' : 'collapsed',
			};
		},
	};

	const expandFalse = () => false;
	const itemString = ( type, data, itemType, itemString ) => (
		/* eslint-disable */
		<span
			className="collapsed-content"
			dangerouslySetInnerHTML={ { __html: `${ itemString } <span class="content">${ stringify( data ) }</span>` } }
		/>
		/* eslint-enable */
	);

	return (
		<div className="results">
			{ results.map( ( result, index ) =>
				<div key={ result.id } className={ classnames( 'request', { error: result.response && !! result.response.error } ) }>
					<RequestHeader result={ result } />
					{ result.response && result.response.body &&
						<div className="response">
							<JSONTree
								theme={ jsonTheme }
								data={ result.response.body }
								shouldExpandNode={ expandFalse }
								getItemString={ itemString }
							/>
						</div>
					}
				</div>
			)}
		</div>
	);
};

export default connect(
	state => {
		return {
			results: getResults( state ),
		};
	}
)( Results );
