import React from 'react';

import './style.css';

const RequestHeader = ({ request: { path, method, apiName, version, duration }, response: { status, body, error } }) => {
  let filename = path;
  if (filename.indexOf("/") === 0) {
    filename = filename.slice(1);
  }
  filename = filename.replace(/\//g, '-') + '.json';

  return (
    <div className="request-header">
      <code className="apiName">{ apiName }</code>
      <code className="method">{ method }</code>
      <code className="path">{ `${version}${path}` }</code>
      { !! error && <span className="error">{ `${status} - ${error}` }</span> }
      <span className="duration">{ `${duration}ms` }</span>
      { !! body &&
        <a className="download" title="Download" target="_blank" download={ filename }
          href={ 'data:application/json;charset=UTF-8,' + encodeURIComponent(JSON.stringify(body, null, "\t")) }></a>
      }
    </div>
  );
};

export default RequestHeader;
