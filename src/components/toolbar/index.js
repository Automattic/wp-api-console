import React from 'react';
import { connect } from 'react-redux';
import classnames from 'classnames';
import { getSelectedEndpoint } from '../../state/request/selectors';

import './style.css';

import { getLeftSideDiff, getRightSideDiff, getVisible } from '../../state/comparer/selector';
import { toggleVisibility } from '../../state/comparer/actions';

const Toolbar = ( { hasBuilder, visible, toogleVisible } ) => {
	const classNameContainer = classnames( 'header', {
		'has-builder': hasBuilder,
	} );

	const classNameButton = classnames( 'toolbar-button', {
		enabled: visible,
	} );
	return (
		<div className={ classNameContainer }>
			<button className={ classNameButton } onClick={ toogleVisible }>
				<span className="compare-a-b">A</span> =|=
				<span className="compare-a-b">B</span>
			</button>
		</div>
	);
};

const mapDispatchToProps = dispatch => {
	return { toogleVisible: () => dispatch( toggleVisibility() ) };
};

export default connect(
    state => {
	const leftSideDiff = getLeftSideDiff( state );
	const rightSideDiff = getRightSideDiff( state );
	const visible = getVisible( state );
	const endpoint = getSelectedEndpoint( state );
	return {
		hasBuilder: endpoint && ( endpoint.request.query || endpoint.request.body ),
		leftSideDiff,
		rightSideDiff,
		visible,
	};
}, mapDispatchToProps )( Toolbar );
