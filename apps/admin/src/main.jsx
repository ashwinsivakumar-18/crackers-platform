import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import AdminApp from './components/AdminApp.jsx';
createRoot(document.getElementById('root')).render(<React.StrictMode><AdminApp /></React.StrictMode>);
