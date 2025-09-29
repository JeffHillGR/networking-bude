export const SimpleTest = () => {
  return (
    <div style={{ padding: '20px' }}>
      <h1 style={{ color: 'red' }}>Simple Test</h1>
      <input 
        type="text" 
        style={{ 
          border: '2px solid red', 
          padding: '10px', 
          fontSize: '16px',
          display: 'block',
          width: '300px'
        }} 
      />
      <button style={{ marginTop: '10px', padding: '10px' }}>Click Me</button>
    </div>
  );
};