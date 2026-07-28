import { useEffect, useState, useCallback } from 'react';
import { categoriasApi } from '../../api';
import { DataTable } from '../../components/ui/DataTable';
import type { Categoria } from '../../types';

interface CategoriaForm {
  nombre: string;
  descripcion: string;
}

const emptyForm: CategoriaForm = { nombre: '', descripcion: '' };

export function CategoriasPage() {
  const [data, setData] = useState<Categoria[] | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Categoria | null>(null);
  const [form, setForm] = useState<CategoriaForm>(emptyForm);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await categoriasApi.getAll();
      setData(res);
    } catch {
      setData([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => { setEditing(null); setForm(emptyForm); setError(''); setShowForm(true); };
  const openEdit = (c: Categoria) => { setEditing(c); setForm({ nombre: c.nombre, descripcion: c.descripcion ?? '' }); setError(''); setShowForm(true); };

  const handleSubmit = async () => {
    setError('');
    if (!form.nombre.trim()) { setError('El nombre es obligatorio.'); return; }
    setSaving(true);
    try {
      if (editing) {
        await categoriasApi.update(editing.id, form);
      } else {
        await categoriasApi.create(form);
      }
      setShowForm(false);
      await load();
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Error al guardar.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Eliminar esta categoria? Tambien se eliminaran sus tematicas asociadas.')) return;
    try {
      await categoriasApi.delete(id);
      await load();
    } catch (err: any) {
      alert(err?.response?.data?.message ?? 'Error al eliminar.');
    }
  };

  return (
    <div>
      <div style={styles.header}>
        <h2 style={{ margin: 0, color: '#1e293b' }}>Categorias</h2>
        <button onClick={openCreate} style={styles.addBtn}>+ Nueva Categoria</button>
      </div>

      <DataTable
        data={data ? { content: data, totalElements: data.length, totalPages: 1, number: 0, size: data.length, first: true, last: true } : null}
        columns={[
          { key: 'nombre', header: 'Nombre' },
          { key: 'descripcion', header: 'Descripcion' },
          {
            key: 'acciones', header: 'Acciones',
            render: (c) => (
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={() => openEdit(c)} style={styles.actionBtn}>Editar</button>
                <button onClick={() => handleDelete(c.id)} style={{ ...styles.actionBtn, color: '#dc2626' }}>Eliminar</button>
              </div>
            ),
          },
        ]}
        onPageChange={() => {}}
        loading={loading}
      />

      {showForm && (
        <div style={styles.modal}>
          <div style={styles.modalCard}>
            <h3>{editing ? 'Editar Categoria' : 'Nueva Categoria'}</h3>
            {error && <div style={styles.errorBox}>{error}</div>}
            <div style={{ marginBottom: '12px' }}>
              <label style={labelStyle}>Nombre *</label>
              <input value={form.nombre} onChange={(e) => setForm((p) => ({ ...p, nombre: e.target.value }))} style={inputStyle} />
            </div>
            <div style={{ marginBottom: '12px' }}>
              <label style={labelStyle}>Descripcion</label>
              <input value={form.descripcion} onChange={(e) => setForm((p) => ({ ...p, descripcion: e.target.value }))} style={inputStyle} placeholder="Opcional" />
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={handleSubmit} disabled={saving} style={{ ...styles.addBtn, flex: 1 }}>
                {saving ? 'Guardando...' : 'Guardar'}
              </button>
              <button onClick={() => setShowForm(false)} style={cancelBtnStyle}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const labelStyle: React.CSSProperties = { fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '4px' };
const inputStyle: React.CSSProperties = { width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '14px', boxSizing: 'border-box' };
const cancelBtnStyle: React.CSSProperties = { padding: '10px', backgroundColor: '#e2e8f0', border: 'none', borderRadius: '6px', cursor: 'pointer' };

const styles: Record<string, React.CSSProperties> = {
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' },
  addBtn: { padding: '10px 18px', backgroundColor: '#3B82F6', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: 600 },
  actionBtn: { padding: '4px 10px', border: '1px solid #d1d5db', borderRadius: '4px', backgroundColor: '#fff', cursor: 'pointer', fontSize: '12px' },
  modal: { position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100 },
  modalCard: { backgroundColor: '#fff', borderRadius: '12px', padding: '28px', width: '100%', maxWidth: '440px', maxHeight: '90vh', overflow: 'auto' },
  errorBox: { backgroundColor: '#fef2f2', color: '#dc2626', padding: '10px 14px', borderRadius: '6px', fontSize: '13px', marginBottom: '12px' },
};
