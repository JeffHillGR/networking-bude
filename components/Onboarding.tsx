import { useState } from 'react';

export const Onboarding = () => {
  const [formData, setFormData] = useState({firstName: '',lastName: '', username: '', email: '' });  const handleChange = (e: any) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = () => {
    console.log('Form submitted:', formData);
  };

  const handleLinkedInImport = () => {
    console.log('LinkedIn import clicked');
  };

  const inputStyle = {
    display: 'block',
    width: '100%',
    padding: '12px 16px',
    backgroundColor: '#f3f4f6',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px'
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'row' }}>
      {/* Left side */}
      <div style={{ width: '50%', backgroundColor: '#f3f4f6', padding: '32px', display: 'flex', alignItems: 'flex-start', justifyContent: 'center' }}>
        <div style={{ position: 'relative', width: '100%', maxWidth: '28rem' }}>
          {/* Main phone image */}
          <img 
            src="/My phone.jpg" 
            alt="BudE App on Phone"
            style={{ width: '100%', height: 'auto', borderRadius: '24px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}
          />
          
          {/* Small image collage on the right */}
          <div style={{ position: 'absolute', right: '20px', top: '160px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <img 
              src="/People networking 1.png" 
              alt="Networking Event"
              style={{ width: '128px', height: '128px', borderRadius: '16px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', objectFit: 'cover' }}
            />
            <img 
              src="/People networking 2.png" 
              alt="Networking Event"
              style={{ width: '128px', height: '128px', borderRadius: '16px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', objectFit: 'cover' }}
            />
            <img 
              src="/People networking 3.png" 
              alt="Networking Event"
              style={{ width: '128px', height: '128px', borderRadius: '16px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', objectFit: 'cover' }}
            />
          </div>
        </div>
      </div>

      {/* Right side */}
      <div style={{ width: '50%', backgroundColor: 'white', padding: '48px', display: 'flex', flexDirection: 'column', justifyContent: 'center', overflowY: 'auto' }}>
        <div style={{ maxWidth: '28rem', margin: '0 auto', width: '100%' }}>
          {/* Logo */}
          <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'center' }}>
            <img 
              src="/BudE Logo Final.png" 
              alt="BudE Logo" 
              style={{ height: '125px', width: 'auto' }}
            />
          </div>

          <h1 style={{ fontSize: '30px', fontWeight: 'bold', color: '#111827', marginBottom: '16px', textAlign: 'center' }}>
            Welcome to Networking BudE
          </h1>

          <div style={{ marginBottom: '32px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#111827', marginBottom: '12px', textAlign: 'center' }}>
              What's this all about?
            </h2>
            <p style={{ color: '#4b5563', textAlign: 'center', marginBottom: '16px' }}>
              Networking BudE offers the ability to connect with others and attend events with people who share your networking goals:
            </p>
            
            <div style={{ borderLeft: '4px solid #d1d5db', paddingLeft: '16px', paddingTop: '8px', paddingBottom: '8px', marginBottom: '24px' }}>
              <p style={{ color: '#4b5563', fontStyle: 'italic', fontSize: '14px' }}>
                "I no longer feel awkward at events alone anymore. Thanks BudE!" - Meghan a Satisfied BudE User
              </p>
            </div>

            <p style={{ textAlign: 'center', fontWeight: '600', color: '#111827', marginBottom: '24px' }}>
              Ready to jump in? Let's go!
            </p>

            <div style={{ width: '100%', backgroundColor: '#e5e7eb', borderRadius: '9999px', height: '8px', marginBottom: '32px' }}>
              <div style={{ backgroundColor: 'black', height: '8px', borderRadius: '9999px', width: '33%' }}></div>
            </div>
          </div>

          {/* Quick Setup Box */}
<div style={{ backgroundColor: '#eff6ff', borderRadius: '12px', padding: '24px 40px', marginBottom: '24px' }}>            <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', marginBottom: '8px', textAlign: 'center' }}>
              Quick Setup
            </h3>
            <p style={{ fontSize: '14px', color: '#1e40af', textAlign: 'center', marginBottom: '16px' }}>
              Import your professional information from LinkedIn to get started faster
            </p>
            <button
              onClick={handleLinkedInImport}
              style={{ width: '100%', backgroundColor: '#2563eb', color: 'white', fontWeight: '600', padding: '12px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
            >
              Import From LinkedIn
            </button>
            <p style={{ textAlign: 'center', fontSize: '14px', color: '#2563eb', marginTop: '12px' }}>
              Or fill out the form manually below
            </p>
          </div>

          {/* Form fields */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '0 40px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '28px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#111827', marginBottom: '8px' }}>
                  First Name
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#111827', marginBottom: '8px' }}>
                  Last Name
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  style={inputStyle}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#111827', marginBottom: '8px' }}>
                Preferred Username
              </label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                style={inputStyle}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#111827', marginBottom: '8px' }}>
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                style={inputStyle}
              />
            </div>

            <button
              onClick={handleSubmit}
              style={{ width: '70%', background: 'linear-gradient(to right, #10b981, #059669)', color: 'white', fontWeight: '600', padding: '16px 24px', borderRadius: '8px', border: 'none', cursor: 'pointer', marginTop: '24px auto 0 auto', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
