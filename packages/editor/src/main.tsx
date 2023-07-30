import React from 'react';

import ReactDOM from 'react-dom/client';

import { Playground } from './components/playground';

import './main.scss';


const rootElem = document.getElementById('root');

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
ReactDOM.createRoot(rootElem!).render(
  <React.StrictMode>
    <Playground />
  </React.StrictMode>,
);
