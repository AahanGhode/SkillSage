import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Welcome from './pages/Welcome';
import Dashboard from './pages/Dashboard';

function App() {
  return (
    <BrowserRouter>
        <Routes>
            <Route path="/" element={<Welcome/>} />
            <Route path="/dashboard" element={<Dashboard/>} />
        </Routes>
    </BrowserRouter>
  );
}

export default App;
