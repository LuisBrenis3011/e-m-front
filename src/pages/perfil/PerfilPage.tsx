import { useState, useEffect, type FormEvent } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { authApi } from '../../api';

export function PerfilPage() {
  const { proveedor, refreshProveedor } = useAuth();
  const [form, setForm] = useState({
    nombreEmpresa: '',
    ruc: '',
    nombreGerente: '',
    direccion: '',
    telefono: '',
    email: '',
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (proveedor) {
      setForm({
        nombreEmpresa: proveedor.nombreEmpresa ?? '',
        ruc: proveedor.ruc ?? '',
        nombreGerente: proveedor.nombreGerente ?? '',
        direccion: proveedor.direccion ?? '',
        telefono: proveedor.telefono ?? '',
        email: proveedor.email ?? '',
      });
    }
  }, [proveedor]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    await authApi.updateProveedor(form);
    await refreshProveedor();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  if (!proveedor) return <p>Cargando perfil...</p>;

  return (
    <div>
      <h2 style={{ margin: '0 0 20px', color: '#1e293b' }}>Perfil de la Empresa</h2>
      <form onSubmit={handleSubmit} style={{ backgroundColor: '#fff', borderRadius: '8px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', maxWidth: '560px' }}>
        {(['nombreEmpresa', 'ruc', 'nombreGerente', 'direccion', 'telefono', 'email'] as const).map((field) => (
          <div key={field} style={{ marginBottom: '14px' }}>
            <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '4px', color: '#374151' }}>
              {field.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase())}
            </label>
            <input
              value={form[field]}
              onChange={(e) => setForm((p) => ({ ...p, [field]: e.target.value }))}
              style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px', boxSizing: 'border-box' }}
            />
          </div>
        ))}

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button type="submit" style={{ padding: '10px 24px', backgroundColor: '#3B82F6', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: 600 }}>
            Guardar Cambios
          </button>
          {saved && <span style={{ color: '#10B981', fontSize: '14px' }}>Guardado!</span>}
        </div>
      </form>
    </div>
  );
}
