import React from 'react';

import './style.css';

import CloseButton from '../close-button';
import ParamTooltip from '../param-tooltip';
import ParamInput from './input';

const ParamBuilder = ( { title, params, values = {}, onChange } ) => {
	const hasParams = !! params && Object.keys( params ).length > 0;
	const changeParamValue = paramKey => value => onChange( paramKey, value );
	const resetParamValues = paramKey => () => onChange( paramKey );

	return (
		<div className="param-builder">
			<div className="title">{ title }</div>
			{ hasParams && <div className="scroller">
				<table>
					<tbody>
						{ Object.keys( params ).map( paramKey => {
							const parameter = params[ paramKey ];
							return (
								<tr key={ paramKey }>
									<th>{ paramKey }</th>
									<td>
										<ParamInput
											onChange={ changeParamValue( paramKey ) }
											type={ parameter.type }
											value={ values[ paramKey ] }
											data-tip data-for={ `param-${ paramKey }` }
										/>
										{ undefined !== values[ paramKey ] &&
											<CloseButton onClick={ resetParamValues( paramKey ) } />
										}
										<ParamTooltip
											parameter={ parameter }
											id={ `param-${ paramKey }` }
											name={ paramKey }
											position="bottom"
										/>
									</td>
								</tr>
							);
						} ) }
					</tbody>
				</table>
				</div>
			}
		</div>
	);
};

export default ParamBuilder;
