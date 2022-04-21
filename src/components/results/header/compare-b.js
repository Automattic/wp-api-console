import React from 'react';
import { connect } from 'react-redux';

import { setRightDiff } from '../../../state/comparer/actions';

const CompareB = ( { setLeftSide } ) => (
	<span
		onClick={ setLeftSide }
		className="compare-b"
		title="Set left side diff"
	>
		B
	</span> );

const mapDispatchToProps = ( dispatch, { json } ) => {
	return { setLeftSide: () => dispatch( setRightDiff( json ) ) };
};

export default connect( undefined, mapDispatchToProps )( CompareB );
