import React from 'react';
import AutosizeInput from 'react-input-autosize';

import './style.css';

import ParamTooltip from '../param-tooltip';

const UrlPart = props => {
  const { parameter = false, autosize = false, name = '', value, ...remainingProps } = props;

  if (autosize) {

    return <div className="url-part">
      <AutosizeInput value={ value }
        placeholder={ name }
        inputStyle={{ fontSize: 14 }}
        data-tip data-for={ `url-part-${name}` }
        { ...remainingProps } />
      { parameter && <ParamTooltip parameter={ parameter } id={ `url-part-${name}` } name={name} /> }
    </div>
  }

  return (
      <input value={value} className="url-part" { ...remainingProps } />
  );
}

export default UrlPart;
