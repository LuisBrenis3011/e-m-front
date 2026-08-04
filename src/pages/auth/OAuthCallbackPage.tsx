import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export function OAuthCallbackPage() {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const error = params.get('error');
    const email = params.get('email');
    const proveedorId = params.get('proveedorId');

    if (token) {
      localStorage.setItem('token', token);
      if (proveedorId) localStorage.setItem('proveedorId', proveedorId);
      navigate('/dashboard', { replace: true });
    } else if (error === 'not_registered') {
      alert(`El email ${email} no esta registrado. Registra tu empresa primero.`);
      navigate('/register', { replace: true });
    } else {
      navigate('/login', { replace: true });
    }
  }, [navigate]);

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <p style={{ color: '#64748b', fontSize: '14px' }}>Procesando autenticacion...</p>
    </div>
  );
}
