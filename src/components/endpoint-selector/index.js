import React, { Component } from 'react';
import { connect } from 'react-redux';
import { groupBy, sortBy, noop } from 'lodash';

import './style.css';

import { getSelectedVersion, getSelectedApi } from '../../state/ui/selectors';
import { getEndpoints } from '../../state/endpoints/selectors';
import { getRecentEndpoints } from '../../state/history/selectors';
import { filterEndpoints } from '../../state/request/selectors';
import { loadEndpoints } from '../../state/endpoints/actions';

class EndpointSelector extends Component {
	static defaultProps = {
		onSelect: noop,
	}

	componentDidMount() {
		if ( this.props.version ) {
			this.props.loadEndpoints( this.props.api, this.props.version );
		}
	}

	componentWillReceiveProps( newProps ) {
		if ( ( newProps.api !== this.props.api || this.props.version !== newProps.version ) &&
			newProps.version
		) {
			newProps.loadEndpoints( newProps.api, newProps.version );
		}
	}

	renderEndpoints( endpoints ) {
		const { onSelect } = this.props;
		const onSelectEndpoint = endpoint => () => onSelect( endpoint );

		return sortBy( endpoints, 'pathLabeled' ).map( ( endpoint, index ) =>
			<li key={ index } onClick={ onSelectEndpoint( endpoint ) }>
				<span className="method">{ endpoint.method }</span>
				<code>{ endpoint.pathLabeled }</code>
				<strong>{ this.getGroupText( endpoint.group ) }</strong>
				<em>{ endpoint.description }</em>
			</li>
		);
	}

	getGroupText( group, isHeading = false ) {
		if ( group === '__do_not_document' ) {
			return ( isHeading ? '(Undocumented)' : '' );
		}
		if ( ! group ) {
			return ( isHeading ? '(No group)' : '' );
		}
		// Add a zero-width space to force 'text-transform: capitalize' to work
		return ( isHeading ? '' : '\u200b' ) + group;
	}

	render() {
		const { endpoints, recentEndpoints } = this.props;
		const groupedEndpoints = groupBy( endpoints, 'group' );

		return (
			<div className="endpoint-selector">
				{ recentEndpoints.length > 0 && (
					<div>
						<div className="group history">Recent</div>
						<ul>{ this.renderEndpoints( recentEndpoints ) }</ul>
					</div>
				) }
				{ Object.keys( groupedEndpoints ).map( group => (
					<div key={ group }>
						<div className="group">{ this.getGroupText( group, true ) }</div>
						<ul>{ this.renderEndpoints( groupedEndpoints[ group ] ) }</ul>
					</div>
				) ) }
			</div>
		);
	}
}

export default connect(
	state => {
		const api = getSelectedApi( state );
		const version = getSelectedVersion( state, api );
		const endpoints = filterEndpoints( state, getEndpoints( state, api, version ) );
		const recentEndpoints = filterEndpoints(
			state,
			getRecentEndpoints( state, api, version )
		);

		return {
			api,
			version,
			endpoints,
			recentEndpoints,
		};
	},
	{ loadEndpoints }
)( EndpointSelector );
