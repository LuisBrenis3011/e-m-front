import { useAuth } from '../../hooks/useAuth';

export function Header() {
  const { usuario, proveedor } = useAuth();

  return (
    <header style={styles.header}>
      <h1 style={styles.title}>
        {proveedor?.nombreEmpresa ?? 'E&M ANIMACIONES'}
      </h1>
      <div style={styles.userInfo}>
        <span style={styles.userName}>
          {usuario?.nombre} {usuario?.apellido}
        </span>
        <div style={styles.avatar}>
          {usuario?.nombre?.charAt(0)}
          {usuario?.apellido?.charAt(0)}
        </div>
      </div>
    </header>
  );
}

const styles: Record<string, React.CSSProperties> = {
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 32px',
    backgroundColor: '#fff',
    borderBottom: '1px solid #e2e8f0',
    position: 'sticky',
    top: 0,
    zIndex: 10,
  },
  title: {
    margin: 0,
    fontSize: '20px',
    color: '#1e293b',
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  userName: {
    fontSize: '14px',
    color: '#475569',
  },
  avatar: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    backgroundColor: '#3B82F6',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '13px',
    fontWeight: 600,
  },
};
