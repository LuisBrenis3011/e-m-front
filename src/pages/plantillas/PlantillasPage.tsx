import { useEffect, useState, useCallback } from 'react';
import { plantillasApi } from '../../api';
import { DataTable } from '../../components/ui/DataTable';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { confirmAction, showSuccess } from '../../utils/swal';
import type { Plantilla, PlantillaRequest } from '../../types';
import { TIPOS_PLANTILLA } from '../../utils/constants';

const emptyForm: PlantillaRequest = {
  nombre: '', descripcion: '', tipo: 'CONTRATO',
  contenidoHtml: '', placeholders: [], esDefault: false,
};

export function PlantillasPage() {
  const [data, setData] = useState<Plantilla[] | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Plantilla | null>(null);
  const [form, setForm] = useState<PlantillaRequest>(emptyForm);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await plantillasApi.getAll();
      setData(res.content);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => { setEditing(null); setForm(emptyForm); setShowForm(true); };
  const openEdit = (p: Plantilla) => {
    setEditing(p);
    setForm({ nombre: p.nombre, descripcion: p.descripcion, tipo: p.tipo, contenidoHtml: p.contenidoHtml, placeholders: p.placeholders, esDefault: p.esDefault });
    setShowForm(true);
  };

  const handleSubmit = async () => {
    if (editing) {
      await plantillasApi.update(editing.id, form);
    } else {
      await plantillasApi.create(form);
    }
    setShowForm(false);
    showSuccess(editing ? 'Plantilla actualizada.' : 'Plantilla creada.');
    load();
  };

  const handleDeactivate = async (id: number) => {
    const ok = await confirmAction('Desactivar plantilla', 'La plantilla pasara a estado inactivo.', 'Desactivar', '#dc2626');
    if (!ok) return;
    await plantillasApi.deactivate(id);
    showSuccess('Plantilla desactivada.');
    load();
  };

  const handleDelete = async (id: number) => {
    const ok = await confirmAction('Eliminar plantilla', 'Esta accion no se puede deshacer.', 'Eliminar', '#dc2626');
    if (!ok) return;
    await plantillasApi.delete(id);
    showSuccess('Plantilla eliminada.');
    load();
  };

  return (
    <div>
      <div style={styles.header}>
        <h2 style={{ margin: 0, color: '#1e293b' }}>Plantillas</h2>
        <button onClick={openCreate} style={styles.addBtn}>+ Nueva Plantilla</button>
      </div>

      <DataTable
        data={data ? { content: data, totalElements: data.length, totalPages: 1, number: 0, size: data.length, first: true, last: true } : null}
        columns={[
          { key: 'nombre', header: 'Nombre' },
          { key: 'tipo', header: 'Tipo' },
          {
            key: 'esDefault', header: 'Default',
            render: (p) => p.esDefault ? <StatusBadge status="Default" color="#10B981" /> : null,
          },
          { key: 'estado', header: 'Estado' },
          {
            key: 'acciones', header: 'Acciones',
            render: (p) => (
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={() => openEdit(p)} style={styles.actionBtn}>Editar</button>
                <button onClick={() => handleDeactivate(p.id)} style={styles.actionBtn}>Desactivar</button>
                <button onClick={() => handleDelete(p.id)} style={{ ...styles.actionBtn, color: '#dc2626' }}>Eliminar</button>
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
            <h3>{editing ? 'Editar Plantilla' : 'Nueva Plantilla'}</h3>

            <div style={{ marginBottom: '10px' }}>
              <label style={labelStyle}>Nombre</label>
              <input value={form.nombre} onChange={(e) => setForm((p) => ({ ...p, nombre: e.target.value }))} style={inputStyle} />
            </div>
            <div style={{ marginBottom: '10px' }}>
              <label style={labelStyle}>Descripcion</label>
              <input value={form.descripcion} onChange={(e) => setForm((p) => ({ ...p, descripcion: e.target.value }))} style={inputStyle} />
            </div>
            <div style={{ marginBottom: '10px' }}>
              <label style={labelStyle}>Tipo</label>
              <select value={form.tipo} onChange={(e) => setForm((p) => ({ ...p, tipo: e.target.value as PlantillaRequest['tipo'] }))} style={inputStyle}>
                {TIPOS_PLANTILLA.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div style={{ marginBottom: '10px' }}>
              <label style={{ ...labelStyle, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input type="checkbox" checked={form.esDefault} onChange={(e) => setForm((p) => ({ ...p, esDefault: e.target.checked }))} />
                Es plantilla por defecto
              </label>
            </div>
            <div style={{ marginBottom: '10px' }}>
              <label style={labelStyle}>Contenido HTML</label>
              <textarea
                value={form.contenidoHtml}
                onChange={(e) => setForm((p) => ({ ...p, contenidoHtml: e.target.value }))}
                style={{ ...inputStyle, minHeight: '120px', fontFamily: 'monospace' }}
                rows={6}
              />
            </div>

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
const cancelBtnStyle: React.CSSProperties = { padding: '10px', backgroundColor: '#e2e8f0', border: 'none', borderRadius: '6px', cursor: 'pointer' };

const styles: Record<string, React.CSSProperties> = {
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' },
  addBtn: { padding: '10px 18px', backgroundColor: '#3B82F6', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: 600 },
  actionBtn: { padding: '4px 10px', border: '1px solid #d1d5db', borderRadius: '4px', backgroundColor: '#fff', cursor: 'pointer', fontSize: '12px' },
  modal: { position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100 },
  modalCard: { backgroundColor: '#fff', borderRadius: '12px', padding: '28px', width: '100%', maxHeight: '90vh', overflow: 'auto' },
};
