import { useEffect, useState } from 'react';
import { dashboardApi } from '../../api';
import type { DashboardData } from '../../types';

export function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardApi
      .get()
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Cargando dashboard...</p>;
  if (!data) return <p>Error al cargar el dashboard</p>;

  const kpis = [
    { label: 'Total Clientes', value: data.totalClientes, color: '#3B82F6' },
    { label: 'Inventario Activo', value: data.totalInventarioActivo, color: '#10B981' },
    { label: 'Paquetes Activos', value: data.totalPaquetesActivos, color: '#F59E0B' },
    { label: 'Eventos Programados', value: data.totalEventosProgramados, color: '#8B5CF6' },
    { label: 'Total Contratos', value: data.totalContratos, color: '#EC4899' },
    { label: 'Ingresos Totales', value: `S/ ${data.ingresosTotales.toFixed(2)}`, color: '#06B6D4' },
    { label: 'Pagos Pendientes', value: data.pagosPendientes, color: '#EF4444' },
    { label: 'Monto Pendiente', value: `S/ ${data.montoPendienteCobrar.toFixed(2)}`, color: '#F97316' },
  ];

  return (
    <div>
      <h2 style={{ margin: '0 0 20px', color: '#1e293b' }}>Dashboard</h2>

      <div style={styles.grid}>
        {kpis.map((kpi) => (
          <div key={kpi.label} style={{ ...styles.kpiCard, borderTopColor: kpi.color }}>
            <p style={styles.kpiLabel}>{kpi.label}</p>
            <p style={styles.kpiValue}>{kpi.value}</p>
          </div>
        ))}
      </div>

      {data.contratosPorEstado && (
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>Contratos por Estado</h3>
          <div style={styles.estadosGrid}>
            {Object.entries(data.contratosPorEstado).map(([estado, count]) => (
              <div key={estado} style={styles.estadoCard}>
                <span style={styles.estadoLabel}>{estado}</span>
                <span style={styles.estadoCount}>{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>Proximos Eventos</h3>
        {data.proximosEventos?.length ? (
          <div style={styles.eventList}>
            {data.proximosEventos.slice(0, 5).map((ev) => (
              <div key={ev.id} style={styles.eventItem}>
                <span>{ev.fechaEvento}</span>
                <span>{ev.clienteNombre}</span>
                <span>{ev.tematicaNombre ?? ev.tipoEvento}</span>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ color: '#64748b', fontSize: '14px' }}>No hay eventos proximos</p>
        )}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
    gap: '16px',
    marginBottom: '28px',
  },
  kpiCard: {
    backgroundColor: '#fff',
    borderRadius: '8px',
    padding: '20px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
    borderTop: '3px solid',
  },
  kpiLabel: { margin: 0, fontSize: '12px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' as const },
  kpiValue: { margin: '8px 0 0', fontSize: '24px', fontWeight: 700, color: '#1e293b' },
  section: { backgroundColor: '#fff', borderRadius: '8px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', marginBottom: '20px' },
  sectionTitle: { margin: '0 0 12px', fontSize: '16px', color: '#1e293b' },
  estadosGrid: { display: 'flex', gap: '12px', flexWrap: 'wrap' as const },
  estadoCard: { padding: '8px 16px', backgroundColor: '#f8fafc', borderRadius: '6px', display: 'flex', flexDirection: 'column' as const, alignItems: 'center' },
  estadoLabel: { fontSize: '12px', color: '#64748b' },
  estadoCount: { fontSize: '18px', fontWeight: 700, color: '#1e293b' },
  eventList: { display: 'flex', flexDirection: 'column' as const, gap: '8px' },
  eventItem: { display: 'flex', gap: '16px', padding: '8px 0', borderBottom: '1px solid #f1f5f9', fontSize: '14px', color: '#334155' },
};
