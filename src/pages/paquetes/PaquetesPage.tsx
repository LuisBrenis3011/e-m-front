import { useEffect, useState, useCallback } from 'react';
import { paquetesApi, categoriasApi } from '../../api';
import { DataTable } from '../../components/ui/DataTable';
import type { Paquete, PaqueteRequest, Categoria, Tematica, Inventario } from '../../types';
import { inventarioApi } from '../../api';

const emptyForm: PaqueteRequest = {
  nombre: '', descripcion: '', categoriaId: 0, tematicaId: 0,
  precioBase: 0, duracionBaseHoras: 0, detalles: [],
};

export function PaquetesPage() {
  const [data, setData] = useState<Paquete[] | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Paquete | null>(null);
  const [form, setForm] = useState<PaqueteRequest>(emptyForm);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [tematicas, setTematicas] = useState<Tematica[]>([]);
  const [inventario, setInventario] = useState<Inventario[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInventarioId, setSelectedInventarioId] = useState(0);
  const [selectedCantidad, setSelectedCantidad] = useState(1);
  const [selectedPrecio, setSelectedPrecio] = useState(0);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await paquetesApi.getAll();
      setData(res.content);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    categoriasApi.getAll().then(setCategorias);
    inventarioApi.getAll().then((r) => setInventario(r.content));
  }, [load]);

  const loadTematicas = async (catId: number) => {
    if (!catId) { setTematicas([]); return; }
    const res = await categoriasApi.getTematicasByCategoria(catId);
    setTematicas(res);
  };

  const openCreate = () => { setEditing(null); setForm(emptyForm); setShowForm(true); };
  const openEdit = (p: Paquete) => {
    setEditing(p);
    setForm({
      nombre: p.nombre, descripcion: p.descripcion, categoriaId: p.categoriaId,
      tematicaId: p.tematicaId, precioBase: p.precioBase, duracionBaseHoras: p.duracionBaseHoras,
      detalles: p.detalles.map((d) => ({ inventarioId: d.inventarioId, cantidadIncluida: d.cantidadIncluida, precioUnitario: d.precioUnitario, esObsequio: d.esObsequio })),
    });
    if (p.categoriaId) loadTematicas(p.categoriaId);
    setShowForm(true);
  };

  const addDetalle = () => {
    if (!selectedInventarioId) return;
    setForm((p) => ({
      ...p,
      detalles: [
        ...p.detalles,
        { inventarioId: selectedInventarioId, cantidadIncluida: selectedCantidad, precioUnitario: selectedPrecio, esObsequio: false },
      ],
    }));
    setSelectedInventarioId(0);
    setSelectedCantidad(1);
    setSelectedPrecio(0);
  };

  const removeDetalle = (idx: number) => {
    setForm((p) => ({ ...p, detalles: p.detalles.filter((_, i) => i !== idx) }));
  };

  const handleSubmit = async () => {
    if (editing) {
      await paquetesApi.update(editing.id, form);
    } else {
      await paquetesApi.create(form);
    }
    setShowForm(false);
    load();
  };

  const handleDeactivate = async (id: number) => {
    if (!confirm('Desactivar paquete?')) return;
    await paquetesApi.deactivate(id);
    load();
  };

  return (
    <div>
      <div style={styles.header}>
        <h2 style={{ margin: 0, color: '#1e293b' }}>Paquetes</h2>
        <button onClick={openCreate} style={styles.addBtn}>+ Nuevo Paquete</button>
      </div>

      <DataTable
        data={data ? { content: data, totalElements: data.length, totalPages: 1, number: 0, size: data.length, first: true, last: true } : null}
        columns={[
          { key: 'nombre', header: 'Nombre' },
          { key: 'categoriaNombre', header: 'Categoria' },
          { key: 'tematicaNombre', header: 'Tematica' },
          { key: 'precioBase', header: 'Precio Base' },
          { key: 'estado', header: 'Estado' },
          {
            key: 'acciones', header: 'Acciones',
            render: (p) => (
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={() => openEdit(p)} style={styles.actionBtn}>Editar</button>
                <button onClick={() => handleDeactivate(p.id)} style={{ ...styles.actionBtn, color: '#dc2626' }}>Desactivar</button>
              </div>
            ),
          },
        ]}
        onPageChange={() => {}}
        loading={loading}
      />

      {showForm && (
        <div style={styles.modal}>
          <div style={{ ...styles.modalCard, maxWidth: '640px' }}>
            <h3>{editing ? 'Editar Paquete' : 'Nuevo Paquete'}</h3>

            <div style={{ marginBottom: '10px' }}>
              <label style={labelStyle}>Nombre</label>
              <input value={form.nombre} onChange={(e) => setForm((p) => ({ ...p, nombre: e.target.value }))} style={inputStyle} />
            </div>
            <div style={{ marginBottom: '10px' }}>
              <label style={labelStyle}>Descripcion</label>
              <input value={form.descripcion} onChange={(e) => setForm((p) => ({ ...p, descripcion: e.target.value }))} style={inputStyle} />
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <div style={{ flex: 1, marginBottom: '10px' }}>
                <label style={labelStyle}>Categoria</label>
                <select
                  value={form.categoriaId}
                  onChange={(e) => { const v = Number(e.target.value); setForm((p) => ({ ...p, categoriaId: v, tematicaId: 0 })); loadTematicas(v); }}
                  style={inputStyle}
                >
                  <option value={0}>Seleccionar...</option>
                  {categorias.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                </select>
              </div>
              <div style={{ flex: 1, marginBottom: '10px' }}>
                <label style={labelStyle}>Tematica</label>
                <select value={form.tematicaId} onChange={(e) => setForm((p) => ({ ...p, tematicaId: Number(e.target.value) }))} style={inputStyle}>
                  <option value={0}>Seleccionar...</option>
                  {tematicas.map((t) => <option key={t.id} value={t.id}>{t.nombre}</option>)}
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <div style={{ flex: 1, marginBottom: '10px' }}>
                <label style={labelStyle}>Precio Base</label>
                <input type="number" value={form.precioBase} onChange={(e) => setForm((p) => ({ ...p, precioBase: Number(e.target.value) }))} style={inputStyle} />
              </div>
              <div style={{ flex: 1, marginBottom: '10px' }}>
                <label style={labelStyle}>Duracion (horas)</label>
                <input type="number" value={form.duracionBaseHoras} onChange={(e) => setForm((p) => ({ ...p, duracionBaseHoras: Number(e.target.value) }))} style={inputStyle} />
              </div>
            </div>

            <h4 style={{ margin: '16px 0 8px', fontSize: '14px', color: '#475569' }}>Items del paquete</h4>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
              <select value={selectedInventarioId} onChange={(e) => setSelectedInventarioId(Number(e.target.value))} style={{ ...inputStyle, flex: 2 }}>
                <option value={0}>Seleccionar item...</option>
                {inventario.map((i) => <option key={i.id} value={i.id}>{i.nombre}</option>)}
              </select>
              <input type="number" value={selectedCantidad} onChange={(e) => setSelectedCantidad(Number(e.target.value))} placeholder="Cant" style={{ ...inputStyle, flex: 1 }} />
              <input type="number" value={selectedPrecio} onChange={(e) => setSelectedPrecio(Number(e.target.value))} placeholder="Precio" style={{ ...inputStyle, flex: 1 }} />
              <button onClick={addDetalle} style={styles.addBtn}>Agregar</button>
            </div>

            {form.detalles.map((d, idx) => {
              const item = inventario.find((i) => i.id === d.inventarioId);
              return (
                <div key={idx} style={{ display: 'flex', gap: '8px', alignItems: 'center', padding: '4px 0', fontSize: '13px' }}>
                  <span style={{ flex: 2 }}>{item?.nombre ?? `Item #${d.inventarioId}`}</span>
                  <span style={{ flex: 1 }}>x{d.cantidadIncluida}</span>
                  <span style={{ flex: 1 }}>S/{d.precioUnitario}</span>
                  <button onClick={() => removeDetalle(idx)} style={{ color: '#dc2626', border: 'none', background: 'none', cursor: 'pointer' }}>X</button>
                </div>
              );
            })}

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
const inputStyle: React.CSSProperties = { width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '14px', boxSizing: 'border-box' };
const cancelBtnStyle: React.CSSProperties = { flex: 1, padding: '10px', backgroundColor: '#e2e8f0', border: 'none', borderRadius: '6px', cursor: 'pointer' };

const styles: Record<string, React.CSSProperties> = {
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' },
  addBtn: { padding: '10px 18px', backgroundColor: '#3B82F6', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: 600 },
  actionBtn: { padding: '4px 10px', border: '1px solid #d1d5db', borderRadius: '4px', backgroundColor: '#fff', cursor: 'pointer', fontSize: '12px' },
  modal: { position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100 },
  modalCard: { backgroundColor: '#fff', borderRadius: '12px', padding: '28px', width: '100%', maxWidth: '480px', maxHeight: '90vh', overflow: 'auto' },
};
