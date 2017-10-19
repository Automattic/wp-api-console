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

		if ( this.editor && this.props.content !== nextProps.content ) {
			this.settingTinyMCEContent = true;
			console.log( {
				src: 'TinyMCE componentWillReceiveProps setContent',
				prev: this.props.content,
				next: nextProps.content,
				tiny: this.editor.getContent(),
			} );
			const cursorPos = this.editor.selection.getBookmark();
			this.editor.setContent( nextProps.content );
			this.editor.selection.moveToBookmark( cursorPos );
			this.settingTinyMCEContent = false;
		}

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
		const { focus, content } = this.props;

		const settings = {
			theme: false,
			inline: true,
			toolbar: false,
			entity_encoding: 'raw', // eslint-disable-line camelcase
			convert_urls: false, // eslint-disable-line camelcase
			plugins: [],
			formats: {
				strikethrough: { inline: 'del' },
			},
		};

		window.tinymce.init( {
			...settings,
			target: this.editorNode,
			setup: editor => {
				this.editor = editor;
				// Capture change events while typing
				editor.on( 'keypress', event => {
					setTimeout( () => this.onChange( event ) );
				} );
				// Catch Backspace key presses, also selection/cursor movements
				editor.on( 'nodechange', this.onChange );
				// Capture other change events
				editor.on( 'change', this.onChange );
				editor.on( 'dirty', this.onChange ); // TODO never triggered?
				editor.on( 'focus', this.onFocus );
			},
			// eslint-disable-next-line camelcase
			init_instance_callback: editor => {
				// Set initial content, if provided
				if ( content ) {
					editor.setContent( content );
				}
			},
		} );
		this.id = ++internalId;

		// TODO manage focus in Redux state

		if ( focus ) {
			this.editorNode.focus();
		}
	}

	onChange = event => {
		if ( this.settingTinyMCEContent ) {
			// Skip onChange event caused by props change
			return;
		}
		const newContent = this.editor.getContent();
		if ( newContent !== this.props.content ) {
			this.props.onChange( newContent );
		}
	}

	onFocus = event => {
		if ( typeof this.props.onFocus === 'function' ) {
			this.props.onFocus( event );
		}
	};

	render() {
		const { tagName = 'div', style, label, className } = this.props;

		return React.createElement( tagName, {
			ref: node => ( this.editorNode = node ),
			contentEditable: true,
			suppressContentEditableWarning: true,
			className: classnames( className, 'tinymce' ),
			style,
			'aria-label': label,
		} );
	}
}
