import { useEffect, useState, useCallback } from 'react';
import { pagosApi } from '../../api';
import { DataTable } from '../../components/ui/DataTable';
import { StatusBadge } from '../../components/ui/StatusBadge';
import type { Pago } from '../../types';
import { TIPOS_PAGO, METODOS_PAGO } from '../../utils/constants';

export function PagosPage() {
  const [data, setData] = useState<Pago[] | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [contratoId, setContratoId] = useState('');
  const [tipoPago, setTipoPago] = useState('ADELANTO');
  const [monto, setMonto] = useState('');
  const [metodoPago, setMetodoPago] = useState('YAPE');
  const [codigoOperacion, setCodigoOperacion] = useState('');
  const [notas, setNotas] = useState('');
  const [comprobante, setComprobante] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await pagosApi.getPendientes();
      setData(res.content);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSubmit = async () => {
    const fd = new FormData();
    fd.append('contratoId', contratoId);
    fd.append('tipoPago', tipoPago);
    fd.append('monto', monto);
    fd.append('metodoPago', metodoPago);
    fd.append('codigoOperacion', codigoOperacion);
    fd.append('notas', notas);
    if (comprobante) fd.append('comprobante', comprobante);

    await pagosApi.create(fd);
    setShowForm(false);
    setContratoId('');
    setMonto('');
    setCodigoOperacion('');
    setNotas('');
    setComprobante(null);
    load();
  };

  const handleVerificar = async (id: number) => {
    await pagosApi.verificar(id);
    load();
  };

  const handleRechazar = async (id: number) => {
    const motivo = prompt('Motivo del rechazo:');
    if (!motivo) return;
    await pagosApi.rechazar(id, motivo);
    load();
  };

  const getEstadoColor = (estado: string) => {
    if (estado === 'VERIFICADO') return '#10B981';
    if (estado === 'RECHAZADO') return '#EF4444';
    return '#F59E0B';
  };

  return (
    <div>
      <div style={styles.header}>
        <h2 style={{ margin: 0, color: '#1e293b' }}>Pagos</h2>
        <button onClick={() => setShowForm(true)} style={styles.addBtn}>+ Registrar Pago</button>
      </div>

      <DataTable
        data={data ? { content: data, totalElements: data.length, totalPages: 1, number: 0, size: data.length, first: true, last: true } : null}
        columns={[
          { key: 'id', header: '#' },
          { key: 'contratoId', header: 'Contrato' },
          { key: 'tipoPago', header: 'Tipo' },
          { key: 'monto', header: 'Monto' },
          { key: 'metodoPago', header: 'Metodo' },
          { key: 'codigoOperacion', header: 'Cod. Operacion' },
          {
            key: 'estado', header: 'Estado',
            render: (p) => <StatusBadge status={p.estado} color={getEstadoColor(p.estado)} />,
          },
          {
            key: 'acciones', header: 'Acciones',
            render: (p) => (
              <div style={{ display: 'flex', gap: '6px' }}>
                {p.estado === 'PENDIENTE' && (
                  <>
                    <button onClick={() => handleVerificar(p.id)} style={{ ...styles.actionBtn, color: '#10B981' }}>Verificar</button>
                    <button onClick={() => handleRechazar(p.id)} style={{ ...styles.actionBtn, color: '#dc2626' }}>Rechazar</button>
                  </>
                )}
                {p.comprobanteUrl && (
                  <a href={p.comprobanteUrl} target="_blank" rel="noreferrer" style={styles.actionBtn}>Ver</a>
                )}
              </div>
            ),
          },
        ]}
        onPageChange={() => {}}
        loading={loading}
      />

      {showForm && (
        <div style={styles.modal}>
          <div style={{ ...styles.modalCard, maxWidth: '480px' }}>
            <h3>Registrar Pago</h3>

            <div style={{ marginBottom: '10px' }}>
              <label style={labelStyle}>Contrato ID</label>
              <input value={contratoId} onChange={(e) => setContratoId(e.target.value)} style={inputStyle} type="number" />
            </div>
            <div style={{ marginBottom: '10px' }}>
              <label style={labelStyle}>Tipo Pago</label>
              <select value={tipoPago} onChange={(e) => setTipoPago(e.target.value)} style={inputStyle}>
                {TIPOS_PAGO.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div style={{ marginBottom: '10px' }}>
              <label style={labelStyle}>Monto</label>
              <input value={monto} onChange={(e) => setMonto(e.target.value)} style={inputStyle} type="number" />
            </div>
            <div style={{ marginBottom: '10px' }}>
              <label style={labelStyle}>Metodo de Pago</label>
              <select value={metodoPago} onChange={(e) => setMetodoPago(e.target.value)} style={inputStyle}>
                {METODOS_PAGO.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
              </select>
            </div>
            <div style={{ marginBottom: '10px' }}>
              <label style={labelStyle}>Codigo Operacion</label>
              <input value={codigoOperacion} onChange={(e) => setCodigoOperacion(e.target.value)} style={inputStyle} />
            </div>
            <div style={{ marginBottom: '10px' }}>
              <label style={labelStyle}>Notas</label>
              <input value={notas} onChange={(e) => setNotas(e.target.value)} style={inputStyle} />
            </div>
            <div style={{ marginBottom: '10px' }}>
              <label style={labelStyle}>Comprobante (opcional)</label>
              <input type="file" accept=".jpg,.png,.pdf" onChange={(e) => setComprobante(e.target.files?.[0] ?? null)} style={inputStyle} />
            </div>

            <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
              <button onClick={handleSubmit} style={{ ...styles.addBtn, flex: 1 }}>Registrar</button>
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
  actionBtn: { padding: '4px 10px', border: '1px solid #d1d5db', borderRadius: '4px', backgroundColor: '#fff', cursor: 'pointer', fontSize: '12px', textDecoration: 'none', color: '#334155' },
  modal: { position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100 },
  modalCard: { backgroundColor: '#fff', borderRadius: '12px', padding: '28px', width: '100%', maxHeight: '90vh', overflow: 'auto' },
};
