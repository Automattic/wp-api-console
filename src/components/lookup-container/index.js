import React, { Component } from 'react';
import { connect } from 'react-redux';
import { debounce, get } from 'lodash';
import ClickOutside from 'react-click-outside';

import './style.css';

import CloseButton from '../close-button';
import OptionSelector from '../option-selector';
import UrlPart from '../url-part';
import EndpointSelector from '../endpoint-selector';
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

	updateUrlAndResetEndpoint = updatedPartIndex => event => {
		const { pathParts } = this.props;
		let cursorPosition = 0;
		const url = pathParts.reduce( ( memo, part, index ) => {
			if ( part[ 0 ] === '$' ) {
				return memo + get( this.props.pathValues, [ part ], '' );
			}

			if ( index === updatedPartIndex ) {
				cursorPosition = memo.length + event.target.selectionStart;
				return memo + event.target.value;
			}

			return memo + part;
		}, '' );
		this.props.updateUrl( url );
		// Wait for the component to refresh and focus at the right position
		const focusOnUrlField = debounce( () => {
			this.setState( { showEndpoints: true } );
			this.inputs[ 0 ].focus( cursorPosition );
		} );
		focusOnUrlField();
	}

	renderEndpointPath() {
		const { pathParts, endpoint } = this.props;
		const getParamValue = param => get( this.props.pathValues, [ param ], '' );
		const pathParameterKeys = pathParts.filter( part => part[ 0 ] === '$' );
		const countInputs = pathParameterKeys.length;
		const updateUrlPart = part => event => this.props.updatePathValue( part, event.target.value );
		const submitUrlPart = ( inputIndex, last ) => () => this.onSubmitInput( inputIndex, last );
		const bindUrlPartRef = inputIndex => ref => this.bindInput( ref, inputIndex );

		return pathParts.map( ( part, index ) => {
			if ( part[ 0 ] !== '$' ) {
				return (
					<UrlPart
						key={ index }
						value={ part }
						name={ part }
						onChange={ this.updateUrlAndResetEndpoint( index ) }
					/>
				);
			}

			const pathParameter = endpoint.request.path[ part ];
			const inputIndex = pathParameterKeys.indexOf( part );
			const last = inputIndex === countInputs - 1;

			return (
				<UrlPart
					key={ index }
					value={ getParamValue( part ) }
					name={ part }
					parameter={ pathParameter }
					onChange={ updateUrlPart( part ) }
					onSubmit={ submitUrlPart( inputIndex, last ) }
					ref={ bindUrlPartRef( inputIndex ) }
				/>
			);
		} );
	}

	render() {
		const { method, endpoint, url, updateMethod } = this.props;
		const { showEndpoints } = this.state;
		const methods = [ 'GET', 'POST', 'PUT', 'DELETE', 'PATCH' ];
		const submitDefaultInput = () => this.onSubmitInput( 0, true );

		return (
			<div className="lookup-container">
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
