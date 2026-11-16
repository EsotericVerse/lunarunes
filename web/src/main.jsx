import React from 'react';
import {createRoot} from 'react-dom/client';
import RuneApp from './RuneApp.jsx';
import './style.css';

createRoot(document.getElementById('root')).render(
  <React.StrictMode><RuneApp/></React.StrictMode>
);
