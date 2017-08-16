import React, { Component } from 'react';
import { connect } from 'react-redux';
import ClickOutside from 'react-click-outside';
import classnames from 'classnames';

import './style.css';

import CloseButton from '../close-button';
import OptionSelector from '../option-selector';
import UrlPart from '../url-part';
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

	setUrl = event => {
		this.props.updateUrl( event.target.value );
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
		const { pathParts, endpoint } = this.props;
		const { pathFormat, pathLabeled } = endpoint;

		return (
			<TinyMCE
				content={ JSON.stringify( { pathParts, pathFormat, pathLabeled } ) }
				onChange={ this.setUrl }
			/>
		);
	}

	render() {
		const { method, endpoint, url, updateMethod } = this.props;
		const { showEndpoints } = this.state;
		const methods = [ 'GET', 'POST', 'PUT', 'DELETE', 'PATCH' ];
		const submitDefaultInput = () => this.onSubmitInput( 0, true );

		return (
			<div className={ classnames( 'lookup-container', { 'no-endpoint': ! endpoint } ) }>
				<OptionSelector
					value={ endpoint ? endpoint.method : method }
					choices={ methods }
					onChange={ updateMethod }
				/>
				<div className="parts">
					{ ! endpoint &&
						<UrlPart
							ref={ this.bindInput }
							value={ url }
							onChange={ this.setUrl }
							onClick={ this.showEndpoints }
							onSubmit={ submitDefaultInput }
						/>
					}
					{ endpoint && this.renderEndpointPath() }
				</div>
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
