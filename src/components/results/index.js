import React from 'react';
import { connect } from 'react-redux';
import classnames from 'classnames';
import JSONTree from 'react-json-tree';

import './style.css';

import RequestHeader from './header';
import { getResults } from '../../state/results/selectors';
import { escapeLikeJSON, stringify } from './utils';

class Results extends React.Component {
	componentWillMount() {
		document.addEventListener( 'click', this.overrideClickIfSelected, true );
	}

	componentWillUnmount() {
		document.removeEventListener( 'click', this.overrideClickIfSelected );
	}

	overrideClickIfSelected = event => {
		if ( window.getSelection().toString().length ) {
			event.stopPropagation();
		}
	};

	render() {
		const { results } = this.props;

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

		const expandFalse = () => false;
		const getItemString = ( type, data, itemType, itemString ) => (
			/* eslint-disable react/no-danger */
			<span
				className="collapsed-content"
				dangerouslySetInnerHTML={ { __html: `${ itemString } <span class="content">${ stringify( data ) }</span>` } }
			/>
			/* eslint-enable react/no-danger */
		);

		const valueRenderer = value => {
			if ( typeof value === 'string' ) {
				const valueWithoutQuotes = value.replace( /^"|"$/g, '' );
				let valueEscaped;
				if ( valueWithoutQuotes === value ) {
					// Probably a boolean or number
					valueEscaped = escapeLikeJSON( value );
				} else {
					// String
					valueEscaped = '"' + escapeLikeJSON( valueWithoutQuotes ) + '"';
				}
				return (
					<span className="expanded-value">{ valueEscaped }</span>
				);
			}

			return value;
		};

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
									getItemString={ getItemString }
									valueRenderer={ valueRenderer }
								/>
							</div>
						}
					</div>
				)}
			</div>
		);
	}
}

export default connect(
	state => {
		return {
			results: getResults( state ),
		};
	}
)( Results );
