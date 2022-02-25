import React from 'react';
import classnames from 'classnames';
import RequestHeader from '../header';
import { TREE_VIEW } from '../results-view-selector';
import RequestBody from '../body';

import './style.css';

class Index extends React.Component {
	componentWillMount() {
		this.setState( { view: TREE_VIEW } );
	}

	onViewChange = view => {
		this.setState( { view } );
	}

	render() {
		const { result } = this.props;
		return (
			<div key={ result.id } className={ classnames( 'request', { error: result.response && !! result.response.error } ) }>
				<RequestHeader result={ result } view={ this.state.view } onViewChange={ this.onViewChange } />
				<RequestBody response={ result.response } view={ this.state.view } onViewChange={ this.onViewChange } />
			</div>
		);
	}
}

export default Index;
