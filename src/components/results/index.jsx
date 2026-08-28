import React from 'react';
import { connect } from 'react-redux';
import classnames from 'classnames';
import { getResults } from '../../state/results/selectors';
import Result from './response';

import './style.css';

export class Results extends React.Component {
	componentWillMount() {
		document.addEventListener( 'click', this.overrideClickIfSelected, true );
	}

	componentWillUnmount() {
		document.removeEventListener( 'click', this.overrideClickIfSelected, true );
	}

	overrideClickIfSelected = ( event ) => {
		if ( window.getSelection().toString().length ) {
			event.stopPropagation();
		}
	};

	render() {
		const { emptyMessage, results } = this.props;

		if ( ! results.length && emptyMessage ) {
			return (
				<div className="results results--empty v2-card-empty-state" role="status">
					<p className="results__empty-message">{ emptyMessage }</p>
				</div>
			);
		}

		return (
			<div className="results">
				{ results.map( ( result ) => (
					<Result
						key={ result.id }
						result={ result }
						className={ classnames( 'request', {
							error: result.response && !! result.response.error,
						} ) }
					/>
				) ) }
			</div>
		);
	}
}

export default connect( ( state ) => {
	return {
		results: getResults( state ),
	};
} )( Results );
