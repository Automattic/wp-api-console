import React from 'react';

import './style.css';

import ParamTooltip from '../param-tooltip';

const ParamBuilder = ({ title, params, values = {}, onChange }) => {
  const hasParams = !! params && Object.keys(params).length > 0;

  return (
    <div className="param-builder">
      <div className="title">{ title }</div>
      { hasParams && <div className="scroller">
          <table>
            <tbody>
              { Object.keys(params).map(paramKey => {
                  const parameter = params[paramKey];
                  return (
                    <tr key={ paramKey }>
                      <th>{ paramKey }</th>
                      <td>
                        <div>
                          <input type="text" value={ values[paramKey] || '' }
                            data-tip data-for={ `param-${paramKey}` }
                            onChange={ event => onChange(paramKey, event.target.value) } />
                          <ParamTooltip parameter={ parameter } id={ `param-${paramKey}` } name={paramKey} position="right" />
                        </div>
                      </td>
                    </tr>
                  );
                }
              )}
            </tbody>
          </table>
        </div>
      }
    </div>
  );
};

export default ParamBuilder;
