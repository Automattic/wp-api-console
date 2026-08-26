import React from 'react';
import { Card, CardBody, CardHeader } from '@wordpress/components';

import './style.css';

import RequestConfigEditor from '../../../components/request-config-editor';

const RequestConfigPanel = () => (
	<Card className="v2-request-config-panel">
		<CardHeader>
			<h2>Request configuration JSON</h2>
		</CardHeader>
		<CardBody className="v2-request-config-panel__body">
			<RequestConfigEditor />
		</CardBody>
	</Card>
);

export default RequestConfigPanel;
