import React from 'react';
import { connect } from 'react-redux';
import classnames from 'classnames';

import { setRightDiff } from '../../../state/comparer/actions';
import { getRightSideId } from '../../../state/comparer/selector';

const CompareB = ( { highlighted, setRightSide } ) => {
	const className = classnames( 'compare-b', {
		highlighted,
	} );
	return (
		<span
			onClick={ setRightSide }
			className={ className }
			title="Set right side diff"
		>
			B
		</span> );
};

const mapDispatchToProps = ( dispatch, { json, id } ) => {
	return { setRightSide: () => dispatch( setRightDiff( json, id ) ) };
};

export default connect( ( state, ownProps ) => {
	return {
		highlighted: getRightSideId( state ) === ownProps.id,
	};
}, mapDispatchToProps )( CompareB );
