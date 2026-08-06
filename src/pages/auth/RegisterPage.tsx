import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export function RegisterPage() {
  const { registerEmpresa } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    nombreEmpresa: '',
    ruc: '',
    nombreGerente: '',
    direccion: '',
    telefono: '',
    adminNombre: '',
    adminApellido: '',
    adminEmail: '',
    adminPassword: '',
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
      await registerEmpresa(form);
      navigate('/dashboard');
    } catch (err: any) {
      const msg =
        err?.response?.data?.errors
          ? Object.entries(err.response.data.errors)
              .map(([k, v]) => `${k}: ${v}`)
              .join(', ')
          : err?.response?.data?.message ?? 'Error al registrar la empresa.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.wrapper}>
      <form onSubmit={handleSubmit} style={styles.card} autoComplete="off">
        <h1 style={styles.title}>Registrar Empresa</h1>
        <p style={styles.subtitle}>Primero registra tu empresa y la cuenta del administrador</p>

        {error && <div style={styles.error}>{error}</div>}

        <div style={styles.row}>
          <div style={styles.field}>
            <label style={styles.label}>Nombre Empresa</label>
            <input value={form.nombreEmpresa} onChange={handleChange('nombreEmpresa')} style={styles.input} required />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>RUC</label>
            <input value={form.ruc} onChange={handleChange('ruc')} style={styles.input} required />
          </div>
        </div>

        <div style={styles.row}>
          <div style={styles.field}>
            <label style={styles.label}>Nombre Gerente</label>
            <input value={form.nombreGerente} onChange={handleChange('nombreGerente')} style={styles.input} required />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Telefono</label>
            <input value={form.telefono} onChange={handleChange('telefono')} style={styles.input} required />
          </div>
        </div>

        <div style={styles.field}>
          <label style={styles.label}>Direccion</label>
          <input value={form.direccion} onChange={handleChange('direccion')} style={styles.input} required />
        </div>

        <div style={styles.separator}>
          <span>Datos del Administrador</span>
        </div>

        <div style={styles.row}>
          <div style={styles.field}>
            <label style={styles.label}>Nombre</label>
            <input value={form.adminNombre} onChange={handleChange('adminNombre')} style={styles.input} required />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Apellido</label>
            <input value={form.adminApellido} onChange={handleChange('adminApellido')} style={styles.input} required />
          </div>
        </div>

        <div style={styles.row}>
          <div style={styles.field}>
            <label style={styles.label}>Email</label>
            <input type="email" value={form.adminEmail} onChange={handleChange('adminEmail')} style={styles.input} required />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Contrasena</label>
            <input type="password" value={form.adminPassword} onChange={handleChange('adminPassword')} style={styles.input} required />
          </div>
        </div>

        <button type="submit" disabled={loading} style={styles.btn}>
          {loading ? 'Registrando...' : 'Registrar Empresa'}
        </button>

        <p style={styles.link}>
          Ya tienes empresa? <Link to="/register-account">Crear cuenta de empleado</Link>
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
    maxWidth: '560px', display: 'flex', flexDirection: 'column', gap: '12px',
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
  separator: { borderTop: '1px solid #e2e8f0', paddingTop: '12px', textAlign: 'center', fontSize: '13px', fontWeight: 600, color: '#94a3b8' },
};
