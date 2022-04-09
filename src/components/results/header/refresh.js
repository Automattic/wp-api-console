import React from 'react';
import { connect } from 'react-redux';

import { refresh } from '../../../state/results/actions';
import { getResultById } from '../../../state/results/selectors';

const Refresh = ( { request, refreshResult } ) => ( <span
	onClick={ () => refreshResult( request.id ) }
	className="refresh"
	title="Refresh"
>
	<i className="refresh-icon">↺</i>
    </span> );

export default connect( ( state, { id } ) => {
	return {
		request: getResultById( state, id ),
	};
}, { refreshResult: refresh } )( Refresh );
