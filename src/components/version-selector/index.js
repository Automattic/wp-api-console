import React, { Component } from 'react';
import { connect } from 'react-redux';

import { getSelectedVersion, getSelectedApi } from '../../state/ui/selectors';
import { getVersions } from '../../state/versions/selectors';
import { selectVersion } from '../../state/ui/actions';
import { loadVersions } from '../../state/versions/actions';
import OptionSelector from '../option-selector';

class VersionSelector extends Component {
	componentDidMount() {
		this.props.loadVersions( this.props.api );
	}

	componentWillReceiveProps( newProps ) {
		if ( newProps.api !== this.props.api ) {
			this.props.loadVersions( newProps.api );
		}
	}

	render() {
		const { version, versions, selectVersion } = this.props;
		return (
			<OptionSelector value={ version } choices={ versions } onChange={ selectVersion } isHeader />
		);
	}
}

export default connect(
	state => {
		const api = getSelectedApi( state );
		const version = getSelectedVersion( state, api );
		const versions = getVersions( state, api );

		return {
			api,
			version,
			versions,
		};
	},
	{ selectVersion, loadVersions }
)( VersionSelector );
