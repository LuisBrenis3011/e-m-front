import { useEffect, useState, useCallback } from 'react';
import { pagosApi } from '../../api';
import { DataTable } from '../../components/ui/DataTable';
import { AuthImage } from '../../components/ui/AuthImage';
import { promptInput, showSuccess, confirmAction } from '../../utils/swal';
import type { Pago } from '../../types';

export function PagosPage() {
  const [data, setData] = useState<Pago[] | null>(null);
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

  const handleVerificar = async (id: number) => {
    await pagosApi.verificar(id);
    showSuccess('Pago verificado.');
    load();
  };

  const handleRechazar = async (id: number) => {
    const motivo = await promptInput('Rechazar pago', 'Motivo del rechazo:');
    if (!motivo) return;
    await pagosApi.rechazar(id, motivo);
    showSuccess('Pago rechazado.');
    load();
  };

  const handleDelete = async (id: number) => {
    const ok = await confirmAction('Eliminar pago', 'Esta accion no se puede deshacer.', 'Eliminar', '#dc2626');
    if (!ok) return;
    await pagosApi.delete(id);
    showSuccess('Pago eliminado.');
    load();
  };

  const getEstadoColor = (estado: string) => {
    if (estado === 'VERIFICADO') return '#10B981';
    if (estado === 'RECHAZADO') return '#EF4444';
    return '#F59E0B';
  };

  return (
    <div>
      <h2 style={{ margin: '0 0 16px', color: '#1e293b' }}>Pagos Pendientes de Verificar</h2>

      <DataTable
        data={data ? { content: data, totalElements: data.length, totalPages: 1, number: 0, size: data.length, first: true, last: true } : null}
        columns={[
          { key: 'contratoId', header: 'Contrato' },
          { key: 'tipoPago', header: 'Tipo' },
          {
            key: 'monto', header: 'Monto',
            render: (p) => `S/ ${p.monto.toFixed(2)}`,
          },
          { key: 'metodoPago', header: 'Metodo' },
          {
            key: 'urlComprobante', header: 'Foto',
            render: (p) => p.urlComprobante
              ? <AuthImage src={`/api/pagos/comprobante/${p.id}`} alt="Comp" style={{ width: '50px', height: '35px', objectFit: 'cover', borderRadius: '4px', cursor: 'pointer' }} onClick={() => window.open(`/api/pagos/comprobante/${p.id}`, '_blank')} />
              : <span style={{ color: '#94a3b8', fontSize: '12px' }}>—</span>,
          },
          { key: 'fechaPago', header: 'Fecha' },
          {
            key: 'estado', header: 'Estado',
            render: (p) => (
              <span style={{
                padding: '2px 10px', borderRadius: '10px', fontSize: '11px', fontWeight: 600,
                backgroundColor: `${getEstadoColor(p.estado)}18`, color: getEstadoColor(p.estado),
              }}>
                {p.estado === 'VERIFICADO' ? '✓' : p.estado === 'RECHAZADO' ? '✗' : '⏳'}
              </span>
            ),
          },
          {
            key: 'acciones', header: 'Acciones',
            render: (p) => (
              <div style={{ display: 'flex', gap: '6px' }}>
                <button onClick={() => handleVerificar(p.id)} style={{ ...styles.actionBtn, color: '#10B981' }}>✓</button>
                <button onClick={() => handleRechazar(p.id)} style={{ ...styles.actionBtn, color: '#dc2626' }}>✗</button>
                <button onClick={() => handleDelete(p.id)} style={{ ...styles.actionBtn, color: '#94a3b8' }}>🗑</button>
              </div>
            ),
          },
        ]}
        onPageChange={() => {}}
        loading={loading}
      />
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  actionBtn: { padding: '4px 10px', border: '1px solid #d1d5db', borderRadius: '4px', backgroundColor: '#fff', cursor: 'pointer', fontSize: '12px' },
};
