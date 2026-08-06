import { useState, useEffect, type FormEvent } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { authApi } from '../../api';
import { showSuccess } from '../../utils/swal';

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
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passError, setPassError] = useState('');
  const [logoUploading, setLogoUploading] = useState(false);

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
    showSuccess('Perfil actualizado.');
  };

  const handleChangePassword = async (e: FormEvent) => {
    e.preventDefault();
    setPassError('');
    try {
      await authApi.changePassword(oldPassword, newPassword);
      showSuccess('Contrasena actualizada.');
      setOldPassword('');
      setNewPassword('');
    } catch (err: any) {
      setPassError(err?.response?.data?.message ?? 'Error al cambiar contrasena.');
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoUploading(true);
    try {
      await authApi.uploadLogo(file);
      showSuccess('Logo actualizado.');
      await refreshProveedor();
    } catch {
      showSuccess('Error al subir el logo.');
    } finally {
      setLogoUploading(false);
    }
  };

  if (!proveedor) return <p>Cargando perfil...</p>;

  return (
    <div>
      <h2 style={{ margin: '0 0 20px', color: '#1e293b' }}>Perfil de la Empresa</h2>
      <form onSubmit={handleSubmit} style={{ backgroundColor: '#fff', borderRadius: '8px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', maxWidth: '560px', marginBottom: '24px' }}>
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
        </div>
      </form>

      <div style={{ backgroundColor: '#fff', borderRadius: '8px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', maxWidth: '560px', marginBottom: '24px' }}>
        <h3 style={{ margin: '0 0 16px', fontSize: '16px', color: '#1e293b' }}>Logo de la Empresa</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          {proveedor?.logoUrl ? (
            <img src={`/api${proveedor.logoUrl}`} alt="Logo" style={{ width: '80px', height: '80px', objectFit: 'contain', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
          ) : (
            <div style={{ width: '80px', height: '80px', borderRadius: '8px', border: '2px dashed #d1d5db', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: '12px' }}>
              Sin logo
            </div>
          )}
          <div>
            <label style={{ padding: '8px 16px', backgroundColor: '#3B82F6', color: '#fff', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: 600, display: 'inline-block' }}>
              {logoUploading ? 'Subiendo...' : 'Subir logo'}
              <input type="file" accept="image/*" onChange={handleLogoUpload} style={{ display: 'none' }} />
            </label>
            <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '6px' }}>JPG, PNG. Max 2MB</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleChangePassword} style={{ backgroundColor: '#fff', borderRadius: '8px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', maxWidth: '560px' }}>
        <h3 style={{ margin: '0 0 16px', fontSize: '16px', color: '#1e293b' }}>Cambiar Contrasena</h3>
        {passError && <div style={{ backgroundColor: '#fef2f2', color: '#dc2626', padding: '10px 14px', borderRadius: '6px', fontSize: '13px', marginBottom: '12px' }}>{passError}</div>}
        <div style={{ marginBottom: '14px' }}>
          <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '4px', color: '#374151' }}>Contrasena actual</label>
          <input type="password" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} required style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px', boxSizing: 'border-box' }} />
        </div>
        <div style={{ marginBottom: '14px' }}>
          <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '4px', color: '#374151' }}>Nueva contrasena</label>
          <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px', boxSizing: 'border-box' }} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button type="submit" style={{ padding: '10px 24px', backgroundColor: '#3B82F6', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: 600 }}>
            Cambiar Contrasena
          </button>
        </div>
      </form>
    </div>
  );
}
