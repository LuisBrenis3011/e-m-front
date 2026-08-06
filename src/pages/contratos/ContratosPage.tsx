import { useEffect, useState, useCallback } from 'react';
import api from '../../api/client';
import { contratosApi, eventosApi, pagosApi, paquetesApi } from '../../api';
import { DataTable } from '../../components/ui/DataTable';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { AuthImage } from '../../components/ui/AuthImage';
import type { Contrato, ContratoRequest, Evento, Pago } from '../../types';
import { ESTADOS_CONTRATO } from '../../utils/constants';
import { showSuccess } from '../../utils/swal';
import { confirmAction } from '../../utils/swal';

const emptyForm: ContratoRequest = {
  eventoId: 0, costoMovilidad: 0,
  montoAdelanto: 0, duracion: '', observaciones: '',
};

export function ContratosPage() {
  const [data, setData] = useState<Contrato[] | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [selectedContrato, setSelectedContrato] = useState<Contrato | null>(null);
  const [pagosHistorial, setPagosHistorial] = useState<Pago[]>([]);
  const [form, setForm] = useState<ContratoRequest>(emptyForm);
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloadError, setDownloadError] = useState('');
  const [downloading, setDownloading] = useState(false);
  const [showPagoForm, setShowPagoForm] = useState(false);
  const [pagoTipo, setPagoTipo] = useState('ADELANTO');
  const [pagoMonto, setPagoMonto] = useState('');
  const [pagoMetodo, setPagoMetodo] = useState('YAPE');
  const [pagoCodigoOp, setPagoCodigoOp] = useState('');
  const [pagoNotas, setPagoNotas] = useState('');
  const [pagoFile, setPagoFile] = useState<File | null>(null);
  const [filter, setFilter] = useState<'todo' | 'semana' | 'mes'>('todo');

  const getSemana = () => {
    const now = new Date();
    const day = now.getDay();
    const lunes = new Date(now); lunes.setDate(now.getDate() - ((day + 6) % 7));
    const domingo = new Date(lunes); domingo.setDate(lunes.getDate() + 6);
    return { desde: lunes.toISOString().split('T')[0], hasta: domingo.toISOString().split('T')[0] };
  };

  const getMes = () => {
    const now = new Date();
    const inicio = new Date(now.getFullYear(), now.getMonth(), 1);
    const fin = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return { desde: inicio.toISOString().split('T')[0], hasta: fin.toISOString().split('T')[0] };
  };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      let desde: string | undefined, hasta: string | undefined;
      if (filter === 'semana') {
        const s = getSemana(); desde = s.desde; hasta = s.hasta;
      } else if (filter === 'mes') {
        const m = getMes(); desde = m.desde; hasta = m.hasta;
      }
      const res = await contratosApi.getAll(0, 100, desde, hasta);
      setData(res.content);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    load();
    eventosApi.getCalendario({ inicio: '2020-01-01', fin: '2030-12-31', size: 100 }).then((r) => setEventos(r.content));
  }, [load]);

  const openCreate = () => { setForm(emptyForm); setShowForm(true); };

  const handleSubmit = async () => {
    if (!form.eventoId) return;
    const contrato = await contratosApi.create(form);
    const stored = localStorage.getItem(`adicionales_${form.eventoId}`);
    if (stored) {
      const items = JSON.parse(stored);
      for (const item of items) {
        await api.post(`/contratos/${contrato.id}/detalles`, {
          inventarioId: item.inventarioId,
          cantidad: item.cantidad,
          precioUnitario: item.precioUnitario,
          tipoDetalle: 'ADICIONAL',
          orden: 100,
        });
      }
      localStorage.removeItem(`adicionales_${form.eventoId}`);
    }
    setShowForm(false);
    showSuccess('Contrato creado.');
    load();
  };

  const openDetail = async (c: Contrato) => {
    const [detail, pagos] = await Promise.all([
      contratosApi.getById(c.id),
      pagosApi.getByContrato(c.id).then((r) => r.content).catch(() => [] as Pago[]),
    ]);
    setSelectedContrato(detail);
    setPagosHistorial(pagos);
    setShowDetail(true);
  };

  const changeEstado = async (id: number, estado: string) => {
    await contratosApi.changeEstado(id, estado);
    showSuccess(`Contrato ${estado.toLowerCase()}.`);
    setShowDetail(false);
    load();
  };

  const handleDeleteContrato = async (id: number) => {
    const ok = await confirmAction('Eliminar contrato', 'Esta accion no se puede deshacer.', 'Eliminar', '#dc2626');
    if (!ok) return;
    await contratosApi.delete(id);
    showSuccess('Contrato eliminado.');
    load();
  };

  const handlePagoSubmit = async () => {
    if (!selectedContrato || !pagoMonto) return;
    const fd = new FormData();
    fd.append('contratoId', String(selectedContrato.id));
    fd.append('tipoPago', pagoTipo);
    fd.append('monto', pagoMonto);
    fd.append('metodoPago', pagoMetodo);
    fd.append('codigoOperacion', pagoCodigoOp);
    fd.append('notas', pagoNotas);
    if (pagoFile) fd.append('comprobante', pagoFile);

    await api.post('/pagos', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
    showSuccess('Pago registrado.');
    setShowPagoForm(false);

    const [detail, pagos] = await Promise.all([
      contratosApi.getById(selectedContrato.id),
      pagosApi.getByContrato(selectedContrato.id).then((r) => r.content).catch(() => [] as Pago[]),
    ]);
    setSelectedContrato(detail);
    setPagosHistorial(pagos);
  };

  const generarPdf = async (contratoId: number) => {
    setDownloadError('');
    setDownloading(true);
    try {
      const token = localStorage.getItem('token');

      const genRes = await fetch(`/api/documentos/generar/${contratoId}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!genRes.ok) {
        const err = await genRes.json();
        setDownloadError(err.message ?? 'Error al generar PDF.');
        return;
      }

      const data = await genRes.json();

      const dlRes = await fetch(`/api/documentos/descargar/${data.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const blob = await dlRes.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `contrato_${contratoId}_v${data.version}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      setDownloadError('Error de conexion al generar el PDF.');
    } finally {
      setDownloading(false);
    }
  };

  const getEstadoColor = (estado: string) => {
    const found = ESTADOS_CONTRATO.find((s) => s.value === estado);
    return found?.color ?? '#9CA3AF';
  };

  return (
    <div>
      <div style={styles.header}>
        <h2 style={{ margin: 0, color: '#1e293b' }}>Contratos</h2>
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
          {(['semana', 'mes', 'todo'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: '6px 14px', borderRadius: '6px', border: '1px solid #d1d5db', cursor: 'pointer',
                fontSize: '12px', fontWeight: 600,
                backgroundColor: filter === f ? '#3B82F6' : '#fff',
                color: filter === f ? '#fff' : '#64748b',
              }}
            >
              {f === 'semana' ? 'Semana' : f === 'mes' ? 'Mes' : 'Todo'}
            </button>
          ))}
          <button onClick={openCreate} style={styles.addBtn}>+ Nuevo Contrato</button>
        </div>
      </div>

      {downloadError && (
        <div style={{ backgroundColor: '#fef2f2', color: '#dc2626', padding: '10px 14px', borderRadius: '8px', fontSize: '13px', marginBottom: '12px' }}>
          {downloadError} <button onClick={() => setDownloadError('')} style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer', fontWeight: 700, marginLeft: '8px' }}>X</button>
        </div>
      )}

      <DataTable
        data={data ? { content: data, totalElements: data.length, totalPages: 1, number: 0, size: data.length, first: true, last: true } : null}
        columns={[
          { key: 'id', header: '#' },
          { key: 'clienteNombre', header: 'Cliente' },
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
                <button onClick={() => generarPdf(c.id)} disabled={downloading} style={styles.actionBtn}>
                  {downloading ? '...' : 'PDF'}
                </button>
                <button onClick={() => handleDeleteContrato(c.id)} style={{ ...styles.actionBtn, color: '#dc2626' }}>Eliminar</button>
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
              <select value={form.eventoId} onChange={async (e) => {
                const id = Number(e.target.value);
                setForm((p) => ({ ...p, eventoId: id }));
                if (!id) return;
                try {
                  const evento = await eventosApi.getById(id);
                  const pq = await paquetesApi.getById(evento.paqueteId);
                  setForm((p) => ({ ...p, duracion: `${pq.duracionBaseHoras} horas` }));
                } catch {
                  // fallback
                }
              }} style={inputStyle}>
                <option value={0}>Seleccionar...</option>
                {eventos.map((ev) => <option key={ev.id} value={ev.id}>{ev.clienteNombre} - {ev.fechaEvento}</option>)}
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
              <button onClick={handleSubmit} disabled={!form.eventoId} style={{ ...styles.addBtn, flex: 1 }}>Guardar</button>
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
            <p><strong>Monto Total:</strong> S/{selectedContrato.montoTotal.toFixed(2)}</p>
            <p><strong>Adelanto:</strong> S/{selectedContrato.montoAdelanto.toFixed(2)}</p>
            <p><strong>Pendiente:</strong> S/{selectedContrato.montoPendiente.toFixed(2)}</p>
            <p><strong>Duracion:</strong> {selectedContrato.duracion}</p>
            <p><strong>Observaciones:</strong> {selectedContrato.observaciones}</p>

            {selectedContrato.detalles?.length > 0 && (
              <div style={{ marginTop: '16px' }}>
                {(() => {
                  const incluye = selectedContrato.detalles.filter((d) => d.tipoDetalle === 'INCLUYE');
                  const obsequios = selectedContrato.detalles.filter((d) => d.tipoDetalle === 'OBSEQUIO');
                  const adicionales = selectedContrato.detalles.filter((d) => d.tipoDetalle === 'ADICIONAL');

                  return (
                    <>
                      {incluye.length > 0 && (
                        <div style={{ marginBottom: '12px' }}>
                          <h4 style={sectionTitleStyle}>RECURSOS BASICOS</h4>
                          {incluye.map((d) => (
                            <div key={d.id} style={{ fontSize: '13px', padding: '3px 0', color: '#334155' }}>
                              {d.cantidad}x {d.inventarioNombre} — S/{d.precioUnitario.toFixed(2)} = S/{d.subtotal.toFixed(2)}
                            </div>
                          ))}
                        </div>
                      )}
                      {obsequios.length > 0 && (
                        <div style={{ marginBottom: '12px' }}>
                          <h4 style={{ ...sectionTitleStyle, color: '#10B981' }}>OBSEQUIOS</h4>
                          {obsequios.map((d) => (
                            <div key={d.id} style={{ fontSize: '13px', padding: '3px 0', color: '#334155' }}>
                              {d.cantidad}x {d.inventarioNombre} — Gratis
                            </div>
                          ))}
                        </div>
                      )}
                      {adicionales.length > 0 && (
                        <div style={{ marginBottom: '12px' }}>
                          <h4 style={{ ...sectionTitleStyle, color: '#F59E0B' }}>ITEMS ADICIONALES</h4>
                          {adicionales.map((d) => (
                            <div key={d.id} style={{ fontSize: '13px', padding: '3px 0', color: '#334155' }}>
                              {d.cantidad}x {d.inventarioNombre} — S/{d.precioUnitario.toFixed(2)} = S/{d.subtotal.toFixed(2)}
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  );
                })()}
              </div>
            )}

            <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '14px', marginTop: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: '#1e293b' }}>Pagos del Contrato #{selectedContrato.id}</h4>
                <button
                  onClick={async () => {
                    setPagoTipo('ADELANTO');
                    setPagoMonto('');
                    setPagoMetodo('YAPE');
                    setPagoCodigoOp('');
                    setPagoNotas('');
                    setPagoFile(null);
                    if (selectedContrato) {
                      const tieneAdelanto = pagosHistorial.some((p) => p.tipoPago === 'ADELANTO' && p.estado !== 'RECHAZADO');
                      if (!tieneAdelanto && selectedContrato.montoAdelanto > 0) {
                        setPagoTipo('ADELANTO');
                        setPagoMonto(String(selectedContrato.montoAdelanto));
                      } else if (selectedContrato.montoPendiente > 0) {
                        setPagoTipo('SALDO');
                        setPagoMonto(String(selectedContrato.montoPendiente));
                      }
                    }
                    setShowPagoForm(true);
                  }}
                  style={{ padding: '6px 14px', backgroundColor: '#3B82F6', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 600 }}
                >
                  + Registrar Pago
                </button>
              </div>

              {(() => {
                const pagado = selectedContrato.montoTotal - selectedContrato.montoPendiente;
                const pct = selectedContrato.montoTotal > 0 ? (pagado / selectedContrato.montoTotal) * 100 : 0;
                return (
                  <div style={{ marginBottom: '14px' }}>
                    <div style={{ display: 'flex', gap: '24px', fontSize: '13px', marginBottom: '6px' }}>
                      <span>Total: <strong>S/ {selectedContrato.montoTotal.toFixed(2)}</strong></span>
                      <span>Pagado: <strong style={{ color: '#10B981' }}>S/ {pagado.toFixed(2)}</strong></span>
                      <span>Pendiente: <strong style={{ color: '#dc2626' }}>S/ {selectedContrato.montoPendiente.toFixed(2)}</strong></span>
                      <span style={{ color: '#94a3b8' }}>{Math.round(pct)}%</span>
                    </div>
                    <div style={{ width: '100%', height: '6px', backgroundColor: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ width: `${pct}%`, height: '100%', backgroundColor: '#10B981', borderRadius: '3px', transition: 'width 0.3s' }} />
                    </div>
                  </div>
                );
              })()}

              {pagosHistorial.length > 0 ? (
                pagosHistorial.map((p) => (
                  <div key={p.id} style={{ fontSize: '13px', padding: '6px 0', color: '#334155', display: 'flex', gap: '12px', alignItems: 'center', borderBottom: '1px solid #f1f5f9' }}>
                    <span style={{
                      padding: '2px 8px', borderRadius: '8px', fontSize: '11px', fontWeight: 600, minWidth: '70px', textAlign: 'center',
                      backgroundColor: p.estado === 'VERIFICADO' ? '#dcfce7' : p.estado === 'RECHAZADO' ? '#fef2f2' : '#fef9c3',
                      color: p.estado === 'VERIFICADO' ? '#166534' : p.estado === 'RECHAZADO' ? '#991b1b' : '#854d0e',
                    }}>
                      {p.estado === 'VERIFICADO' ? '✓ Verificado' : p.estado === 'RECHAZADO' ? '✗ Rechazado' : '⏳ Pendiente'}
                    </span>
                    <span style={{ minWidth: '50px' }}>{p.tipoPago.substring(0, 3)}</span>
                    <span style={{ fontWeight: 600 }}>S/ {p.monto.toFixed(2)}</span>
                    <span>{p.metodoPago}</span>
                    <span style={{ color: '#94a3b8', flex: 1 }}>{p.fechaPago}</span>
                    {p.urlComprobante && <AuthImage src={`/api/pagos/comprobante/${p.id}`} alt="Comp" style={{ width: '40px', height: '30px', objectFit: 'cover', borderRadius: '3px', cursor: 'pointer' }} onClick={() => window.open(`/api/pagos/comprobante/${p.id}`, '_blank')} />}
                  </div>
                ))
              ) : (
                <p style={{ color: '#94a3b8', fontSize: '13px', textAlign: 'center', padding: '16px 0' }}>Sin pagos registrados</p>
              )}

              {showPagoForm && (
                <div style={{ marginTop: '12px', padding: '14px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <h5 style={{ margin: '0 0 10px', fontSize: '13px', fontWeight: 700 }}>Registrar Pago</h5>
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                    <select value={pagoTipo} onChange={(e) => setPagoTipo(e.target.value)} style={miniSelectStyle}>
                      <option value="ADELANTO">Adelanto</option>
                      <option value="SALDO">Saldo</option>
                      <option value="PAGO_TOTAL">Pago Total</option>
                    </select>
                    <select value={pagoMetodo} onChange={(e) => setPagoMetodo(e.target.value)} style={miniSelectStyle}>
                      <option value="YAPE">Yape</option>
                      <option value="PLIN">Plin</option>
                      <option value="TRANSFERENCIA">Transferencia</option>
                      <option value="EFECTIVO">Efectivo</option>
                    </select>
                    <input type="number" value={pagoMonto} onChange={(e) => setPagoMonto(e.target.value)} placeholder="Monto" style={{ ...miniSelectStyle, width: '100px' }} />
                  </div>
                  <input value={pagoCodigoOp} onChange={(e) => setPagoCodigoOp(e.target.value)} placeholder="Cod. operacion (opcional)" style={{ ...miniInputStyle, marginBottom: '6px' }} />
                  <input value={pagoNotas} onChange={(e) => setPagoNotas(e.target.value)} placeholder="Notas (opcional)" style={{ ...miniInputStyle, marginBottom: '6px' }} />
                  <input type="file" accept="image/*,.pdf" onChange={(e) => setPagoFile(e.target.files?.[0] ?? null)} style={{ ...miniInputStyle, marginBottom: '8px' }} />
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button onClick={handlePagoSubmit} disabled={!pagoMonto} style={{ padding: '6px 14px', backgroundColor: '#3B82F6', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 600 }}>Registrar</button>
                    <button onClick={() => setShowPagoForm(false)} style={{ padding: '6px 14px', backgroundColor: '#e2e8f0', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}>Cancelar</button>
                  </div>
                </div>
              )}
            </div>

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

            {downloadError && (
              <div style={{ backgroundColor: '#fef2f2', color: '#dc2626', padding: '10px 14px', borderRadius: '8px', fontSize: '13px', marginTop: '14px' }}>
                {downloadError}
              </div>
            )}

            <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
              <button onClick={() => { generarPdf(selectedContrato.id); }} disabled={downloading} style={{ ...styles.addBtn, flex: 1 }}>
                {downloading ? 'Generando...' : 'Generar PDF'}
              </button>
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
const sectionTitleStyle: React.CSSProperties = { fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: '#3B82F6', margin: '0 0 4px', letterSpacing: '0.5px' };
const cancelBtnStyle: React.CSSProperties = { padding: '10px', backgroundColor: '#e2e8f0', border: 'none', borderRadius: '6px', cursor: 'pointer' };
const miniSelectStyle: React.CSSProperties = { padding: '6px 8px', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '13px', flex: 1 };
const miniInputStyle: React.CSSProperties = { width: '100%', padding: '6px 8px', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '13px', boxSizing: 'border-box' };

const styles: Record<string, React.CSSProperties> = {
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' },
  addBtn: { padding: '10px 18px', backgroundColor: '#3B82F6', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: 600 },
  actionBtn: { padding: '4px 10px', border: '1px solid #d1d5db', borderRadius: '4px', backgroundColor: '#fff', cursor: 'pointer', fontSize: '12px' },
  modal: { position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100 },
  modalCard: { backgroundColor: '#fff', borderRadius: '12px', padding: '28px', width: '100%', maxHeight: '90vh', overflow: 'auto' },
  statusBtn: { padding: '6px 14px', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: 600 },
};
