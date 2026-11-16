import React from 'react';
import {createRoot} from 'react-dom/client';
import RuneApp from './RuneApp.jsx';
import '../../app/styles/tokens.css';
import '../../app/styles/components.css';
import '../../app/styles/scope-system.css';
import '../../app/styles/home-composition.css';
import '../../app/styles/home-content.css';
import '../../app/styles/home-runes.css';
import '../../app/styles/runes.css';
import './style.css';

createRoot(document.getElementById('root')).render(
  <React.StrictMode><RuneApp/></React.StrictMode>
);
