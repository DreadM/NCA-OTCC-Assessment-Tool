// src/contexts/CompanyContext.js
import React, { createContext, useState } from 'react';

export const CompanyContext = createContext();

export const CompanyProvider = ({ children }) => {
  const [companyInfo, setCompanyInfo] = useState({
    name: '',
    industry: '',
    contactName: '',
    contactEmail: '',
    contactPhone: '',
  });
  
  const [facilities, setFacilities] = useState([
    { id: 1, name: '', criticalityLevel: '', systems: '' }
  ]);
  
  const [documents, setDocuments] = useState([]);
  const [assessmentResults, setAssessmentResults] = useState(null);
  const [processingStatus, setProcessingStatus] = useState({
    isProcessing: false,
    progress: 0,
    status: '',
    completedSteps: []
  });

  return (
    <CompanyContext.Provider value={{
      companyInfo,
      setCompanyInfo,
      facilities,
      setFacilities,
      documents,
      setDocuments,
      assessmentResults,
      setAssessmentResults,
      processingStatus,
      setProcessingStatus
    }}>
      {children}
    </CompanyContext.Provider>
  );
};
