import React from 'react';

import ReactDOM from 'react-dom/client';

import { CodemirrorEditor } from './components/CodemirrorEditor';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <CodemirrorEditor />
  </React.StrictMode>,
);
