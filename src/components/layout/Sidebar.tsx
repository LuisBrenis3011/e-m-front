import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: '📊' },
  { path: '/categorias', label: 'Categorias', icon: '🏷️' },
  { path: '/tematicas', label: 'Tematicas', icon: '🎨' },
  { path: '/clientes', label: 'Clientes', icon: '👥' },
  { path: '/inventario', label: 'Inventario', icon: '📦' },
  { path: '/paquetes', label: 'Paquetes', icon: '🎁' },
  { path: '/cronograma', label: 'Cronograma', icon: '📅' },
  { path: '/contratos', label: 'Contratos', icon: '📝' },
  { path: '/pagos', label: 'Pagos', icon: '💰' },
  { path: '/plantillas', label: 'Plantillas', icon: '📄' },
  { path: '/perfil', label: 'Perfil', icon: '⚙️' },
];

export function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { proveedor, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside style={styles.aside}>
      <div style={styles.brand}>
        <h2 style={styles.brandTitle}>
          {proveedor?.nombreEmpresa ?? 'E&M'}
        </h2>
      </div>
      <nav style={styles.nav}>
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            style={{
              ...styles.navItem,
              ...(location.pathname.startsWith(item.path)
                ? styles.navItemActive
                : {}),
            }}
          >
            <span>{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>
      <div style={styles.footer}>
        <button onClick={handleLogout} style={styles.logoutBtn}>
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
}

const styles: Record<string, React.CSSProperties> = {
  aside: {
    width: '240px',
    minHeight: '100vh',
    backgroundColor: '#1e293b',
    color: '#e2e8f0',
    display: 'flex',
    flexDirection: 'column',
    position: 'fixed',
    left: 0,
    top: 0,
  },
  brand: {
    padding: '20px',
    borderBottom: '1px solid #334155',
  },
  brandTitle: {
    margin: 0,
    fontSize: '18px',
    color: '#f8fafc',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  nav: {
    flex: 1,
    padding: '12px 0',
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '10px 20px',
    color: '#cbd5e1',
    textDecoration: 'none',
    fontSize: '14px',
    transition: 'background 0.15s',
  },
  navItemActive: {
    backgroundColor: '#334155',
    color: '#f8fafc',
    borderRight: '3px solid #3B82F6',
  },
  footer: {
    padding: '16px 20px',
    borderTop: '1px solid #334155',
  },
  logoutBtn: {
    width: '100%',
    padding: '8px',
    backgroundColor: 'transparent',
    color: '#94a3b8',
    border: '1px solid #475569',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
  },
};
