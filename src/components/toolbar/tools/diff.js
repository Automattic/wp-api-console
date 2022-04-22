import React from 'react';
import { connect } from 'react-redux';
import classnames from 'classnames';
import { getRightSideDiff, getLeftSideDiff, getVisible, getLeftSideId, getRightSideId } from '../../../state/comparer/selector';
import ReactDiffViewer, { DiffMethod } from 'react-diff-viewer';
import './style.css';
import { hideDiff } from '../../../state/comparer/actions';

const Diff = ( { leftDiff, rightDiff, visible, hideDiff, leftDiffId, rightDiffId } ) => {
	const classname = classnames( 'diff', 'container', {
		visible,
	} );
	const helpView = (
		<div className="diff-help">
			<div> Please choose two different data sources, clicking on the
				<span className="compare-a-b compare-a-b-help">A</span>
				<span className="compare-a-b compare-a-b-help">B</span>
				buttons next to each API call
			</div>
		</div>
	);
	const sameData = leftDiff === rightDiff;
	const sameDataView = ( <div className="same-json diff-help"> The provided JSONs are the same! </div> );
	const diffView = sameData ? sameDataView : ( <ReactDiffViewer
		oldValue={ leftDiff }
		newValue={ rightDiff }
		showDiffOnly={ false }
		compareMethod={ DiffMethod.WORDS }
		splitView={ false }
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
	/> );

	const content = ( leftDiffId === rightDiffId ) || ( leftDiffId === null || rightDiffId === null ) ? helpView : diffView;

	return (
		<div className={ classname }>
			<div className="popup">
				<button className="close-popup-button" onClick={ hideDiff }> Close </button>
				<div className="content" >
					{ content }
				</div>
			</div>
		</div> );
};

const mapDispatchToProps = dispatch => {
	return { hideDiff: () => dispatch( hideDiff() ) };
};


export default connect( state => {
	const leftData = getLeftSideDiff( state );
	const rightData = getRightSideDiff( state );
	const visible = getVisible( state );
	return {
		leftDiff: JSON.stringify( leftData, null, '  ' ),
		rightDiff: JSON.stringify( rightData, null, '  ' ),
		leftDiffId: getLeftSideId( state ),
		rightDiffId: getRightSideId( state ),
		visible,
	};
}, mapDispatchToProps )( Diff );
