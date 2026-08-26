import React, { Component } from 'react';
import { connect } from 'react-redux';
import Editor from 'react-simple-code-editor';
import Prism from 'prismjs';
import 'prismjs/components/prism-json';
import 'prismjs/themes/prism.css';

import './style.css';

import {
	createRequestConfig,
	formatJsonText,
	formatRequestConfig,
} from '../../request-config/codec';
import { applyRequestConfiguration } from '../../state/request-config/actions';
import { getRequestConfigSource } from '../../state/request-config/selectors';

const getErrorMessage = ( error ) => ( error && error.message ? error.message : String( error ) );
const getRequestDraft = ( source ) =>
	source && source.endpoint ? formatRequestConfig( createRequestConfig( source ) ) : '';

export class RequestConfigEditor extends Component {
	mounted = false;

	state = {
		draft: '',
		error: '',
		applying: false,
	};

	componentDidMount() {
		this.mounted = true;
		this.syncFromRequest();
	}

	componentDidUpdate( previousProps ) {
		if ( previousProps.requestConfigSource !== this.props.requestConfigSource ) {
			this.syncFromRequest( previousProps.requestConfigSource );
		}
	}

	componentWillUnmount() {
		this.mounted = false;
	}

	safeSetState = ( nextState, callback ) => {
		if ( this.mounted ) {
			this.setState( nextState, callback );
		}
	};

	highlight = ( code ) => Prism.highlight( code, Prism.languages.json, 'json' );

	setError = ( error ) => {
		this.safeSetState( { error: getErrorMessage( error ) } );
	};

	handleChange = ( draft ) => {
		this.safeSetState( { draft, error: '' } );
	};

	syncFromRequest = ( previousSource ) => {
		try {
			const draft = getRequestDraft( this.props.requestConfigSource );
			if ( ! draft ) {
				return;
			}

			let previousDraft = '';
			try {
				previousDraft = getRequestDraft( previousSource );
			} catch ( error ) {
				// A newly valid request should replace a previously incomplete one.
			}
			if ( previousSource && draft === previousDraft ) {
				return;
			}

			this.safeSetState( { draft, error: '' } );
		} catch ( error ) {
			this.setError( error );
		}
	};

	fromRequest = () => {
		this.syncFromRequest();
	};

	formatJson = () => {
		try {
			this.safeSetState( { draft: formatJsonText( this.state.draft ), error: '' } );
		} catch ( error ) {
			this.setError( error );
		}
	};

	handlePaste = ( event ) => {
		event.preventDefault();

		const pasted =
			event.clipboardData.getData( 'text/plain' ) || event.clipboardData.getData( 'text' );
		try {
			this.safeSetState( { draft: formatJsonText( pasted ), error: '' } );
		} catch ( error ) {
			this.safeSetState( { draft: pasted } );
			this.setError( error );
		}
	};

	copyJson = async () => {
		try {
			const draft = formatJsonText( this.state.draft );
			await navigator.clipboard.writeText( draft );
			this.safeSetState( { draft, error: '' } );
		} catch ( error ) {
			this.setError( error );
		}
	};

	applyToRequest = async () => {
		this.safeSetState( { applying: true, error: '' } );
		try {
			await this.props.applyRequestConfiguration( this.state.draft );
		} catch ( error ) {
			this.setError( error );
		} finally {
			this.safeSetState( { applying: false } );
		}
	};

	render() {
		const { draft, error, applying } = this.state;
		const { requestConfigSource = {} } = this.props;
		const hasDraft = '' !== draft;
		const disabled = applying;

		return (
			<section className="request-config-editor" aria-label="Request configuration JSON editor">
				<header className="request-config-editor__title">Request configuration JSON</header>
				<Editor
					value={ draft }
					onValueChange={ this.handleChange }
					onPaste={ this.handlePaste }
					highlight={ this.highlight }
					padding={ 16 }
					disabled={ disabled }
					textareaClassName="request-config-editor__textarea"
					preClassName="request-config-editor__highlight"
					className="request-config-editor__code"
					aria-label="Request configuration JSON"
				/>
				{ error && (
					<div className="request-config-editor__error" role="alert">
						{ error }
					</div>
				) }
				<div className="request-config-editor__actions">
					<button
						type="button"
						onClick={ this.fromRequest }
						disabled={ disabled || ! requestConfigSource.endpoint }
					>
						From request
					</button>
					<button type="button" onClick={ this.formatJson } disabled={ disabled || ! hasDraft }>
						Format JSON
					</button>
					<button type="button" onClick={ this.copyJson } disabled={ disabled || ! hasDraft }>
						Copy JSON
					</button>
					<button type="button" onClick={ this.applyToRequest } disabled={ disabled || ! hasDraft }>
						{ applying ? 'Applying…' : 'Apply to request' }
					</button>
				</div>
			</section>
		);
	}
}

export default connect( ( state ) => ( { requestConfigSource: getRequestConfigSource( state ) } ), {
	applyRequestConfiguration,
} )( RequestConfigEditor );
