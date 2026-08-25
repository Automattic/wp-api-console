import React from 'react';
import { Provider } from 'react-redux';

import './app.css';

import store from './state';
import QueryBuilder from './components/query-builder';
import Header from './components/header';
import RequestConfigEditor from './components/request-config-editor';
import Results from './components/results';

const App = () =>
	(
		<Provider store={ store }>
			<div className="App">
				<Header />
				<div className="request-workspace">
					<QueryBuilder />
					<RequestConfigEditor />
				</div>
				<Results />
			</div>
		</Provider>
	)
;

export default App;
