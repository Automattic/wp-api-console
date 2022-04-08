/* eslint-disable react/jsx-no-bind */
import React from 'react';
import classnames from 'classnames';

import './style.css';

export const TREE_VIEW = 'tree_view';
export const JSON_VIEW = 'json_view';


const ResultsViewSelector = ( { view, onViewChange = () => {} } ) => (
	<div className="results-view-selector__button-selector-container">
		<button
			onClick={ () => onViewChange( TREE_VIEW ) }
			className={ classnames( 'results-view-selector__button-selector', {
				selected: view === TREE_VIEW,
			} ) }
		>
				Tree view
		</button>
		<button
			onClick={ () => onViewChange( JSON_VIEW ) }
			className={ classnames( 'results-view-selector__button-selector', {
				selected: view === JSON_VIEW,
			} ) }
		>
				Raw JSON
			</button>
	</div>
	);


export default ResultsViewSelector;
