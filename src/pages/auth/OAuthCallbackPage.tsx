import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export function OAuthCallbackPage() {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const error = params.get('error');
    const email = params.get('email');
    const nombre = params.get('nombre');
    const apellido = params.get('apellido');
    const proveedorId = params.get('proveedorId');

    if (token) {
      localStorage.setItem('token', token);
      if (proveedorId) localStorage.setItem('proveedorId', proveedorId);
      localStorage.setItem('user', JSON.stringify({
        token,
        proveedorId: Number(proveedorId),
        email: email ?? '',
        nombre: nombre ?? '',
        apellido: apellido ?? '',
        rol: 'PROVEEDOR',
      }));
      window.location.href = '/dashboard';
    } else if (error === 'not_registered') {
      alert(`El email ${email} no esta registrado. Completa tu registro.`);
      navigate(`/oauth/complete-registration?email=${encodeURIComponent(email ?? '')}&nombre=${encodeURIComponent(nombre ?? '')}&apellido=${encodeURIComponent(apellido ?? '')}`, { replace: true });
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
