import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import CrmApp from './components/CrmApp.jsx';
createRoot(document.getElementById('root')).render(<React.StrictMode><CrmApp /></React.StrictMode>);
