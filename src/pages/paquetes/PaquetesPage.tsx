import { useEffect, useState, useCallback } from 'react';
import { paquetesApi, categoriasApi, inventarioApi } from '../../api';
import { DataTable } from '../../components/ui/DataTable';
import type { Paquete, PaqueteRequest, Categoria, Inventario } from '../../types';

const emptyForm: PaqueteRequest = {
  nombre: '', descripcion: '', categoriaId: 0,
  precioBase: 0, duracionBaseHoras: 0, detalles: [],
};

export function PaquetesPage() {
  const [data, setData] = useState<Paquete[] | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Paquete | null>(null);
  const [form, setForm] = useState<PaqueteRequest>(emptyForm);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchRecurso, setSearchRecurso] = useState('');
  const [recursoResults, setRecursoResults] = useState<Inventario[]>([]);
  const [searchObsequio, setSearchObsequio] = useState('');
  const [obsequioResults, setObsequioResults] = useState<Inventario[]>([]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await paquetesApi.getAll();
      setData(res.content.filter((p) => p.estado === 'ACTIVO'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    categoriasApi.getAll().then(setCategorias);
  }, [load]);

  const openCreate = () => { setEditing(null); setForm(emptyForm); setShowForm(true); };
  const openEdit = (p: Paquete) => {
    setEditing(p);
    setForm({
      nombre: p.nombre, descripcion: p.descripcion, categoriaId: p.categoriaId,
      precioBase: p.precioBase, duracionBaseHoras: p.duracionBaseHoras,
      detalles: p.detalles.map((d) => ({
        inventarioId: d.inventarioId, cantidadIncluida: d.cantidadIncluida,
        precioUnitario: d.precioUnitario, esObsequio: d.esObsequio, orden: d.orden,
      })),
    });
    setShowForm(true);
  };

  const handleSearchRecurso = async (q: string) => {
    setSearchRecurso(q);
    if (q.length < 1) { setRecursoResults([]); return; }
    const res = await inventarioApi.search(q);
    setRecursoResults(res);
  };

  const handleSearchObsequio = async (q: string) => {
    setSearchObsequio(q);
    if (q.length < 1) { setObsequioResults([]); return; }
    const res = await inventarioApi.search(q);
    setObsequioResults(res);
  };

  const addItem = (item: Inventario, esObsequio: boolean) => {
    setForm((p) => ({
      ...p,
      detalles: [
        ...p.detalles,
        { inventarioId: item.id, cantidadIncluida: 1, precioUnitario: item.precioReferencial, esObsequio, orden: p.detalles.length + 1 },
      ],
    }));
    if (esObsequio) { setSearchObsequio(''); setObsequioResults([]); }
    else { setSearchRecurso(''); setRecursoResults([]); }
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

  const recursos = form.detalles.filter((d) => !d.esObsequio);
  const obsequios = form.detalles.filter((d) => d.esObsequio);

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
          <div style={{ ...styles.modalCard, maxWidth: '700px' }}>
            <h3 style={{ margin: '0 0 16px' }}>{editing ? 'Editar Paquete' : 'Crear Paquete'}</h3>

            <div style={{ display: 'flex', gap: '12px' }}>
              <div style={{ flex: 2, marginBottom: '10px' }}>
                <label style={labelStyle}>Nombre</label>
                <input value={form.nombre} onChange={(e) => setForm((p) => ({ ...p, nombre: e.target.value }))} style={inputStyle} />
              </div>
              <div style={{ flex: 1, marginBottom: '10px' }}>
                <label style={labelStyle}>Categoria</label>
                <select value={form.categoriaId} onChange={(e) => setForm((p) => ({ ...p, categoriaId: Number(e.target.value) }))} style={inputStyle}>
                  <option value={0}>Seleccionar...</option>
                  {categorias.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
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

            <div style={{ display: 'flex', gap: '16px', marginTop: '8px' }}>
              {/* RECURSOS BASICOS */}
              <div style={{ flex: 1, borderRight: '1px solid #e2e8f0', paddingRight: '16px' }}>
                <h4 style={{ fontSize: '13px', fontWeight: 700, color: '#3B82F6', margin: '0 0 8px', textTransform: 'uppercase' }}>
                  Recursos basicos
                </h4>
                <div style={{ position: 'relative', marginBottom: '8px' }}>
                  <input
                    value={searchRecurso}
                    onChange={(e) => handleSearchRecurso(e.target.value)}
                    placeholder="Buscar inventario..."
                    style={inputStyle}
                  />
                  {recursoResults.length > 0 && (
                    <div style={dropdownStyle}>
                      {recursoResults.map((item) => (
                        <div key={item.id} onMouseDown={() => addItem(item, false)} style={dropdownItemStyle}>
                          <span>{item.nombre}</span>
                          <span style={{ color: '#94a3b8', fontSize: '12px' }}>S/{item.precioReferencial}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {recursos.length === 0 && <p style={{ color: '#94a3b8', fontSize: '12px' }}>Sin recursos basicos</p>}
                {recursos.map((d, idx) => (
                  <div key={idx} style={itemRowStyle}>
                    <span style={{ flex: 1, fontSize: '13px', fontWeight: 500 }}>
                      {d.cantidadIncluida}x
                    </span>
                    <span style={{ flex: 3, fontSize: '13px' }}>
                      #{d.inventarioId}
                    </span>
                    <span style={{ flex: 1, fontSize: '13px', color: '#64748b' }}>
                      S/{d.precioUnitario}
                    </span>
                    <button onClick={() => removeDetalle(form.detalles.indexOf(d))} style={removeBtnStyle}>X</button>
                  </div>
                ))}
              </div>

              {/* OBSEQUIOS */}
              <div style={{ flex: 1 }}>
                <h4 style={{ fontSize: '13px', fontWeight: 700, color: '#10B981', margin: '0 0 8px', textTransform: 'uppercase' }}>
                  Obsequios
                </h4>
                <div style={{ position: 'relative', marginBottom: '8px' }}>
                  <input
                    value={searchObsequio}
                    onChange={(e) => handleSearchObsequio(e.target.value)}
                    placeholder="Buscar inventario..."
                    style={inputStyle}
                  />
                  {obsequioResults.length > 0 && (
                    <div style={dropdownStyle}>
                      {obsequioResults.map((item) => (
                        <div key={item.id} onMouseDown={() => addItem(item, true)} style={dropdownItemStyle}>
                          <span>{item.nombre}</span>
                          <span style={{ color: '#94a3b8', fontSize: '12px' }}>S/{item.precioReferencial}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {obsequios.length === 0 && <p style={{ color: '#94a3b8', fontSize: '12px' }}>Sin obsequios</p>}
                {obsequios.map((d, idx) => (
                  <div key={idx} style={itemRowStyle}>
                    <span style={{ flex: 1, fontSize: '13px', fontWeight: 500 }}>
                      {d.cantidadIncluida}x
                    </span>
                    <span style={{ flex: 3, fontSize: '13px' }}>
                      #{d.inventarioId}
                    </span>
                    <span style={{ flex: 1, fontSize: '13px', color: '#64748b' }}>
                      Gratis
                    </span>
                    <button onClick={() => removeDetalle(form.detalles.indexOf(d))} style={removeBtnStyle}>X</button>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px', marginTop: '20px' }}>
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
const dropdownStyle: React.CSSProperties = { position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 50, backgroundColor: '#fff', border: '1px solid #d1d5db', borderRadius: '6px', maxHeight: '150px', overflowY: 'auto', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' };
const dropdownItemStyle: React.CSSProperties = { padding: '8px 12px', cursor: 'pointer', fontSize: '13px', display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9' };
const itemRowStyle: React.CSSProperties = { display: 'flex', gap: '8px', alignItems: 'center', padding: '4px 0', borderBottom: '1px solid #f1f5f9' };
const removeBtnStyle: React.CSSProperties = { color: '#dc2626', border: 'none', background: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: 700 };

const styles: Record<string, React.CSSProperties> = {
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' },
  addBtn: { padding: '10px 18px', backgroundColor: '#3B82F6', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: 600 },
  actionBtn: { padding: '4px 10px', border: '1px solid #d1d5db', borderRadius: '4px', backgroundColor: '#fff', cursor: 'pointer', fontSize: '12px' },
  modal: { position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100 },
  modalCard: { backgroundColor: '#fff', borderRadius: '12px', padding: '28px', width: '100%', maxHeight: '90vh', overflow: 'auto' },
};
