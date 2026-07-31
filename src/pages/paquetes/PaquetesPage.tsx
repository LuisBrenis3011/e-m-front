import { useEffect, useState, useCallback } from 'react';
import { paquetesApi, categoriasApi } from '../../api';
import { DataTable } from '../../components/ui/DataTable';
import { InventoryPickerModal, type PickedItem } from '../../components/ui/InventoryPickerModal';
import type { Paquete, PaqueteRequest, Categoria } from '../../types';

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
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerEsObsequio, setPickerEsObsequio] = useState(false);

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

  const handlePickerConfirm = (items: PickedItem[]) => {
    const existingIds = new Set(form.detalles.filter((d) => d.esObsequio === pickerEsObsequio).map((d) => d.inventarioId));
    const newItems = items
      .filter((it) => !existingIds.has(it.inventarioId))
      .map((it, i) => ({
        inventarioId: it.inventarioId,
        cantidadIncluida: it.cantidad,
        precioUnitario: it.precioUnitario,
        esObsequio: pickerEsObsequio,
        orden: form.detalles.length + i + 1,
      }));

    const updated = form.detalles.map((d) => {
      if (d.esObsequio !== pickerEsObsequio) return d;
      const match = items.find((it) => it.inventarioId === d.inventarioId);
      return match ? { ...d, cantidadIncluida: match.cantidad } : d;
    });

    const merged = [...updated];
    for (const ni of newItems) {
      if (!merged.some((d) => d.inventarioId === ni.inventarioId)) {
        merged.push(ni);
      }
    }

    const removedIds = new Set(items.map((i) => i.inventarioId));
    const filtered = merged.filter((d) => {
      if (d.esObsequio !== pickerEsObsequio) return true;
      return removedIds.has(d.inventarioId);
    });

    setForm((p) => ({ ...p, detalles: filtered }));
    setPickerOpen(false);
  };

  const incrementDetalle = (idx: number) => {
    setForm((p) => ({
      ...p,
      detalles: p.detalles.map((d, i) => i === idx ? { ...d, cantidadIncluida: d.cantidadIncluida + 1 } : d),
    }));
  };

  const decrementDetalle = (idx: number) => {
    setForm((p) => ({
      ...p,
      detalles: p.detalles
        .map((d, i) => i === idx ? { ...d, cantidadIncluida: d.cantidadIncluida - 1 } : d)
        .filter((d) => d.cantidadIncluida > 0),
    }));
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

  const recursosInit: PickedItem[] = recursos.map((d) => ({
    inventarioId: d.inventarioId, inventarioNombre: '', cantidad: d.cantidadIncluida, precioUnitario: d.precioUnitario,
  }));
  const obsequiosInit: PickedItem[] = obsequios.map((d) => ({
    inventarioId: d.inventarioId, inventarioNombre: '', cantidad: d.cantidadIncluida, precioUnitario: d.precioUnitario,
  }));

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

      <InventoryPickerModal
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onConfirm={handlePickerConfirm}
        initialItems={pickerEsObsequio ? obsequiosInit : recursosInit}
        title={pickerEsObsequio ? 'Seleccionar obsequios' : 'Seleccionar recursos basicos'}
      />

      {showForm && (
        <div style={styles.modal}>
          <div style={{ ...styles.modalCard, maxWidth: '600px' }}>
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
              <div style={{ flex: 1 }}>
                <div style={sectionHeaderStyle}>
                  <span style={{ fontWeight: 700, fontSize: '12px', color: '#3B82F6', textTransform: 'uppercase' }}>Recursos basicos</span>
                  <button onClick={() => { setPickerEsObsequio(false); setPickerOpen(true); }} style={addItemsBtnStyle}>+ Agregar</button>
                </div>
                {recursos.length === 0 && <p style={{ color: '#94a3b8', fontSize: '12px', padding: '8px 0' }}>Sin recursos</p>}
                {recursos.map((d, idx) => (
                  <div key={idx} style={itemRowStyle}>
                    <span style={{ flex: 1, fontSize: '13px', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {d.cantidadIncluida}x (ID: {d.inventarioId})
                    </span>
                    <button onClick={() => decrementDetalle(form.detalles.indexOf(d))} style={qtyBtnStyle}>-</button>
                    <span style={{ minWidth: '18px', textAlign: 'center', fontSize: '13px', fontWeight: 600 }}>{d.cantidadIncluida}</span>
                    <button onClick={() => incrementDetalle(form.detalles.indexOf(d))} style={qtyBtnStyle}>+</button>
                    <button onClick={() => removeDetalle(form.detalles.indexOf(d))} style={{ ...qtyBtnStyle, color: '#dc2626' }}>X</button>
                  </div>
                ))}
              </div>

              <div style={{ flex: 1 }}>
                <div style={sectionHeaderStyle}>
                  <span style={{ fontWeight: 700, fontSize: '12px', color: '#10B981', textTransform: 'uppercase' }}>Obsequios</span>
                  <button onClick={() => { setPickerEsObsequio(true); setPickerOpen(true); }} style={{ ...addItemsBtnStyle, backgroundColor: '#10B981' }}>+ Agregar</button>
                </div>
                {obsequios.length === 0 && <p style={{ color: '#94a3b8', fontSize: '12px', padding: '8px 0' }}>Sin obsequios</p>}
                {obsequios.map((d, idx) => (
                  <div key={idx} style={itemRowStyle}>
                    <span style={{ flex: 1, fontSize: '13px', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {d.cantidadIncluida}x (ID: {d.inventarioId})
                    </span>
                    <button onClick={() => decrementDetalle(form.detalles.indexOf(d))} style={qtyBtnStyle}>-</button>
                    <span style={{ minWidth: '18px', textAlign: 'center', fontSize: '13px', fontWeight: 600 }}>{d.cantidadIncluida}</span>
                    <button onClick={() => incrementDetalle(form.detalles.indexOf(d))} style={qtyBtnStyle}>+</button>
                    <button onClick={() => removeDetalle(form.detalles.indexOf(d))} style={{ ...qtyBtnStyle, color: '#dc2626' }}>X</button>
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
const sectionHeaderStyle: React.CSSProperties = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' };
const addItemsBtnStyle: React.CSSProperties = { padding: '4px 12px', backgroundColor: '#3B82F6', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '11px', fontWeight: 600 };
const itemRowStyle: React.CSSProperties = { display: 'flex', gap: '6px', alignItems: 'center', padding: '3px 0', borderBottom: '1px solid #f1f5f9' };
const qtyBtnStyle: React.CSSProperties = { width: '22px', height: '22px', borderRadius: '4px', border: '1px solid #d1d5db', backgroundColor: '#fff', cursor: 'pointer', fontSize: '13px', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#334155' };

const styles: Record<string, React.CSSProperties> = {
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' },
  addBtn: { padding: '10px 18px', backgroundColor: '#3B82F6', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: 600 },
  actionBtn: { padding: '4px 10px', border: '1px solid #d1d5db', borderRadius: '4px', backgroundColor: '#fff', cursor: 'pointer', fontSize: '12px' },
  modal: { position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100 },
  modalCard: { backgroundColor: '#fff', borderRadius: '12px', padding: '28px', width: '100%', maxHeight: '90vh', overflow: 'auto' },
};
