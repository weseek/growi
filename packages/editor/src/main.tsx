import React from 'react';

import ReactDOM from 'react-dom/client';

import { CodemirrorEditor } from './components/CodemirrorEditor';

import './main.scss';

const rootElem = document.getElementById('root');

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
ReactDOM.createRoot(rootElem!).render(
  <React.StrictMode>
    <CodemirrorEditor />
  </React.StrictMode>,
);
