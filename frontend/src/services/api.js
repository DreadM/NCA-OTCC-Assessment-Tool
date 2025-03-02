// src/services/api.js
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5001/api';

const api = axios.create({
  baseURL: API_BASE_URL
});

// Company endpoints
export const createCompany = (companyData) => {
  return api.post('/company', companyData);
};

export const getCompany = (companyId) => {
  return api.get(`/company/${companyId}`);
};

// Facility endpoints
export const createFacilities = (facilities, companyId) => {
  return Promise.all(
    facilities.map(facility => 
      api.post('/facility', { ...facility, companyId })
    )
  );
};

export const getFacilities = (companyId) => {
  return api.get(`/facility/company/${companyId}`);
};

// Document endpoints
export const uploadDocuments = (files, companyId, categories) => {
  const formData = new FormData();
  
  formData.append('companyId', companyId);
  
  files.forEach((file, index) => {
    formData.append('documents', file);
    if (categories && categories[index]) {
      formData.append(`categories[${index}]`, categories[index]);
    }
  });
  
  return api.post('/document/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
};

export const getDocuments = (companyId) => {
  return api.get(`/document/company/${companyId}`);
};

// Assessment endpoints
export const startAssessment = (companyId, documentIds) => {
  return api.post('/assessment/start', {
    companyId,
    documents: documentIds
  });
};

export const getAssessmentStatus = (assessmentId) => {
  return api.get(`/assessment/${assessmentId}/status`);
};

export const getAssessmentResults = (assessmentId) => {
  return api.get(`/assessment/${assessmentId}/results`);
};

export const getAssessmentReport = (assessmentId) => {
  return api.get(`/assessment/${assessmentId}/report`, {
    responseType: 'blob'
  });
};

export default api;
