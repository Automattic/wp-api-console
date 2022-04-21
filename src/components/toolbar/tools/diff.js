import React from 'react';
import { connect } from 'react-redux';
import { getRightSideDiff } from '../../../state/comparer/selector';
import { getLeftSideDiff } from '../../../state/comparer/selector';
import ReactDiffViewer from 'react-diff-viewer';

const Diff = ( { leftDiff, rightDiff } ) => <ReactDiffViewer
	oldValue={ leftDiff }
	newValue={ rightDiff }
	splitView
/>;

export default connect( state => {
	const leftData = getLeftSideDiff( state );
	const rightData = getRightSideDiff( state );

	return {
		leftDiff: JSON.stringify( leftData, null, '\t' ),
		rightDiff: JSON.stringify( rightData, null, '\t' ),
	};
} )( Diff );
