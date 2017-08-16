import { isEqual } from 'lodash';
import classnames from 'classnames';
import React from 'react';

let internalId = 0;

export default class TinyMCE extends React.Component {
	componentDidMount() {
		this.initialize();
	}

	shouldComponentUpdate() {
		// We must prevent rerenders because TinyMCE will modify the DOM, thus
		// breaking React's ability to reconcile changes.
		//
		// See: https://github.com/facebook/react/issues/6802
		return false;
	}

	componentWillReceiveProps( nextProps ) {
		if ( ! isEqual( this.props.style, nextProps.style ) ) {
			Object.assign( this.editorNode.style, nextProps.style );
		}
		
		// TODO update value based on props

		// TODO update caret position
	}

	componentWillUnmount() {
		if ( ! this.editor ) {
			return;
		}

		this.editor.destroy();
		delete this.editor;
	}

	initialize() {
		const { focus } = this.props;

		const settings = {
			theme: false,
			inline: true,
			toolbar: false,
			browser_spellcheck: true,
			entity_encoding: 'raw',
			convert_urls: false,
			plugins: [],
			formats: {
				strikethrough: { inline: 'del' },
			},
		};

		window.tinymce.init( {
			...settings,
			target: this.editorNode,
			setup: ( editor ) => {
				this.editor = editor;
				// this.props.onSetup( editor );
				editor.on( 'keypress', event => {
					setTimeout( () => this.onChange( event ) );
				} );
			},
		} );
		this.id = ++internalId;

		// TODO manage focus in Redux state

		if ( focus ) {
			this.editorNode.focus();
		}
	}

	/** @this */
	onChange = event => {
		const newContent = event.newContent || this.editor.getContent();
		console.log( 'TinyMCE onChange', event.type, { newContent } );
		if ( newContent !== this.props.content ) {
			// TODO send a Redux event
			console.log( 'TinyMCE changed to:', newContent );
		}
	}

	render() {
		const { tagName = 'div', style, content, label, className } = this.props;

		// If initial content is provided, render it into the DOM before
		// initializing TinyMCE.  This avoids a short delay by allowing us to
		// show and focus the content before it's ready to edit.
		let children;
		if ( content ) {
			children = React.Children.toArray( content );
		}

		return React.createElement( tagName, {
			ref: ( node ) => this.editorNode = node,
			contentEditable: true,
			suppressContentEditableWarning: true,
			className: classnames( className, 'tinymce' ),
			style,
			'aria-label': label,
		}, children );
	}
}
