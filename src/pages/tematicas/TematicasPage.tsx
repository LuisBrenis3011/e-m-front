import { useEffect, useState, useCallback } from 'react';
import { categoriasApi } from '../../api';
import { DataTable } from '../../components/ui/DataTable';
import type { Categoria, Tematica } from '../../types';

interface TematicaForm {
  nombre: string;
  imagenReferencial: string;
  categoriaId: number;
}

const emptyForm: TematicaForm = { nombre: '', imagenReferencial: '', categoriaId: 0 };

export function TematicasPage() {
  const [data, setData] = useState<Tematica[] | null>(null);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [filterCategoriaId, setFilterCategoriaId] = useState<number>(0);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Tematica | null>(null);
  const [form, setForm] = useState<TematicaForm>(emptyForm);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await categoriasApi.getTematicas(filterCategoriaId || undefined);
      setData(res);
    } catch {
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [filterCategoriaId]);

  useEffect(() => {
    load();
    categoriasApi.getAll().then(setCategorias);
  }, [load]);

  const openCreate = () => {
    setEditing(null);
    setForm({ ...emptyForm, categoriaId: filterCategoriaId || 0 });
    setError('');
    setShowForm(true);
  };

  const openEdit = (t: Tematica) => {
    setEditing(t);
    setForm({
      nombre: t.nombre,
      imagenReferencial: t.imagenReferencial ?? '',
      categoriaId: filterCategoriaId || 0,
    });
    setError('');
    setShowForm(true);
  };

  const handleSubmit = async () => {
    setError('');
    if (!form.nombre.trim()) { setError('El nombre es obligatorio.'); return; }
    if (!form.categoriaId) { setError('Seleccione una categoria.'); return; }
    setSaving(true);
    try {
      if (editing) {
        await categoriasApi.updateTematica(editing.id, form.categoriaId, {
          nombre: form.nombre,
          imagenReferencial: form.imagenReferencial || null,
        });
      } else {
        await categoriasApi.createTematica(form.categoriaId, {
          nombre: form.nombre,
          imagenReferencial: form.imagenReferencial || null,
        });
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
    if (!confirm('Eliminar esta tematica?')) return;
    try {
      await categoriasApi.deleteTematica(id);
      await load();
    } catch (err: any) {
      alert(err?.response?.data?.message ?? 'Error al eliminar.');
    }
  };

  return (
    <div>
      <div style={styles.header}>
        <h2 style={{ margin: 0, color: '#1e293b' }}>Tematicas</h2>
        <button onClick={openCreate} style={styles.addBtn}>+ Nueva Tematica</button>
      </div>

      <div style={{ marginBottom: '16px', display: 'flex', gap: '12px', alignItems: 'center' }}>
        <label style={{ fontSize: '13px', fontWeight: 600, color: '#374151' }}>Filtrar por categoria:</label>
        <select
          value={filterCategoriaId}
          onChange={(e) => setFilterCategoriaId(Number(e.target.value))}
          style={{ padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '14px' }}
        >
          <option value={0}>Todas las categorias</option>
          {categorias.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
        </select>
      </div>

      <DataTable
        data={data ? { content: data, totalElements: data.length, totalPages: 1, number: 0, size: data.length, first: true, last: true } : null}
        columns={[
          { key: 'nombre', header: 'Nombre' },
          {
            key: 'imagenReferencial', header: 'Imagen',
            render: (t) => t.imagenReferencial
              ? <a href={t.imagenReferencial} target="_blank" rel="noreferrer" style={{ color: '#3B82F6', fontSize: '12px' }}>Ver imagen</a>
              : <span style={{ color: '#94a3b8', fontSize: '12px' }}>Sin imagen</span>,
          },
          {
            key: 'acciones', header: 'Acciones',
            render: (t) => (
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={() => openEdit(t)} style={styles.actionBtn}>Editar</button>
                <button onClick={() => handleDelete(t.id)} style={{ ...styles.actionBtn, color: '#dc2626' }}>Eliminar</button>
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
            <h3>{editing ? 'Editar Tematica' : 'Nueva Tematica'}</h3>
            {error && <div style={styles.errorBox}>{error}</div>}
            <div style={{ marginBottom: '12px' }}>
              <label style={labelStyle}>Categoria *</label>
              <select
                value={form.categoriaId}
                onChange={(e) => setForm((p) => ({ ...p, categoriaId: Number(e.target.value) }))}
                style={inputStyle}
              >
                <option value={0}>Seleccionar categoria...</option>
                {categorias.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
              </select>
            </div>
            <div style={{ marginBottom: '12px' }}>
              <label style={labelStyle}>Nombre *</label>
              <input value={form.nombre} onChange={(e) => setForm((p) => ({ ...p, nombre: e.target.value }))} style={inputStyle} />
            </div>
            <div style={{ marginBottom: '12px' }}>
              <label style={labelStyle}>URL Imagen Referencial</label>
              <input value={form.imagenReferencial} onChange={(e) => setForm((p) => ({ ...p, imagenReferencial: e.target.value }))} style={inputStyle} placeholder="Opcional - URL de imagen" />
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
