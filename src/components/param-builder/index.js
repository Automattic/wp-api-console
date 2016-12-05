import React from 'react';
import { isUndefined } from 'lodash';
import TagsInput from 'react-tagsinput';
import 'react-tagsinput/react-tagsinput.css';

import './style.css';

import CloseButton from '../close-button';
import ParamTooltip from '../param-tooltip';

const ParamBuilder = ( { title, params, values = {}, onChange } ) => {
	const hasParams = !! params && Object.keys( params ).length > 0;
	const changeParamValue = paramKey => value => onChange( paramKey, value );
	const changeParamEventValue = paramKey => event => onChange( paramKey, event.target.value );
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
										{
											parameter.type === 'array'
												? <TagsInput
													value={ values[ paramKey ] || [] }
													inputProps={ {
														placeholder: 'Add a value',
														'data-tip': true,
														'data-for': `param-${ paramKey }`,
													} }
													onChange={ changeParamValue( paramKey ) }
												/>
												: <input
													type="text" value={ values[ paramKey ] || '' }
													data-tip data-for={ `param-${ paramKey }` }
													onChange={ changeParamEventValue( paramKey ) }
												/>
										}
										{ ! isUndefined( values[ paramKey ] ) &&
											<CloseButton onClick={ resetParamValues( paramKey ) } />
										}
										<ParamTooltip
											parameter={ parameter }
											id={ `param-${ paramKey }` }
											name={ paramKey }
											position="right"
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
