import { createContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { authApi } from '../api';
import type { JwtResponse, Usuario, Proveedor, RegisterRequest, RegisterEmpresaRequest } from '../types';

interface AuthContextType {
  user: JwtResponse | null;
  usuario: Usuario | null;
  proveedor: Proveedor | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  registerEmpresa: (data: RegisterEmpresaRequest) => Promise<void>;
  logout: () => void;
  refreshProveedor: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType>(null!);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<JwtResponse | null>(null);
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [proveedor, setProveedor] = useState<Proveedor | null>(null);
  const [loading, setLoading] = useState(true);

  const bootstrap = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const [me, prov] = await Promise.all([
        authApi.me(),
        authApi.getProveedor(),
      ]);
      const stored = localStorage.getItem('user');
      if (stored) setUser(JSON.parse(stored));
      setUsuario(me);
      setProveedor(prov);
    } catch {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('proveedorId');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    bootstrap();
  }, [bootstrap]);

  const login = async (email: string, password: string) => {
    const res = await authApi.login({ email, password });
    localStorage.setItem('token', res.token);
    localStorage.setItem('user', JSON.stringify(res));
    localStorage.setItem('proveedorId', String(res.proveedorId));
    setUser(res);
    const [me, prov] = await Promise.all([
      authApi.me(),
      authApi.getProveedor(),
    ]);
    setUsuario(me);
    setProveedor(prov);
  };

  const register = async (data: RegisterRequest) => {
    const res = await authApi.register(data);
    localStorage.setItem('token', res.token);
    localStorage.setItem('user', JSON.stringify(res));
    localStorage.setItem('proveedorId', String(res.proveedorId));
    setUser(res);
    const [me, prov] = await Promise.all([
      authApi.me(),
      authApi.getProveedor(),
    ]);
    setUsuario(me);
    setProveedor(prov);
  };

  const registerEmpresa = async (data: RegisterEmpresaRequest) => {
    const res = await authApi.registerEmpresa(data);
    localStorage.setItem('token', res.token);
    localStorage.setItem('user', JSON.stringify(res));
    localStorage.setItem('proveedorId', String(res.proveedorId));
    setUser(res);
    const [me, prov] = await Promise.all([
      authApi.me(),
      authApi.getProveedor(),
    ]);
    setUsuario(me);
    setProveedor(prov);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('proveedorId');
    setUser(null);
    setUsuario(null);
    setProveedor(null);
  };

  const refreshProveedor = async () => {
    const prov = await authApi.getProveedor();
    setProveedor(prov);
  };

  return (
    <AuthContext.Provider
      value={{ user, usuario, proveedor, loading, login, register, registerEmpresa, logout, refreshProveedor }}
    >
      {children}
    </AuthContext.Provider>
  );
}
