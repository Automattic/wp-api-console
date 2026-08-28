import { Card, CardBody, CardHeader } from '@wordpress/components';
import { connect, Provider } from 'react-redux';
import '@wordpress/components/build-style/style.css';

import '../app.css';
import './style.css';

import store from '../state';
import { getSelectedEndpoint } from '../state/request/selectors';
import Header from '../components/header';
import Results from '../components/results';
import ParameterWorkspace from './components/parameter-workspace';
import RequestConfigPanel from './components/request-config-panel';

export const V2Layout = ( { endpoint } ) => (
	<div className="App v2-console">
		<Header />
		<main className="v2-console__main">
			{ ! endpoint ? (
				<section className="v2-endpoint-empty-state" role="status">
					<div className="v2-endpoint-empty-state__content">
						<h2>Select an endpoint</h2>
						<p>
							Choose an endpoint to configure request parameters, generate JSON, and view request
							responses.
						</p>
					</div>
				</section>
			) : (
				<>
					<section className="v2-console__workspace" aria-label="Request workspace">
						<ParameterWorkspace />
						<RequestConfigPanel />
					</section>
					<Card className="v2-results-card">
						<CardHeader>
							<h2>Request history</h2>
						</CardHeader>
						<CardBody className="v2-results-card__body">
							<Results emptyMessage="Responses from sent requests will appear here." />
						</CardBody>
					</Card>
				</>
			) }
		</main>
	</div>
);

const ConnectedV2Layout = connect( ( state ) => ( {
	hasEndpoint: !! getSelectedEndpoint( state ),
} ) )( ( { hasEndpoint } ) => <V2Layout endpoint={ hasEndpoint } /> );

const V2App = () => (
	<Provider store={ store }>
		<ConnectedV2Layout />
	</Provider>
);

export default V2App;
