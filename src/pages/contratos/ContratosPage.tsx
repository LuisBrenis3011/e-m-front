import { useEffect, useState, useCallback } from 'react';
import { contratosApi, paquetesApi, eventosApi, documentosApi } from '../../api';
import { DataTable } from '../../components/ui/DataTable';
import { StatusBadge } from '../../components/ui/StatusBadge';
import type { Contrato, ContratoRequest, Paquete, Evento } from '../../types';
import { ESTADOS_CONTRATO } from '../../utils/constants';

const emptyForm: ContratoRequest = {
  eventoId: 0, paqueteId: 0, costoMovilidad: 0,
  montoAdelanto: 0, duracion: '', observaciones: '',
};

export function ContratosPage() {
  const [data, setData] = useState<Contrato[] | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [selectedContrato, setSelectedContrato] = useState<Contrato | null>(null);
  const [form, setForm] = useState<ContratoRequest>(emptyForm);
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [paquetes, setPaquetes] = useState<Paquete[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await contratosApi.getAll();
      setData(res.content);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    eventosApi.getCalendario({ inicio: '2020-01-01', fin: '2030-12-31', size: 100 }).then((r) => setEventos(r.content));
    paquetesApi.getAll(0, 100).then((r) => setPaquetes(r.content));
  }, [load]);

  const openCreate = () => { setForm(emptyForm); setShowForm(true); };

  const handleSubmit = async () => {
    await contratosApi.create(form);
    setShowForm(false);
    load();
  };

  const openDetail = async (c: Contrato) => {
    const detail = await contratosApi.getById(c.id);
    setSelectedContrato(detail);
    setShowDetail(true);
  };

  const changeEstado = async (id: number, estado: string) => {
    await contratosApi.changeEstado(id, estado);
    setShowDetail(false);
    load();
  };

  const generarPdf = async (contratoId: number) => {
    const doc = await documentosApi.generar(contratoId);
    window.open(doc.urlPdf, '_blank');
  };

  const getEstadoColor = (estado: string) => {
    const found = ESTADOS_CONTRATO.find((s) => s.value === estado);
    return found?.color ?? '#9CA3AF';
  };

  return (
    <div>
      <div style={styles.header}>
        <h2 style={{ margin: 0, color: '#1e293b' }}>Contratos</h2>
        <button onClick={openCreate} style={styles.addBtn}>+ Nuevo Contrato</button>
      </div>

      <DataTable
        data={data ? { content: data, totalElements: data.length, totalPages: 1, number: 0, size: data.length, first: true, last: true } : null}
        columns={[
          { key: 'id', header: '#' },
          { key: 'clienteNombre', header: 'Cliente' },
          { key: 'paqueteNombre', header: 'Paquete' },
          { key: 'fechaEvento', header: 'Fecha Evento' },
          { key: 'montoTotal', header: 'Monto Total' },
          {
            key: 'estado', header: 'Estado',
            render: (c) => <StatusBadge status={c.estado} color={getEstadoColor(c.estado)} />,
          },
          {
            key: 'acciones', header: 'Acciones',
            render: (c) => (
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={() => openDetail(c)} style={styles.actionBtn}>Ver</button>
                <button onClick={() => generarPdf(c.id)} style={styles.actionBtn}>PDF</button>
              </div>
            ),
          },
        ]}
        onPageChange={() => {}}
        loading={loading}
      />

      {showForm && (
        <div style={styles.modal}>
          <div style={{ ...styles.modalCard, maxWidth: '560px' }}>
            <h3>Nuevo Contrato</h3>
            <div style={{ marginBottom: '10px' }}>
              <label style={labelStyle}>Evento</label>
              <select value={form.eventoId} onChange={(e) => setForm((p) => ({ ...p, eventoId: Number(e.target.value) }))} style={inputStyle}>
                <option value={0}>Seleccionar...</option>
                {eventos.map((ev) => <option key={ev.id} value={ev.id}>{ev.clienteNombre} - {ev.fechaEvento}</option>)}
              </select>
            </div>
            <div style={{ marginBottom: '10px' }}>
              <label style={labelStyle}>Paquete</label>
              <select value={form.paqueteId} onChange={(e) => setForm((p) => ({ ...p, paqueteId: Number(e.target.value) }))} style={inputStyle}>
                <option value={0}>Seleccionar...</option>
                {paquetes.map((p) => <option key={p.id} value={p.id}>{p.nombre} - S/{p.precioBase}</option>)}
              </select>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <div style={{ flex: 1, marginBottom: '10px' }}>
                <label style={labelStyle}>Costo Movilidad</label>
                <input type="number" value={form.costoMovilidad} onChange={(e) => setForm((p) => ({ ...p, costoMovilidad: Number(e.target.value) }))} style={inputStyle} />
              </div>
              <div style={{ flex: 1, marginBottom: '10px' }}>
                <label style={labelStyle}>Adelanto</label>
                <input type="number" value={form.montoAdelanto} onChange={(e) => setForm((p) => ({ ...p, montoAdelanto: Number(e.target.value) }))} style={inputStyle} />
              </div>
            </div>
            <div style={{ marginBottom: '10px' }}>
              <label style={labelStyle}>Duracion</label>
              <input value={form.duracion} onChange={(e) => setForm((p) => ({ ...p, duracion: e.target.value }))} style={inputStyle} />
            </div>
            <div style={{ marginBottom: '10px' }}>
              <label style={labelStyle}>Observaciones</label>
              <input value={form.observaciones} onChange={(e) => setForm((p) => ({ ...p, observaciones: e.target.value }))} style={inputStyle} />
            </div>

            <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
              <button onClick={handleSubmit} style={{ ...styles.addBtn, flex: 1 }}>Guardar</button>
              <button onClick={() => setShowForm(false)} style={cancelBtnStyle}>Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {showDetail && selectedContrato && (
        <div style={styles.modal}>
          <div style={{ ...styles.modalCard, maxWidth: '560px' }}>
            <h3>Contrato #{selectedContrato.id}</h3>
            <p><strong>Cliente:</strong> {selectedContrato.clienteNombre}</p>
            <p><strong>Paquete:</strong> {selectedContrato.paqueteNombre}</p>
            <p><strong>Monto Total:</strong> S/{selectedContrato.montoTotal.toFixed(2)}</p>
            <p><strong>Adelanto:</strong> S/{selectedContrato.montoAdelanto.toFixed(2)}</p>
            <p><strong>Pendiente:</strong> S/{selectedContrato.montoPendiente.toFixed(2)}</p>
            <p><strong>Duracion:</strong> {selectedContrato.duracion}</p>
            <p><strong>Observaciones:</strong> {selectedContrato.observaciones}</p>

            {selectedContrato.detalles?.length > 0 && (
              <>
                <h4 style={{ margin: '16px 0 8px' }}>Items:</h4>
                {selectedContrato.detalles.map((d) => (
                  <div key={d.id} style={{ fontSize: '13px', padding: '4px 0' }}>
                    {d.inventarioNombre} x{d.cantidadIncluida} - S/{d.precioUnitario} {d.esObsequio ? '(Obsequio)' : ''}
                  </div>
                ))}
              </>
            )}

            <div style={{ marginTop: '12px' }}>
              <p style={{ fontWeight: 600, marginBottom: '8px' }}>Cambiar Estado</p>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {ESTADOS_CONTRATO.filter((s) => s.value !== selectedContrato.estado).map((s) => (
                  <button key={s.value} onClick={() => changeEstado(selectedContrato.id, s.value)} style={{ ...styles.statusBtn, backgroundColor: s.color, color: '#fff' }}>
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
              <button onClick={() => { generarPdf(selectedContrato.id); }} style={{ ...styles.addBtn, flex: 1 }}>Generar PDF</button>
              <button onClick={() => setShowDetail(false)} style={cancelBtnStyle}>Cerrar</button>
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
  statusBtn: { padding: '6px 14px', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: 600 },
};
