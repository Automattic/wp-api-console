import React from 'react';
import { connect } from 'react-redux';

import { getLeftSideDiff } from '../../../state/comparer/selector';

const CompareB = ( { leftSideDiff } ) => (
	<span
		onClick={ () => console.log( leftSideDiff ) }
		className="compare-b"
		title="Compare with A"
	>
		B
	</span> );

export default connect(
	state => {
		return {
			leftSideDiff: getLeftSideDiff( state ),
		};
	}
)( CompareB );
