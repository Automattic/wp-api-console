import React from 'react';
import { TREE_VIEW, JSON_VIEW } from '../results-view-selector';
import JSONTree from 'react-json-tree';
import { escapeLikeJSON, stringify } from '../utils';

import './style.css';

const expandFalse = () => false;

const RequestBody = ( { response, view } ) => {

	const getItemString = ( type, data, itemType, itemString ) => (
			/* eslint-disable react/no-danger */
		<span
			className="collapsed-content"
			dangerouslySetInnerHTML={ { __html: `${ itemString } <span class="content">${ stringify( data ) }</span>` } }
		/>
			/* eslint-enable react/no-danger */
		);

	const jsonTheme = {
		extend: 'default',
		tree: {
			MozUserSelect: 'text',
			WebkitUserSelect: 'text',
		},
		nestedNodeItemString: ( node, expandedNodes, type, expanded ) => {
			return {
				className: expanded ? 'expanded' : 'collapsed',
			};
		},
	};

	// It adds double quotes when rendering strings values.
	const customStringRenderer = value => {
		if ( typeof value === 'string' ) {
			const valueWithoutQuotes = value.replace( /^"|"$/g, '' );
			let valueEscaped;
			if ( valueWithoutQuotes === value ) {
					// Probably a boolean or number
				valueEscaped = escapeLikeJSON( value );
			} else {
					// String
				valueEscaped = `"${ escapeLikeJSON( valueWithoutQuotes ) }"`;
			}
			return (
				<span className="expanded-value">{ valueEscaped }</span>
			);
		}

		return value;
	};

	return (
		<div className="response">
			{response && response.body && view === TREE_VIEW &&
				<JSONTree
					theme={ jsonTheme }
					data={ response.body }
					shouldExpandNode={ expandFalse }
					getItemString={ getItemString }
					valueRenderer={ customStringRenderer }
				/>
				}
			{response && response.body && view === JSON_VIEW &&
				<pre className="response__json-view" >
					{ JSON.stringify( response.body, null, 2 ) }
				</pre>
				}
		</div>
	);
};

export default RequestBody;
