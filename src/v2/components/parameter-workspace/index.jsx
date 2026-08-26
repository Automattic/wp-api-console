import { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import {
	Button,
	Card,
	CardBody,
	CardHeader,
	__experimentalNumberControl as NumberControl,
	TabPanel,
	TextControl,
	TextareaControl,
	ToggleControl,
} from '@wordpress/components';

import './style.css';

import {
	getBodyParamValues,
	getQueryParamValues,
	getSelectedEndpoint,
} from '../../../state/request/selectors';
import { setBodyParam, setQueryParam } from '../../../state/request/actions';

const PARAMETER_TABS = [
	{ name: 'query', title: 'Query' },
	{ name: 'body', title: 'Body' },
];

const hasOwn = ( object, property ) => Object.prototype.hasOwnProperty.call( object, property );

const getControlLabel = ( name ) => (
	<span className="v2-parameter-workspace__control-label">{ name }</span>
);

const serializeJsonValue = ( value ) =>
	undefined === value ? '' : JSON.stringify( value, null, 2 );

const isExpectedJsonType = ( value, type ) =>
	'array' === type
		? Array.isArray( value )
		: null !== value && 'object' === typeof value && ! Array.isArray( value );

const JsonValueControl = ( { name, onChange, type, value } ) => {
	const serializedValue = serializeJsonValue( value );
	const [ draft, setDraft ] = useState( serializedValue );
	const [ error, setError ] = useState();

	useEffect( () => {
		setDraft( serializedValue );
		setError();
	}, [ serializedValue ] );

	const updateDraft = ( nextDraft ) => {
		setDraft( nextDraft );

		try {
			const parsedValue = JSON.parse( nextDraft );
			if ( ! isExpectedJsonType( parsedValue, type ) ) {
				throw new TypeError( `Expected a JSON ${ type }.` );
			}
			setError();
			onChange( parsedValue );
		} catch {
			setError( `Enter a valid JSON ${ type }.` );
		}
	};

	return (
		<TextareaControl
			help={ error }
			label={ getControlLabel( name ) }
			onChange={ updateDraft }
			value={ draft }
		/>
	);
};

export const ParameterValueControl = ( { name, parameter, value, onChange } ) => {
	const label = getControlLabel( name );

	switch ( parameter.type ) {
		case 'boolean':
			return <ToggleControl checked={ Boolean( value ) } label={ label } onChange={ onChange } />;
		case 'integer':
		case 'number':
			return <NumberControl label={ label } onChange={ onChange } value={ value ?? '' } />;
		case 'array':
		case 'object':
			return (
				<JsonValueControl
					name={ name }
					onChange={ onChange }
					type={ parameter.type }
					value={ value }
				/>
			);
		default:
			return <TextControl label={ label } onChange={ onChange } value={ value ?? '' } />;
	}
};

const ParameterTable = ( { kind, params = {}, values = {}, onChange } ) => {
	const parameterNames = Object.keys( params );

	if ( 0 === parameterNames.length ) {
		return (
			<p className="v2-parameter-workspace__empty" role="status">
				{ `This endpoint has no ${ kind } parameters.` }
			</p>
		);
	}

	return (
		<div className="v2-parameter-workspace__table">
			<div className="v2-parameter-workspace__table-header" aria-hidden="true">
				<span>Parameter</span>
				<span>Type</span>
				<span>Value</span>
				<span />
			</div>
			{ parameterNames.map( ( name ) => {
				const parameter = params[ name ];
				const type = parameter.type || 'string';
				const isPresent = hasOwn( values, name );

				return (
					<div className="v2-parameter-workspace__row" key={ name }>
						<code className="v2-parameter-workspace__name">{ name }</code>
						<span className="v2-parameter-workspace__type" data-parameter-type={ type }>
							{ type }
						</span>
						<div className="v2-parameter-workspace__control">
							<ParameterValueControl
								name={ name }
								onChange={ ( value ) => onChange( name, value ) }
								parameter={ parameter }
								value={ values[ name ] }
							/>
						</div>
						<div className="v2-parameter-workspace__clear">
							{ isPresent && (
								<Button
									aria-label={ `Clear ${ name }` }
									onClick={ () => onChange( name ) }
									size="compact"
									variant="tertiary"
								>
									Clear
								</Button>
							) }
						</div>
					</div>
				);
			} ) }
		</div>
	);
};

export const ParameterWorkspace = ( {
	bodyParams,
	endpoint,
	queryParams,
	setBodyParam,
	setQueryParam,
} ) => {
	if ( ! endpoint ) {
		return (
			<Card className="v2-parameter-workspace">
				<CardHeader>
					<h2>Request parameters</h2>
				</CardHeader>
				<CardBody>
					<p className="v2-parameter-workspace__empty" role="status">
						Select an endpoint to configure request parameters.
					</p>
				</CardBody>
			</Card>
		);
	}

	const request = endpoint.request || {};
	const parameterSets = {
		body: {
			onChange: setBodyParam,
			params: request.body || {},
			values: bodyParams,
		},
		query: {
			onChange: setQueryParam,
			params: request.query || {},
			values: queryParams,
		},
	};

	return (
		<Card className="v2-parameter-workspace">
			<CardHeader>
				<h2>Request parameters</h2>
			</CardHeader>
			<CardBody className="v2-parameter-workspace__body">
				<TabPanel
					className="v2-parameter-workspace__tabs"
					initialTabName="query"
					tabs={ PARAMETER_TABS }
				>
					{ ( tab ) => (
						<ParameterTable
							kind={ tab.name }
							onChange={ parameterSets[ tab.name ].onChange }
							params={ parameterSets[ tab.name ].params }
							values={ parameterSets[ tab.name ].values }
						/>
					) }
				</TabPanel>
			</CardBody>
		</Card>
	);
};

export const getParameterWorkspaceProps = ( state ) => ( {
	bodyParams: getBodyParamValues( state ),
	endpoint: getSelectedEndpoint( state ),
	queryParams: getQueryParamValues( state ),
} );

export default connect( getParameterWorkspaceProps, { setBodyParam, setQueryParam } )(
	ParameterWorkspace
);
