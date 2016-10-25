import React from 'react';

import './style.css';

const ParamBuilder = ({ title, params, values = {}, onChange }) => {
  const hasParams = !! params && Object.keys(params).length > 0;

  return (
    <div className="param-builder">
      <div className="title">{ title }</div>
      { hasParams && <div className="scroller">
          <table>
            <tbody>
              { Object.keys(params).map(paramKey =>
                  <tr key={ paramKey }>
                    <th>{ paramKey }</th>
                    <td>
                      <input type="text" value={ values[paramKey] || '' }
                        onChange={ event => onChange(paramKey, event.target.value) } />
                    </td>
                  </tr>
              )}
            </tbody>
          </table>
        </div>
      }
    </div>
  );
};

export default ParamBuilder;
