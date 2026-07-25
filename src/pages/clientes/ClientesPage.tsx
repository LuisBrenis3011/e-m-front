import { useEffect, useState, useCallback } from 'react';
import { clientesApi } from '../../api';
import { DataTable } from '../../components/ui/DataTable';
import { SearchBar } from '../../components/ui/SearchBar';
import type { Cliente, ClienteRequest } from '../../types';

const emptyForm: ClienteRequest = {
  nombreCompleto: '', dni: '', telefono: '', direccion: '', referencia: '', email: '',
};

export function ClientesPage() {
  const [data, setData] = useState<Cliente[] | null>(null);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Cliente | null>(null);
  const [form, setForm] = useState<ClienteRequest>(emptyForm);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = search
        ? await clientesApi.search(search)
        : await clientesApi.getAll();
      setData(res.content);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => { setEditing(null); setForm(emptyForm); setShowForm(true); };
  const openEdit = (c: Cliente) => { setEditing(c); setForm({ nombreCompleto: c.nombreCompleto, dni: c.dni, telefono: c.telefono, direccion: c.direccion, referencia: c.referencia, email: c.email }); setShowForm(true); };

  const handleSubmit = async () => {
    if (editing) {
      await clientesApi.update(editing.id, form);
    } else {
      await clientesApi.create(form);
    }
    setShowForm(false);
    load();
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Eliminar cliente?')) return;
    await clientesApi.delete(id);
    load();
  };

  return (
    <div>
      <div style={styles.header}>
        <h2 style={{ margin: 0, color: '#1e293b' }}>Clientes</h2>
        <button onClick={openCreate} style={styles.addBtn}>+ Nuevo Cliente</button>
      </div>

      <div style={{ marginBottom: '16px' }}>
        <SearchBar value={search} onChange={setSearch} placeholder="Buscar por nombre..." />
      </div>

      <DataTable
        data={data ? { content: data, totalElements: data.length, totalPages: 1, number: 0, size: data.length, first: true, last: true } : null}
        columns={[
          { key: 'nombreCompleto', header: 'Nombre' },
          { key: 'dni', header: 'DNI' },
          { key: 'telefono', header: 'Telefono' },
          { key: 'email', header: 'Email' },
          {
            key: 'acciones',
            header: 'Acciones',
            render: (c) => (
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={() => openEdit(c)} style={styles.actionBtn}>Editar</button>
                <button onClick={() => handleDelete(c.id)} style={{ ...styles.actionBtn, color: '#dc2626' }}>Eliminar</button>
              </div>
            ),
          },
        ]}
        onPageChange={() => {}}
        loading={loading}
      />

      {showForm && (
        <div style={styles.modal}>
          <div style={styles.modalCard}>
            <h3>{editing ? 'Editar Cliente' : 'Nuevo Cliente'}</h3>
            {(['nombreCompleto', 'dni', 'telefono', 'direccion', 'referencia', 'email'] as const).map((f) => (
              <div key={f} style={{ marginBottom: '10px' }}>
                <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                  {f.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase())}
                </label>
                <input
                  value={form[f]}
                  onChange={(e) => setForm((p) => ({ ...p, [f]: e.target.value }))}
                  style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '14px' }}
                />
              </div>
            ))}
            <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
              <button onClick={handleSubmit} style={{ ...styles.addBtn, flex: 1 }}>Guardar</button>
              <button onClick={() => setShowForm(false)} style={{ flex: 1, padding: '10px', backgroundColor: '#e2e8f0', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' },
  addBtn: { padding: '10px 18px', backgroundColor: '#3B82F6', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: 600 },
  actionBtn: { padding: '4px 10px', border: '1px solid #d1d5db', borderRadius: '4px', backgroundColor: '#fff', cursor: 'pointer', fontSize: '12px' },
  modal: { position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100 },
  modalCard: { backgroundColor: '#fff', borderRadius: '12px', padding: '28px', width: '100%', maxWidth: '480px', maxHeight: '90vh', overflow: 'auto' },
};
