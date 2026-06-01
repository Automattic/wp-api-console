import React from 'react';
import classnames from 'classnames';
import RequestHeader from '../header';
import { TREE_VIEW } from '../results-view-selector';
import RequestBody from '../body';

import './style.css';

async function sha256( message ) {
	// encode as (utf-8) Uint8Array
	const msgBuffer = new TextEncoder().encode( message );

	// hash the message
	const hashBuffer = await crypto.subtle.digest( 'SHA-256', msgBuffer );

	// convert ArrayBuffer to Array
	const hashArray = Array.from( new Uint8Array( hashBuffer ) );

	// convert bytes to hex string
	const hashHex = hashArray.map( ( b ) => ( '00' + b.toString( 16 ) ).slice( -2 ) ).join( '' );
	return hashHex;
}

class Index extends React.Component {
	state = {
		view: TREE_VIEW,
		sha256Hash: '',
	};
	componentDidMount() {
		this.updateChecksum( this.props.result );
	}

	componentDidUpdate( prevProps ) {
		const currentResponseJSON = JSON.stringify( this.props.result.response );
		const prevResponseJSON = JSON.stringify( prevProps.result.response );

		if ( currentResponseJSON !== prevResponseJSON ) {
			this.updateChecksum( this.props.result );
		}
	}

	updateChecksum = async ( result ) => {
		if ( result && result.response ) {
			const hash = await sha256( JSON.stringify( result.response ) );
			this.setState( { sha256Hash: hash } );
		}
	};

	onViewChange = ( view ) => this.setState( { view } );

	render() {
		const { result } = this.props;
		const { sha256Hash } = this.state;
		return (
			<div
				key={ result.id }
				className={ classnames( 'request', {
					error: result.response && !! result.response.error,
				} ) }
			>
				<RequestHeader
					result={ result }
					view={ this.state.view }
					onViewChange={ this.onViewChange }
				/>
				<RequestBody
					response={ result.response }
					view={ this.state.view }
					onViewChange={ this.onViewChange }
				/>
				<div className="sha256-hash">Response SHA-256: { sha256Hash }</div>
			</div>
		);
	}
}

export default Index;
