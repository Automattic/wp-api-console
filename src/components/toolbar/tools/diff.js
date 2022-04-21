import React from 'react';
import { connect } from 'react-redux';
import classnames from 'classnames';
import { getRightSideDiff, getLeftSideDiff, getVisible } from '../../../state/comparer/selector';
import ReactDiffViewer from 'react-diff-viewer';
import './style.css';

const Diff = ( { leftDiff, rightDiff, visible } ) => {
	const classname = classnames( 'diff', {
		visible,
	} );
	return ( <div className={ classname }>
		<ReactDiffViewer
			oldValue={ leftDiff }
			newValue={ rightDiff }
			leftTitle="A"
			rightTitle="B"
			splitView
			showDiffOnly={ false }
			styles={ {
				diffContainer: {
					overflowX: 'auto',
					display: 'block',
					'& pre': { whiteSpace: 'pre' },
				},
				line: {
					wordBreak: 'break-word',
				},
			} }
		/>
	</div> );
};

export default connect( state => {
	const leftData = getLeftSideDiff( state );
	const rightData = getRightSideDiff( state );
	const visible = getVisible( state );
	return {
		leftDiff: JSON.stringify( leftData, null, '\t' ),
		rightDiff: JSON.stringify( rightData, null, '\t' ),
		visible,
	};
} )( Diff );
