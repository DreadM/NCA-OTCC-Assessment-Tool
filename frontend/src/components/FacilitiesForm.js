import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { CompanyContext } from '../contexts/CompanyContext';

const FacilitiesForm = () => {
  const { facilities, setFacilities } = useContext(CompanyContext);
  const navigate = useNavigate();
  
  const handleFacilityChange = (id, field, value) => {
    const updatedFacilities = facilities.map(facility => 
      facility.id === id ? { ...facility, [field]: value } : facility
    );
    setFacilities(updatedFacilities);
  };
  
  const addFacility = () => {
    const newId = Math.max(...facilities.map(f => f.id), 0) + 1;
    setFacilities([
      ...facilities,
      { id: newId, name: '', criticalityLevel: '', systems: '' }
    ]);
  };
  
  const removeFacility = (id) => {
    if (facilities.length > 1) {
      setFacilities(facilities.filter(facility => facility.id !== id));
    }
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    navigate('/documents');
  };
  
  return (
    <div className="card">
      <h2>Facility Information</h2>
      <p className="help-text">
        Please provide information about your operational technology facilities.
      </p>
      
      <form onSubmit={handleSubmit}>
        {facilities.map((facility, index) => (
          <div key={facility.id} className="facility-card">
            <div className="facility-header">
              <h3>Facility {index + 1}</h3>
              <button
                type="button"
                onClick={() => removeFacility(facility.id)}
                disabled={facilities.length === 1}
                className={`btn-icon ${facilities.length === 1 ? 'disabled' : ''}`}
              >
                <i className="fas fa-trash"></i>
              </button>
            </div>
            
            <div className="form-group">
              <label htmlFor={`facility-name-${facility.id}`}>Facility Name</label>
              <input
                type="text"
                id={`facility-name-${facility.id}`}
                value={facility.name}
                onChange={(e) => handleFacilityChange(facility.id, 'name', e.target.value)}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor={`criticality-${facility.id}`}>Criticality Level</label>
              <select
                id={`criticality-${facility.id}`}
                value={facility.criticalityLevel}
                onChange={(e) => handleFacilityChange(facility.id, 'criticalityLevel', e.target.value)}
                required
              >
                <option value="">Select Criticality</option>
                <option value="L1 (High)">L1 (High)</option>
                <option value="L2 (Medium)">L2 (Medium)</option>
                <option value="L3 (Low)">L3 (Low)</option>
              </select>
            </div>
            
            <div className="form-group">
              <label htmlFor={`systems-${facility.id}`}>OT/ICS Systems</label>
              <textarea
                id={`systems-${facility.id}`}
                value={facility.systems}
                onChange={(e) => handleFacilityChange(facility.id, 'systems', e.target.value)}
                placeholder="e.g., SCADA, PLC networks, Safety Instrumented Systems"
                rows="3"
                required
              ></textarea>
            </div>
          </div>
        ))}
        
        <button
          type="button"
          onClick={addFacility}
          className="btn btn-outline add-facility-btn"
        >
          <i className="fas fa-plus"></i> Add Another Facility
        </button>
        
        <div className="form-actions">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="btn btn-secondary"
          >
            Back
          </button>
          <button type="submit" className="btn btn-primary">Continue</button>
        </div>
      </form>
    </div>
  );
};

export default FacilitiesForm;
