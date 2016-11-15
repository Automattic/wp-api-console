import React from 'react';
import ReactTooltip from 'react-tooltip';
import { isPlainObject } from 'lodash';

import './style.css';

const ParamTooltip = ( { parameter, id, name, position = 'bottom' } ) =>
	(
		<ReactTooltip id={ id } place={ position } effect="solid" class="param-tooltip">
			<header>
				<code>{ name }</code>
				<em>{ parameter.type }</em>
			</header>
			<ul>
				{ isPlainObject( parameter.description )
						? Object.keys( parameter.description ).map( key => (
							<li key={ key }>
								<code>{ key }</code>
								<span>{ parameter.description[ key ] }</span>
							</li>
							) )
						: <li><span>{ parameter.description }</span></li>
				}
			</ul>
		</ReactTooltip>
	)
;

export default ParamTooltip;
