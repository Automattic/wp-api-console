/* eslint-disable react/jsx-no-bind */
import React from 'react';

import './style.css';

export const TREE_VIEW = 'tree_view';
export const JSON_VIEW = 'json_view';


const ResultsViewSelector = ( { view, onViewChange = () => {} } ) => (
	<div className={ 'results-view-selector__button-selector-container' }>
		<button
			onClick={ () => onViewChange( TREE_VIEW ) }
			className={ `results-view-selector__button-selector${ view === TREE_VIEW ? '-selected' : '' }` }
		>
				Tree view
		</button>
		<button
			onClick={ () => onViewChange( JSON_VIEW ) }
			className={ `results-view-selector__button-selector${ view === JSON_VIEW ? '-selected' : '' }` }
		>
				Raw JSON
			</button>
	</div>
	);


export default ResultsViewSelector;
