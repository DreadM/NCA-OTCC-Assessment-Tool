// src/components/CompanyForm.js
import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { CompanyContext } from '../contexts/CompanyContext';

const CompanyForm = () => {
  const { companyInfo, setCompanyInfo } = useContext(CompanyContext);
  const navigate = useNavigate();
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setCompanyInfo({
      ...companyInfo,
      [name]: value
    });
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    navigate('/documents');
  };
  
  return (
    <div className="card">
      <h2>Company Information</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">Company Name</label>
          <input
            type="text"
            id="name"
            name="name"
            value={companyInfo.name}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="industry">Industry Sector</label>
          <select
            id="industry"
            name="industry"
            value={companyInfo.industry}
            onChange={handleChange}
            required
          >
            <option value="">Select Industry</option>
            <option value="Manufacturing">Manufacturing</option>
            <option value="Energy">Energy</option>
            <option value="Oil & Gas">Oil & Gas</option>
            <option value="Healthcare">Healthcare</option>
            <option value="Transportation">Transportation</option>
            <option value="Utilities">Utilities</option>
            <option value="Water Treatment">Water Treatment</option>
            <option value="Building Automation">Building Automation</option>
            <option value="Other">Other</option>
          </select>
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="contactName">Contact Person</label>
            <input
              type="text"
              id="contactName"
              name="contactName"
              value={companyInfo.contactName}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="contactEmail">Email Address</label>
            <input
              type="email"
              id="contactEmail"
              name="contactEmail"
              value={companyInfo.contactEmail}
              onChange={handleChange}
              required
            />
          </div>
        </div>
        
        <div className="form-group">
          <label htmlFor="contactPhone">Phone Number</label>
          <input
            type="text"
            id="contactPhone"
            name="contactPhone"
            value={companyInfo.contactPhone}
            onChange={handleChange}
          />
        </div>
        
        <div className="form-actions">
          <button type="submit" className="btn btn-primary">Continue</button>
        </div>
      </form>
    </div>
  );
};

export default CompanyForm;
