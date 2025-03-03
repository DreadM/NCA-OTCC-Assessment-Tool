// src/components/DocumentUpload.js
import React, { useContext, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { CompanyContext } from '../contexts/CompanyContext';

const DocumentUpload = () => {
  const { documents, setDocuments } = useContext(CompanyContext);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();
  
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    
    // Create document objects with additional metadata
    const newDocuments = files.map(file => ({
      id: Date.now() + Math.random().toString(36).substr(2, 9),
      file, // Store the actual file object for upload
      name: file.name,
      size: file.size,
      type: file.type,
      uploadDate: new Date(),
      category: guessDocumentCategory(file.name)
    }));
    
    setDocuments([...documents, ...newDocuments]);
  };
  
  const guessDocumentCategory = (filename) => {
    const lowerFilename = filename.toLowerCase();
    
    if (lowerFilename.includes('policy')) return 'Policy';
    if (lowerFilename.includes('procedure') || lowerFilename.includes('process')) return 'Procedure';
    if (lowerFilename.includes('diagram') || lowerFilename.includes('arch')) return 'Architecture';
    if (lowerFilename.includes('invent') || lowerFilename.includes('asset')) return 'Inventory';
    if (lowerFilename.includes('log') || lowerFilename.includes('monitor')) return 'Logs';
    
    return 'Other';
  };
  
  const removeDocument = (id) => {
    setDocuments(documents.filter(doc => doc.id !== id));
  };
  
  const handleCategoryChange = (id, category) => {
    setDocuments(documents.map(doc => 
      doc.id === id ? { ...doc, category } : doc
    ));
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    navigate('/review');
  };
  
  return (
    <div className="card">
      <h2>Upload Documentation</h2>
      <p className="help-text">
        Please upload relevant documentation for assessment. This can include policies, 
        procedures, network diagrams, asset inventories, and other evidence of controls.
      </p>
      
      <div className="upload-area">
        <div className="upload-box">
          <div className="upload-icon">
            <i className="fas fa-cloud-upload-alt"></i>
          </div>
          <p>Drag files here or click to browse</p>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />
          <button 
            className="btn btn-outline"
            onClick={() => fileInputRef.current.click()}
          >
            Select Files
          </button>
          <p className="file-types">
            Supported: PDF, DOCX, XLSX, PNG, JPG, TXT
          </p>
        </div>
      </div>
      
      {documents.length > 0 && (
        <div className="documents-list">
          <h3>Uploaded Documents ({documents.length})</h3>
          
          <div className="documents-table">
            <div className="table-header">
              <div className="col-filename">Filename</div>
              <div className="col-category">Category</div>
              <div className="col-size">Size</div>
              <div className="col-actions">Actions</div>
            </div>
            
            {documents.map(doc => (
              <div className="table-row" key={doc.id}>
                <div className="col-filename">
                  <i className={`file-icon ${doc.type.includes('pdf') ? 'pdf' : 
                                              doc.type.includes('word') ? 'doc' : 
                                              doc.type.includes('image') ? 'img' : 'doc'}`}>
                  </i>
                  {doc.name}
                </div>
                <div className="col-category">
                  <select 
                    value={doc.category}
                    onChange={(e) => handleCategoryChange(doc.id, e.target.value)}
                  >
                    <option value="Policy">Policy</option>
                    <option value="Procedure">Procedure</option>
                    <option value="Architecture">Architecture/Diagram</option>
                    <option value="Inventory">Asset Inventory</option>
                    <option value="Logs">Logs/Reports</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="col-size">
                  {formatFileSize(doc.size)}
                </div>
                <div className="col-actions">
                  <button 
                    className="btn-icon btn-remove"
                    onClick={() => removeDocument(doc.id)}
                  >
                    <i className="fas fa-trash"></i>
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          <div className="form-actions">
            <button 
              className="btn btn-secondary"
              onClick={() => navigate('/facilities')}
            >
              Back
            </button>
            <button 
              className="btn btn-primary"
              onClick={handleSubmit}
              disabled={documents.length === 0}
            >
              Continue
            </button>
          </div>
        </div>
      )}
      
      {documents.length === 0 && (
        <div className="form-actions">
          <button 
            className="btn btn-secondary"
            onClick={() => navigate('/facilities')}
          >
            Back
          </button>
          <button 
            className="btn btn-primary"
            onClick={handleSubmit}
            disabled
          >
            Continue
          </button>
        </div>
      )}
    </div>
  );
};

// Helper function to format file size
const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export default DocumentUpload;
