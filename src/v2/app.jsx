import React from 'react';
import { Provider } from 'react-redux';
import '@wordpress/components/build-style/style.css';

import '../app.css';
import './style.css';

import store from '../state';
import Header from '../components/header';
import Results from '../components/results';
import ParameterWorkspace from './components/parameter-workspace';
import RequestConfigPanel from './components/request-config-panel';

export const V2Layout = () => (
	<div className="App v2-console">
		<Header />
		<main className="v2-console__main">
			<section className="v2-console__workspace">
				<ParameterWorkspace />
				<RequestConfigPanel />
			</section>
			<Results />
		</main>
	</div>
);

const V2App = () => (
	<Provider store={ store }>
		<V2Layout />
	</Provider>
);

export default V2App;
