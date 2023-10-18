import React from 'react';
import { Provider } from 'react-redux';

import './app.css';

import store from './state';
import QueryBuilder from './components/query-builder';
import Toolbar from './components/toolbar';
import Header from './components/header';
import Results from './components/results';
import Diff from './components/toolbar/tools/diff';

const App = () =>
	(
		<Provider store={ store }>
			<div className="App">
				<Header />
				<QueryBuilder />
				<Toolbar />
				<Diff />
				<Results />
			</div>
		</Provider>
	)
;

export default App;
