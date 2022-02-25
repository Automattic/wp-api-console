import React from 'react';
import { connect } from 'react-redux';
import classnames from 'classnames';
import { getResults } from '../../state/results/selectors';
import Result from './response';

import './style.css';

class Results extends React.Component {
	componentWillMount() {
		document.addEventListener( 'click', this.overrideClickIfSelected, true );
	}

	componentWillUnmount() {
		document.removeEventListener( 'click', this.overrideClickIfSelected, true );
	}

	overrideClickIfSelected = event => {
		if ( window.getSelection().toString().length ) {
			event.stopPropagation();
		}
	};

	render() {
		const { results } = this.props;

		return (
			<div className="results">
				{ results.map( result =>
					<Result
						key={ result.id }
						result={ result }
						className={ classnames( 'request', { error: result.response && !! result.response.error } ) }

					/>
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
