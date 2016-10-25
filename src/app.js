import React from 'react';
import { Provider } from 'react-redux';

import './app.css';

import store from './state';
import QueryBuilder from './components/query-builder';
import Header from './components/header';
import Results from './components/results';

const App = () => {
  return (
    <Provider store={ store }>
      <div className="App">
        <Header />
        <QueryBuilder />
        <Results />
      </div>
    </Provider>
  );
}

export default App;
