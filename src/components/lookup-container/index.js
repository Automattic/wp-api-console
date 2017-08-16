import React, { Component } from 'react';
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

	setUrlInputContent = content => {
		// Input content can look like either of these:
		// <p>content</p>
		// <!-- react-text: ID -->\n<p>content</p>\n<!-- /react-text -->
		const url = content.split( /<p[^>]*>|<\/p>/ )[ 1 ] || '';
		console.log( 'setUrlInputContent', { content, url } );
		this.setUrl( url );
	};

	setUrl = url => {
		this.props.updateUrl( url );
	};

	bindInput = ( ref, index = 0 ) => {
		this.inputs[ 0 ] = ref;
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
		event.stopPropagation();
		this.setState( { showEndpoints: true } );
	};

	hideEndpoints = event => {
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

	renderEndpointPath() {
	}

	render() {
		const {
			method,
			endpoint = {},
			updateMethod,
		} = this.props;
		const { showEndpoints } = this.state;
		const methods = [ 'GET', 'POST', 'PUT', 'DELETE', 'PATCH' ];
		const submitDefaultInput = () => this.onSubmitInput( 0, true );

		const { pathParts } = this.props;
		const { pathFormat, pathLabeled } = endpoint;

		return (
			<div className={ classnames( 'lookup-container', { 'no-endpoint': ! endpoint } ) }>
				<OptionSelector
					value={ endpoint.method || method }
					choices={ methods }
					onChange={ updateMethod }
				/>
				<TinyMCE
					className="url-input"
					content={ JSON.stringify( { pathParts, pathFormat, pathLabeled } ) }
					onChange={ this.setUrlInputContent }
				/>
				{ endpoint
						? <CloseButton onClick={ this.resetEndpoint } />
						: <div className="right-icon search"><a /></div>
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
