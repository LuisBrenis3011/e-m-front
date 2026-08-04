import { useState, useEffect, type FormEvent } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

export function OAuthCompleteRegistrationPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email') ?? '';
  const nombre = searchParams.get('nombre') ?? '';
  const apellido = searchParams.get('apellido') ?? '';

  const [ruc, setRuc] = useState('');
  const [telefono, setTelefono] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!email) navigate('/register', { replace: true });
  }, [email, navigate]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/register-google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, nombre, apellido, ruc, telefono }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => null);
        setError(err?.message ?? 'Error al registrar.');
        return;
      }
      const data = await res.json();
      localStorage.setItem('token', data.token);
      if (data.proveedorId) localStorage.setItem('proveedorId', String(data.proveedorId));
      localStorage.setItem('user', JSON.stringify(data));
      window.location.href = '/dashboard';
    } catch {
      setError('Error de conexion.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.wrapper}>
      <form onSubmit={handleSubmit} style={styles.card}>
        <h1 style={styles.title}>Completar Registro</h1>
        <p style={styles.subtitle}>Vincula tu cuenta de Google con una empresa existente</p>

        {error && <div style={styles.error}>{error}</div>}

        <div style={styles.field}>
          <label style={styles.label}>Email</label>
          <input value={email} readOnly style={{ ...styles.input, backgroundColor: '#f1f5f9' }} />
        </div>

        <div style={styles.row}>
          <div style={styles.field}>
            <label style={styles.label}>Nombre</label>
            <input value={nombre} readOnly style={{ ...styles.input, backgroundColor: '#f1f5f9' }} />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Apellido</label>
            <input value={apellido} readOnly style={{ ...styles.input, backgroundColor: '#f1f5f9' }} />
          </div>
        </div>

        <div style={styles.field}>
          <label style={styles.label}>RUC de la empresa *</label>
          <input value={ruc} onChange={(e) => setRuc(e.target.value)} style={styles.input} required placeholder="RUC de la empresa registrada" />
        </div>

        <div style={styles.field}>
          <label style={styles.label}>Telefono</label>
          <input value={telefono} onChange={(e) => setTelefono(e.target.value)} style={styles.input} required />
        </div>

        <button type="submit" disabled={loading} style={styles.btn}>
          {loading ? 'Registrando...' : 'Completar Registro'}
        </button>
      </form>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  wrapper: { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#f1f5f9', padding: '20px' },
  card: { backgroundColor: '#fff', padding: '40px', borderRadius: '12px', boxShadow: '0 4px 24px rgba(0,0,0,0.08)', width: '100%', maxWidth: '460px', display: 'flex', flexDirection: 'column', gap: '12px' },
  title: { margin: '0 0 4px', fontSize: '24px', color: '#1e293b', textAlign: 'center' },
  subtitle: { margin: '0 0 8px', color: '#64748b', fontSize: '14px', textAlign: 'center' },
  error: { backgroundColor: '#fef2f2', color: '#dc2626', padding: '10px 14px', borderRadius: '6px', fontSize: '13px' },
  row: { display: 'flex', gap: '12px' },
  field: { flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' },
  label: { fontSize: '13px', fontWeight: 600, color: '#374151' },
  input: { padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px', outline: 'none' },
  btn: { padding: '12px', backgroundColor: '#3B82F6', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '15px', fontWeight: 600, cursor: 'pointer', marginTop: '4px' },
};
