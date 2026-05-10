
import React, { useState } from 'react';

function App() {
  const [file, setFile] = useState(null);
  const [channel, setChannel] = useState('PORTAL');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Usar la variable de entorno correcta y construir la URL del endpoint
  const backendUrl = `${import.meta.env.VITE_API_URL}/api/payment-batch/upload-csv`;

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setResult(null);
    setError(null);
  };

  const handleChannelChange = (e) => {
    setChannel(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return;
    setLoading(true);
    setResult(null);
    setError(null);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('channel', channel);
    try {
      const response = await fetch(backendUrl, {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) throw new Error('Error en la validación');
      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 500, margin: '2rem auto', padding: 20, border: '1px solid #ccc', borderRadius: 8 }}>
      <h2>Validador de Archivo de Pagos</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 10 }}>
          <label htmlFor="channel" style={{ marginRight: 10 }}>Canal:</label>
          <select 
            id="channel" 
            value={channel} 
            onChange={handleChannelChange}
            style={{ marginRight: 20, padding: '5px' }}
          >
            <option value="PORTAL">Portal Web</option>
            <option value="SFTP">SFTP Seguro</option>
          </select>
        </div>
        <div style={{ marginBottom: 10 }}>
          <input type="file" accept=".txt,.csv" onChange={handleFileChange} />
        </div>
        <button type="submit" disabled={loading || !file} style={{ marginLeft: 10 }}>
          {loading ? 'Validando...' : 'Validar Archivo'}
        </button>
      </form>
      {error && <div style={{ color: 'red', marginTop: 20 }}>{error}</div>}
      {result && (
        <div style={{ marginTop: 20 }}>
          <h4>Resultado:</h4>
          <pre style={{ background: '#f6f6f6', padding: 10, borderRadius: 4 }}>{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}

export default App;
