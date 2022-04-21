import React from 'react';
import { connect } from 'react-redux';

import { setLeftDiff } from '../../../state/results/actions';

const CompareA = ( { setLeftSide } ) => (
	<span
		onClick={ setLeftSide }
		className="refresh"
		title="Refresh"
	>
		A
	</span> );

const mapDispatchToProps = ( dispatch, { json } ) => {
	return { setLeftSide: () => dispatch( setLeftDiff( json ) ) };
};

export default connect( undefined, mapDispatchToProps )( CompareA );
