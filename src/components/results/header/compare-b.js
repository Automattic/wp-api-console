import React from 'react';
import { connect } from 'react-redux';

import { setLeftDiff } from '../../../state/results/actions';
import { getLeftSideDiff } from '../../../state/results/selectors';

const CompareB = ( { leftSideDiff } ) => (
	<span
		onClick={ () => console.log( leftSideDiff ) }
		className="refresh"
		title="Refresh"
	>
		B
	</span> );

const mapDispatchToProps = ( dispatch, { json } ) => {
	return { setLeftSide: () => dispatch( setLeftDiff( json ) ) };
};

export default connect(
	state => {
		return {
			leftSideDiff: getLeftSideDiff( state ),
		};
	}
)( CompareB );
