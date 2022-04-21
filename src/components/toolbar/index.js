import React from 'react';
import { connect } from 'react-redux';
import classnames from 'classnames';
import { getSelectedEndpoint } from '../../state/request/selectors';

import './style.css';

import { getLeftSideDiff } from '../../state/comparer/selector';
import { getRightSideDiff } from '../../state/comparer/selector';

const Toolbar = ( { hasBuilder } ) => {
	const className = classnames( 'header', {
		'has-builder': hasBuilder,
	} );
	return ( <div className={ className }>
		<button className="toolbar-button"> A | B Compare </button>
	</div>
	);
};
export default connect(
    state => {
	const leftSideDiff = getLeftSideDiff( state );
	const rightSideDiff = getRightSideDiff( state );
	const endpoint = getSelectedEndpoint( state );
	return {
		hasBuilder: endpoint && ( endpoint.request.query || endpoint.request.body ),
		leftSideDiff,
		rightSideDiff,
	};
}, undefined )( Toolbar );
