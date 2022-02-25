import React from 'react';

import './style.css';

export const TREE_VIEW = 'tree_view';
export const JSON_VIEW = 'json_view';

const ResultsViewSelector = ( { view, onViewChange = () => {} } ) =>	{
	const setTreeView = () => {
		onViewChange( TREE_VIEW );
	};
	const setJsonView = () => {
		onViewChange( JSON_VIEW );
	};

	return (
		<div className={ 'results-view-selector__button-selector-container' }>
			<button
				onClick={ setTreeView }
				className={ `results-view-selector__button-selector${ view === TREE_VIEW ? '-selected' : '' }` }
			>
				Tree view
			</button>
			<button
				onClick={ setJsonView }
				className={ `results-view-selector__button-selector${ view === JSON_VIEW ? '-selected' : '' }` }
			>
				Raw JSON
			</button>
		</div>
	);
};


export default ResultsViewSelector;
