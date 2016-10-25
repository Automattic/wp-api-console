import React from 'react';
import AutosizeInput from 'react-input-autosize';

import './style.css';

const UrlPart = props => {
  const { autosize = false, defaultValue = '', value, ...remainingProps } = props;

  if (autosize) {
    return <AutosizeInput className="url-part" value={ value } placeholder={ defaultValue } { ...remainingProps }
      inputStyle={{ fontSize: 14 }}/>
  }

  return (
    <input value={value} className="url-part" placeholder={ defaultValue } { ...remainingProps } />
  );
}

export default UrlPart;
