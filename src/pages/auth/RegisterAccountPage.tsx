import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export function RegisterAccountPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    nombre: '',
    apellido: '',
    email: '',
    password: '',
    telefono: '',
    ruc: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (field: string) => (e: { target: { value: string } }) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(form);
      navigate('/dashboard');
    } catch (err: any) {
      const msg =
        err?.response?.data?.errors
          ? Object.entries(err.response.data.errors)
              .map(([k, v]) => `${k}: ${v}`)
              .join(', ')
          : err?.response?.data?.message ?? 'Error al crear la cuenta.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.wrapper}>
      <form onSubmit={handleSubmit} style={styles.card}>
        <h1 style={styles.title}>Crear Cuenta</h1>
        <p style={styles.subtitle}>Registrate como empleado de una empresa existente</p>

        {error && <div style={styles.error}>{error}</div>}

        <div style={styles.field}>
          <label style={styles.label}>RUC de la Empresa *</label>
          <input value={form.ruc} onChange={handleChange('ruc')} style={styles.input} required placeholder="RUC de la empresa ya registrada" />
        </div>

        <div style={styles.row}>
          <div style={styles.field}>
            <label style={styles.label}>Nombre</label>
            <input value={form.nombre} onChange={handleChange('nombre')} style={styles.input} required />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Apellido</label>
            <input value={form.apellido} onChange={handleChange('apellido')} style={styles.input} required />
          </div>
        </div>

        <div style={styles.row}>
          <div style={styles.field}>
            <label style={styles.label}>Email</label>
            <input type="email" value={form.email} onChange={handleChange('email')} style={styles.input} required />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Contrasena</label>
            <input type="password" value={form.password} onChange={handleChange('password')} style={styles.input} required />
          </div>
        </div>

        <div style={styles.field}>
          <label style={styles.label}>Telefono</label>
          <input value={form.telefono} onChange={handleChange('telefono')} style={styles.input} required />
        </div>

        <button type="submit" disabled={loading} style={styles.btn}>
          {loading ? 'Creando...' : 'Crear Cuenta'}
        </button>

        <p style={styles.link}>
          No tienes empresa aun? <Link to="/register">Registrar empresa</Link>
        </p>
        <p style={styles.link}>
          Ya tienes cuenta? <Link to="/login">Inicia sesion</Link>
        </p>
      </form>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  wrapper: {
    display: 'flex', justifyContent: 'center', alignItems: 'center',
    minHeight: '100vh', backgroundColor: '#f1f5f9', padding: '20px',
  },
  card: {
    backgroundColor: '#fff', padding: '40px', borderRadius: '12px',
    boxShadow: '0 4px 24px rgba(0,0,0,0.08)', width: '100%',
    maxWidth: '480px', display: 'flex', flexDirection: 'column', gap: '12px',
  },
  title: { margin: '0 0 4px', fontSize: '24px', color: '#1e293b', textAlign: 'center' },
  subtitle: { margin: '0 0 8px', color: '#64748b', fontSize: '14px', textAlign: 'center' },
  error: { backgroundColor: '#fef2f2', color: '#dc2626', padding: '10px 14px', borderRadius: '6px', fontSize: '13px' },
  row: { display: 'flex', gap: '12px' },
  field: { flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' },
  label: { fontSize: '13px', fontWeight: 600, color: '#374151' },
  input: { padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px', outline: 'none' },
  btn: { padding: '12px', backgroundColor: '#3B82F6', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '15px', fontWeight: 600, cursor: 'pointer', marginTop: '4px' },
  link: { fontSize: '13px', color: '#64748b', textAlign: 'center' },
};
