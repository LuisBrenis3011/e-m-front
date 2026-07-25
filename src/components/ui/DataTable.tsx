import type { Page } from '../../types';

interface DataTableProps<T> {
  data: Page<T> | null;
  columns: { key: string; header: string; render?: (item: T) => React.ReactNode }[];
  onPageChange: (page: number) => void;
  loading?: boolean;
  emptyMessage?: string;
}

export function DataTable<T extends { id: number }>({
  data,
  columns,
  onPageChange,
  loading,
  emptyMessage = 'No hay datos disponibles',
}: DataTableProps<T>) {
  if (loading) {
    return <p style={{ color: '#64748b', textAlign: 'center', padding: '24px' }}>Cargando...</p>;
  }

  if (!data || data.content.length === 0) {
    return <p style={{ color: '#64748b', textAlign: 'center', padding: '24px' }}>{emptyMessage}</p>;
  }

  return (
    <div>
      <div style={{ overflowX: 'auto' }}>
        <table style={styles.table}>
          <thead>
            <tr>
              {columns.map((col) => (
                <th key={col.key} style={styles.th}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.content.map((item) => (
              <tr key={item.id} style={styles.tr}>
                {columns.map((col) => (
                  <td key={col.key} style={styles.td}>
                    {col.render
                      ? col.render(item)
                      : String((item as Record<string, unknown>)[col.key] ?? '')}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {data.totalPages > 1 && (
        <div style={styles.pagination}>
          <button
            onClick={() => onPageChange(data.number - 1)}
            disabled={data.first}
            style={styles.pageBtn}
          >
            Anterior
          </button>
          <span style={styles.pageInfo}>
            Pagina {data.number + 1} de {data.totalPages} ({data.totalElements} registros)
          </span>
          <button
            onClick={() => onPageChange(data.number + 1)}
            disabled={data.last}
            style={styles.pageBtn}
          >
            Siguiente
          </button>
        </div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    backgroundColor: '#fff',
    borderRadius: '8px',
    overflow: 'hidden',
    boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
  },
  th: {
    textAlign: 'left',
    padding: '12px 16px',
    backgroundColor: '#f8fafc',
    color: '#475569',
    fontSize: '12px',
    fontWeight: 600,
    textTransform: 'uppercase',
    borderBottom: '1px solid #e2e8f0',
  },
  tr: {
    borderBottom: '1px solid #f1f5f9',
  },
  td: {
    padding: '12px 16px',
    fontSize: '14px',
    color: '#334155',
  },
  pagination: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '16px',
    marginTop: '16px',
  },
  pageBtn: {
    padding: '6px 14px',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    backgroundColor: '#fff',
    cursor: 'pointer',
    fontSize: '13px',
  },
  pageInfo: {
    fontSize: '13px',
    color: '#64748b',
  },
};
