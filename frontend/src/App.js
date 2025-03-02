import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import CompanyForm from './components/CompanyForm';
import FacilitiesForm from './components/FacilitiesForm'; // Add this import
import DocumentUpload from './components/DocumentUpload';
import ReviewSubmit from './components/ReviewSubmit';
import ProcessingScreen from './components/ProcessingScreen';
import ResultsDashboard from './components/ResultsDashboard';
import Navigation from './components/Navigation';
import { CompanyProvider } from './contexts/CompanyContext';
import './App.css';

function App() {
  return (
    <Router>
      <CompanyProvider>
        <div className="app-container">
          <Navigation />
          <div className="content-wrapper">
            <Routes>
              <Route path="/" element={<CompanyForm />} />
              <Route path="/facilities" element={<FacilitiesForm />} /> {/* Add this route */}
              <Route path="/documents" element={<DocumentUpload />} />
              <Route path="/review" element={<ReviewSubmit />} />
              <Route path="/processing" element={<ProcessingScreen />} />
              <Route path="/results" element={<ResultsDashboard />} />
            </Routes>
          </div>
        </div>
      </CompanyProvider>
    </Router>
  );
}

export default App;
