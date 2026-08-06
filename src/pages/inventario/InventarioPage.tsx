import { useEffect, useState, useCallback } from 'react';
import { inventarioApi } from '../../api';
import { DataTable } from '../../components/ui/DataTable';
import { SearchBar } from '../../components/ui/SearchBar';
import { confirmDelete, showSuccess } from '../../utils/swal';
import type { Inventario, InventarioRequest } from '../../types';

const emptyForm: InventarioRequest = { nombre: '', descripcion: '', cantidadDisponible: 0, precioReferencial: 0 };

export function InventarioPage() {
  const [data, setData] = useState<Inventario[] | null>(null);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Inventario | null>(null);
  const [form, setForm] = useState<InventarioRequest>(emptyForm);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await inventarioApi.getAll();
      setData(res.content);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (!search) { load(); return; }
    inventarioApi.search(search).then(setData);
  }, [search, load]);

  const openCreate = () => { setEditing(null); setForm(emptyForm); setShowForm(true); };
  const openEdit = (i: Inventario) => { setEditing(i); setForm({ nombre: i.nombre, descripcion: i.descripcion, cantidadDisponible: i.cantidadDisponible, precioReferencial: i.precioReferencial }); setShowForm(true); };

  const handleSubmit = async () => {
    if (editing) {
      await inventarioApi.update(editing.id, form);
    } else {
      await inventarioApi.create(form);
    }
    setShowForm(false);
    showSuccess(editing ? 'Item actualizado.' : 'Item creado.');
    load();
  };

  const handleDelete = async (id: number) => {
    const ok = await confirmDelete('Eliminar item?');
    if (!ok) return;
    await inventarioApi.delete(id);
    showSuccess('Item eliminado.');
    load();
  };

  return (
    <div>
      <div style={styles.header}>
        <h2 style={{ margin: 0, color: '#1e293b' }}>Inventario</h2>
        <button onClick={openCreate} style={styles.addBtn}>+ Nuevo Item</button>
      </div>

      <div style={{ marginBottom: '16px' }}>
        <SearchBar value={search} onChange={setSearch} placeholder="Buscar items..." />
      </div>

      <DataTable
        data={data ? { content: data, totalElements: data.length, totalPages: 1, number: 0, size: data.length, first: true, last: true } : null}
        columns={[
          { key: 'nombre', header: 'Nombre' },
          { key: 'descripcion', header: 'Descripcion' },
          { key: 'cantidadDisponible', header: 'Cantidad' },
          { key: 'precioReferencial', header: 'Precio Ref.' },
          { key: 'estado', header: 'Estado' },
          {
            key: 'acciones', header: 'Acciones',
            render: (i) => (
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={() => openEdit(i)} style={styles.actionBtn}>Editar</button>
                <button onClick={() => handleDelete(i.id)} style={{ ...styles.actionBtn, color: '#dc2626' }}>Eliminar</button>
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
            <h3>{editing ? 'Editar Item' : 'Nuevo Item'}</h3>
            {(['nombre', 'descripcion'] as const).map((f) => (
              <div key={f} style={{ marginBottom: '10px' }}>
                <label style={labelStyle}>{f[0].toUpperCase() + f.slice(1)}</label>
                <input value={form[f]} onChange={(e) => setForm((p) => ({ ...p, [f]: e.target.value }))} style={inputStyle} />
              </div>
            ))}
            {(['cantidadDisponible', 'precioReferencial'] as const).map((f) => (
              <div key={f} style={{ marginBottom: '10px' }}>
                <label style={labelStyle}>{f.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase())}</label>
                <input type="number" value={form[f]} onChange={(e) => setForm((p) => ({ ...p, [f]: Number(e.target.value) }))} style={inputStyle} />
              </div>
            ))}
            <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
              <button onClick={handleSubmit} style={{ ...styles.addBtn, flex: 1 }}>Guardar</button>
              <button onClick={() => setShowForm(false)} style={cancelBtnStyle}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const labelStyle: React.CSSProperties = { fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '4px' };
const inputStyle: React.CSSProperties = { width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '14px' };
const cancelBtnStyle: React.CSSProperties = { flex: 1, padding: '10px', backgroundColor: '#e2e8f0', border: 'none', borderRadius: '6px', cursor: 'pointer' };

const styles: Record<string, React.CSSProperties> = {
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' },
  addBtn: { padding: '10px 18px', backgroundColor: '#3B82F6', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: 600 },
  actionBtn: { padding: '4px 10px', border: '1px solid #d1d5db', borderRadius: '4px', backgroundColor: '#fff', cursor: 'pointer', fontSize: '12px' },
  modal: { position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100 },
  modalCard: { backgroundColor: '#fff', borderRadius: '12px', padding: '28px', width: '100%', maxWidth: '480px', maxHeight: '90vh', overflow: 'auto' },
};
