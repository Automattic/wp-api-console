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

	const customStringRenderer = ( valueAsString, value ) => {
		if ( 'string' !== typeof valueAsString ) {
			return valueAsString;
		}

		const displayValue = 'string' === typeof value
			? `"${ escapeLikeJSON( value ) }"`
			: valueAsString;

		return <span className="expanded-value">{ displayValue }</span>;
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
