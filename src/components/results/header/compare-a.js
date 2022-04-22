import React from 'react';
import { connect } from 'react-redux';
import classnames from 'classnames';

import { setLeftDiff } from '../../../state/comparer/actions';
import { getLeftSideId } from '../../../state/comparer/selector';

const CompareA = ( { highlighted, setLeftSide } ) => {
	const className = classnames( 'compare-a', {
		highlighted,
	} );
	return (
		<span
			onClick={ setLeftSide }
			className={ className }
			title="Set left side diff"
		>
			A
		</span> );
};

const mapDispatchToProps = ( dispatch, { json, id } ) => {
	return { setLeftSide: () => dispatch( setLeftDiff( json, id ) ) };
};

export default connect( ( state, ownProps ) => {
	return {
		highlighted: getLeftSideId( state ) === ownProps.id,
	};
}, mapDispatchToProps )( CompareA );
