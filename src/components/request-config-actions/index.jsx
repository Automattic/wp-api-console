import { useMemo, useState } from 'react';
import { Button, Modal, Tooltip } from '@wordpress/components';
import { connect } from 'react-redux';
import Editor from 'react-simple-code-editor';
import Prism from 'prismjs';
import 'prismjs/components/prism-json';
import 'prismjs/themes/prism.css';
import '@wordpress/components/build-style/style.css';

import './style.css';

import { createRequestConfig, formatRequestConfig } from '../../request-config/codec';
import { applyRequestConfiguration } from '../../state/request-config/actions';
import { getRequestConfigSource } from '../../state/request-config/selectors';

const getErrorMessage = ( error ) => ( error && error.message ? error.message : String( error ) );
const highlightJson = ( code ) => Prism.highlight( code, Prism.languages.json, 'json' );
const ignoreChange = () => {};

export const RequestConfigActions = ( { applyRequestConfiguration, requestConfigSource = {} } ) => {
	const [ activeDialog, setActiveDialog ] = useState();
	const [ importDraft, setImportDraft ] = useState( '' );
	const [ error, setError ] = useState( '' );
	const [ copiedFormat, setCopiedFormat ] = useState( '' );
	const [ isImporting, setIsImporting ] = useState( false );
	const hasEndpoint = Boolean( requestConfigSource.endpoint );
	const shareDraft = useMemo(
		() => ( hasEndpoint ? formatRequestConfig( createRequestConfig( requestConfigSource ) ) : '' ),
		[ hasEndpoint, requestConfigSource ]
	);

	const closeDialog = () => {
		setActiveDialog();
		setError( '' );
		setCopiedFormat( '' );
		setIsImporting( false );
	};

	const openShare = () => {
		setError( '' );
		setCopiedFormat( '' );
		setActiveDialog( 'share' );
	};

	const openImport = () => {
		setImportDraft( '' );
		setError( '' );
		setActiveDialog( 'import' );
	};

	const copyContent = async ( format, content ) => {
		try {
			await navigator.clipboard.writeText( content );
			setCopiedFormat( format );
			setError( '' );
		} catch ( copyError ) {
			setCopiedFormat( '' );
			setError( getErrorMessage( copyError ) );
		}
	};

	const copyJson = () => copyContent( 'json', shareDraft );
	const copyMarkdown = () =>
		copyContent(
			'markdown',
			'### Import this request in the API Console\n\n' +
				'Open https://developer.wordpress.com/docs/api/console/, click **Import**, and paste this JSON:\n\n' +
				'```json\n' +
				shareDraft +
				'```\n'
		);

	const importJson = async () => {
		setIsImporting( true );
		setError( '' );
		try {
			await applyRequestConfiguration( importDraft );
			closeDialog();
		} catch ( importError ) {
			setError( getErrorMessage( importError ) );
			setIsImporting( false );
		}
	};

	return (
		<div className="request-config-actions">
			<Tooltip text="Copy this request configuration">
				<button
					className="request-config-actions__trigger"
					disabled={ ! hasEndpoint }
					onClick={ openShare }
					type="button"
				>
					Share
				</button>
			</Tooltip>
			<Tooltip text="Load a request configuration from JSON">
				<button
					className="request-config-actions__trigger"
					onClick={ openImport }
					type="button"
				>
					Import
				</button>
			</Tooltip>

			{ 'share' === activeDialog && (
				<Modal title="Share request configuration" onRequestClose={ closeDialog }>
					<label className="request-config-dialog__editor-label" htmlFor="share-request-json">
						Shared request JSON
					</label>
					<Editor
						aria-label="Shared request JSON"
						className="request-config-dialog__editor"
						highlight={ highlightJson }
						onValueChange={ ignoreChange }
						padding={ 16 }
						preClassName="request-config-dialog__highlight"
						readOnly
						textareaClassName="request-config-dialog__textarea"
						textareaId="share-request-json"
						value={ shareDraft }
					/>
					{ error && (
						<p className="request-config-dialog__error" role="alert">
							{ error }
						</p>
					) }
					<div className="request-config-dialog__actions">
						<Button onClick={ copyJson } variant="primary">
							{ 'json' === copiedFormat ? 'Copied' : 'Copy JSON' }
						</Button>
						<Button onClick={ copyMarkdown } variant="secondary">
							{ 'markdown' === copiedFormat ? 'Copied' : 'Copy Markdown' }
						</Button>
					</div>
				</Modal>
			) }

			{ 'import' === activeDialog && (
				<Modal title="Import request configuration" onRequestClose={ closeDialog }>
					<label className="request-config-dialog__editor-label" htmlFor="import-request-json">
						Import request JSON
					</label>
					<Editor
						aria-label="Import request JSON"
						autoFocus
						className="request-config-dialog__editor"
						highlight={ highlightJson }
						onValueChange={ ( value ) => {
							setImportDraft( value );
							setError( '' );
						} }
						padding={ 16 }
						placeholder="Paste request configuration JSON"
						preClassName="request-config-dialog__highlight"
						textareaClassName="request-config-dialog__textarea"
						textareaId="import-request-json"
						value={ importDraft }
					/>
					{ error && (
						<p className="request-config-dialog__error" role="alert">
							{ error }
						</p>
					) }
					<div className="request-config-dialog__actions">
						<Button onClick={ closeDialog } variant="tertiary">
							Cancel
						</Button>
						<Button
							disabled={ isImporting || ! importDraft.trim() }
							onClick={ importJson }
							variant="primary"
						>
							{ isImporting ? 'Importing…' : 'Import' }
						</Button>
					</div>
				</Modal>
			) }
		</div>
	);
};

export default connect( ( state ) => ( { requestConfigSource: getRequestConfigSource( state ) } ), {
	applyRequestConfiguration,
} )( RequestConfigActions );
