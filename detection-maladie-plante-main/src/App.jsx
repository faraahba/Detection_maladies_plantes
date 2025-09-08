import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './Pages/Home';
import PredictManual from './Pages/PredictManual'
import MainLayout from './MainLayout';
import Historique from './Pages/Historique'

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainLayout><Home /></MainLayout>} />
        <Route path="/PredictManual" element={<MainLayout><PredictManual /></MainLayout>} />
        <Route path="/Historique" element={<MainLayout><Historique /></MainLayout>} />
      </Routes>
    </Router>
  );
};

export default App;
