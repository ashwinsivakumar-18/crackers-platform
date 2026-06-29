import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import StoreApp from './components/StoreApp.jsx';
createRoot(document.getElementById('root')).render(<React.StrictMode><StoreApp /></React.StrictMode>);
