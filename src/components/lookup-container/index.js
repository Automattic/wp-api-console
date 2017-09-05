import React, { Component } from 'react';
import { findDOMNode } from 'react-dom';
import { connect } from 'react-redux';
import ClickOutside from 'react-click-outside';
import classnames from 'classnames';

import './style.css';

import CloseButton from '../close-button';
import OptionSelector from '../option-selector';
import EndpointSelector from '../endpoint-selector';
import TinyMCE from '../tinymce';
import { getSelectedApi, getSelectedVersion } from '../../state/ui/selectors';
import { updateMethod, selectEndpoint, updateUrl, updatePathValue } from '../../state/request/actions';
import { getMethod, getSelectedEndpoint, getUrl, getPathValues, getEndpointPathParts } from '../../state/request/selectors';
import { request } from '../../state/results/actions';

class LookupContainer extends Component {
	state = {
		showEndpoints: false,
		focusPosition: 0,
	};

	inputs = [];

	onUrlInputChanged = content => {
		const url = this.convertHtmlToUrl( content );
		// console.log( 'onUrlInputChanged', { content, url } );
		if ( url !== this.props.url ) {
			console.log( 'url changed', {
				old: url,
				'new': this.props.url,
			} );
			this.props.updateUrl( url );
		}
	};

	convertHtmlToUrl = html => {
		// Input content can look like either of these:
		// <p>content</p>
		// <!-- react-text: ID -->\n<p>content</p>\n<!-- /react-text -->
		let url = html.split( /<p[^>]*>|<\/p>/ )[ 1 ] || '';
		// Remove <span class="parameter"> tags
		url = url.replace( /<\/?span[^>]*>/g, '' );
		return url;
	};

	convertUrlPatternToHtml = ( url, pathParts ) => {
		// url: current text
		// pathParts: array of path parts of selected endpoint
		// console.log( { src: 'convertUrlPatternToHtml', url, pathParts } );
		if ( url ) {
			return url;
		}
		return pathParts.map( part => {
			if ( /^\$/.test( part ) ) {
				return '<span class="parameter">' + part + '</span>';
			}
			return part;
		} ).join( '' );
		/* TODO: convert path parts to objects and use code like this:
		return urlPattern.map( piece => {
			if ( piece.type === 'parameter' ) {
				return '<span class="parameter">' + piece.value + '</span>';
			}
			return piece.value;
		} ).join( '' );
		*/
	}

	onSubmitInput = ( index, last ) => {
		if ( last ) {
			this.props.request();
			this.hideEndpoints();
			this.inputs[ index ].blur();
		} else if ( ( index + 1 ) in this.inputs ) {
			this.inputs[ index + 1 ].focus();
		}
	}

	showEndpoints = event => {
		// console.log( 'showEndpoints', event );
		event.stopPropagation();
		this.setState( { showEndpoints: true } );
	};

	hideEndpoints = event => {
		// Do not hide the endpoint list if TinyMCE is clicked
		if (
			event &&
			event.target &&
			this.tinyMceNode &&
			this.tinyMceNode.contains( event.target )
		) {
			return;
		}

		// console.log( 'hideEndpoints', event );
		this.setState( { showEndpoints: false } );
	};

	selectEndpoint = endpoint => {
		const { apiName, version } = this.props;
		this.hideEndpoints();
		this.props.selectEndpoint( apiName, version, endpoint );
	};

	resetEndpoint = () => {
		this.selectEndpoint( false );
		this.setState( { showEndpoints: true } );
	};

	setTinyMceNode = node => {
		this.tinyMceNode = node ? findDOMNode( node ) : node;
	};

	render() {
		const {
			method,
			endpoint = {},
			pathParts,
			url,
			updateMethod,
		} = this.props;
		const { showEndpoints } = this.state;
		const methods = [ 'GET', 'POST', 'PUT', 'DELETE', 'PATCH' ];

		return (
			<div className={ classnames( 'lookup-container', { 'no-endpoint': ! endpoint } ) }>
				<OptionSelector
					value={ endpoint.method || method }
					choices={ methods }
					onChange={ updateMethod }
				/>
				<TinyMCE
					ref={ this.setTinyMceNode }
					className="url-input"
					content={ this.convertUrlPatternToHtml( url, pathParts ) }
					onFocus={ this.showEndpoints }
					onChange={ this.onUrlInputChanged }
				/>
				{ endpoint
					? <CloseButton onClick={ this.resetEndpoint } />
					: <button className="right-icon search" />
				}
				{ showEndpoints &&
					<ClickOutside onClickOutside={ this.hideEndpoints }>
						<EndpointSelector onSelect={ this.selectEndpoint } />
					</ClickOutside>
				}
			</div>
		);
	}
}

export default connect(
	state => {
		return {
			apiName: getSelectedApi( state ),
			version: getSelectedVersion( state ),
			endpoint: getSelectedEndpoint( state ),
			url: getUrl( state ),
			pathValues: getPathValues( state ),
			method: getMethod( state ),
			pathParts: getEndpointPathParts( state ),
		};
	},
	{ updateMethod, selectEndpoint, updateUrl, updatePathValue, request }
)( LookupContainer );
