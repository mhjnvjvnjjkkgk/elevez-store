import React from 'react';
import ReactDOM from 'react-dom/client';
import AdminDashboardApp from './dashboard';

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(
  <React.StrictMode>
    <AdminDashboardApp />
  </React.StrictMode>
);
