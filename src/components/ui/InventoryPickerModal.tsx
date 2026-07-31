import { useState, useEffect, useCallback } from 'react';
import { inventarioApi } from '../../api';
import type { Inventario } from '../../types';

export interface PickedItem {
  inventarioId: number;
  inventarioNombre: string;
  cantidad: number;
  precioUnitario: number;
}

interface InventoryPickerModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (items: PickedItem[]) => void;
  initialItems?: PickedItem[];
  title?: string;
}

export function InventoryPickerModal({
  open,
  onClose,
  onConfirm,
  initialItems = [],
  title = 'Seleccionar inventario',
}: InventoryPickerModalProps) {
  const [search, setSearch] = useState('');
  const [results, setResults] = useState<Inventario[]>([]);
  const [selected, setSelected] = useState<PickedItem[]>(initialItems);

  useEffect(() => {
    if (open) setSelected(initialItems);
  }, [open, initialItems]);

  const doSearch = useCallback(async (q: string) => {
    setSearch(q);
    if (q.length < 2) { setResults([]); return; }
    const res = await inventarioApi.search(q);
    setResults(res);
  }, []);

  const addItem = (item: Inventario) => {
    setSelected((prev) => {
      const existing = prev.find((s) => s.inventarioId === item.id);
      if (existing) {
        return prev.map((s) => s.inventarioId === item.id ? { ...s, cantidad: s.cantidad + 1 } : s);
      }
      return [...prev, { inventarioId: item.id, inventarioNombre: item.nombre, cantidad: 1, precioUnitario: item.precioReferencial }];
    });
  };

  const increment = (inventarioId: number) => {
    setSelected((prev) => prev.map((s) => s.inventarioId === inventarioId ? { ...s, cantidad: s.cantidad + 1 } : s));
  };

  const decrement = (inventarioId: number) => {
    setSelected((prev) => {
      const item = prev.find((s) => s.inventarioId === inventarioId);
      if (item && item.cantidad <= 1) {
        return prev.filter((s) => s.inventarioId !== inventarioId);
      }
      return prev.map((s) => s.inventarioId === inventarioId ? { ...s, cantidad: s.cantidad - 1 } : s);
    });
  };

  const remove = (inventarioId: number) => {
    setSelected((prev) => prev.filter((s) => s.inventarioId !== inventarioId));
  };

  const handleConfirm = () => {
    onConfirm(selected);
    onClose();
  };

  const handleClose = () => {
    setSearch('');
    setResults([]);
    onClose();
  };

  if (!open) return null;

  return (
    <div style={overlayStyle} onClick={handleClose}>
      <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
        <div style={headerStyle}>
          <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700 }}>{title}</h3>
          <button onClick={handleClose} style={closeBtnStyle}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <input
          value={search}
          onChange={(e) => doSearch(e.target.value)}
          placeholder="Buscar en inventario..."
          style={searchInputStyle}
          autoFocus
        />

        <div style={contentStyle}>
          <div style={listStyle}>
            {results.length === 0 && search.length >= 2 && (
              <p style={{ color: '#94a3b8', fontSize: '13px', textAlign: 'center', padding: '16px' }}>Sin resultados</p>
            )}
            {results.length === 0 && search.length < 2 && (
              <p style={{ color: '#94a3b8', fontSize: '13px', textAlign: 'center', padding: '16px' }}>Escribe al menos 2 caracteres</p>
            )}
            {results.map((item) => {
              const alreadyPicked = selected.find((s) => s.inventarioId === item.id);
              return (
                <div key={item.id} style={inventoryItemStyle}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '13px', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {item.nombre}
                    </div>
                    <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                      Stock: {item.cantidadDisponible} · Ref: S/{item.precioReferencial}
                    </div>
                  </div>
                  <button onClick={() => addItem(item)} style={addBtnStyle}>
                    {alreadyPicked ? `+${alreadyPicked.cantidad + 1}` : '+ Agregar'}
                  </button>
                </div>
              );
            })}
          </div>

          <div style={selectedPanelStyle}>
            <h4 style={{ fontSize: '12px', fontWeight: 700, color: '#64748b', margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Seleccionados ({selected.length})
            </h4>
            {selected.length === 0 && (
              <p style={{ color: '#94a3b8', fontSize: '12px', textAlign: 'center', padding: '16px 0' }}>Sin items seleccionados</p>
            )}
            <div style={{ overflowY: 'auto', flex: 1, minHeight: 0 }}>
              {selected.map((item) => (
                <div key={item.inventarioId} style={selectedItemStyle}>
                  <span style={{ flex: 1, fontSize: '13px', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {item.inventarioNombre}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <button onClick={() => decrement(item.inventarioId)} style={qtyBtnStyle}>-</button>
                    <span style={{ minWidth: '20px', textAlign: 'center', fontSize: '13px', fontWeight: 600 }}>{item.cantidad}</span>
                    <button onClick={() => increment(item.inventarioId)} style={qtyBtnStyle}>+</button>
                    <button onClick={() => remove(item.inventarioId)} style={{ ...qtyBtnStyle, color: '#dc2626', marginLeft: '4px' }}>X</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
          <button onClick={handleConfirm} style={confirmBtnStyle}>Confirmar ({selected.length})</button>
          <button onClick={handleClose} style={cancelBtnStyle}>Cancelar</button>
        </div>
      </div>
    </div>
  );
}

const overlayStyle: React.CSSProperties = {
  position: 'fixed', inset: 0, zIndex: 2000,
  backgroundColor: 'rgba(15, 23, 42, 0.5)', backdropFilter: 'blur(4px)',
  display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px',
};

const modalStyle: React.CSSProperties = {
  backgroundColor: '#fff', borderRadius: '16px', padding: '24px',
  width: '100%', maxWidth: '680px', maxHeight: '85vh',
  display: 'flex', flexDirection: 'column',
  boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
  animation: 'slideUp 0.2s ease',
};

const headerStyle: React.CSSProperties = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' };
const closeBtnStyle: React.CSSProperties = { background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: '4px' };

const searchInputStyle: React.CSSProperties = { padding: '10px 14px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', outline: 'none', marginBottom: '12px' };

const contentStyle: React.CSSProperties = { display: 'flex', gap: '16px', flex: 1, minHeight: 0, overflow: 'hidden' };

const listStyle: React.CSSProperties = { flex: 1, overflowY: 'auto', minHeight: 0, border: '1px solid #e2e8f0', borderRadius: '8px', padding: '8px' };

const inventoryItemStyle: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 8px',
  borderBottom: '1px solid #f1f5f9',
};

const addBtnStyle: React.CSSProperties = {
  padding: '4px 12px', backgroundColor: '#3B82F6', color: '#fff', border: 'none',
  borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 600,
  whiteSpace: 'nowrap', flexShrink: 0,
};

const selectedPanelStyle: React.CSSProperties = {
  width: '240px', flexShrink: 0, border: '1px solid #e2e8f0', borderRadius: '8px',
  padding: '12px', display: 'flex', flexDirection: 'column', overflow: 'hidden',
};

const selectedItemStyle: React.CSSProperties = {
  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  padding: '6px 0', borderBottom: '1px solid #f1f5f9', gap: '4px',
};

const qtyBtnStyle: React.CSSProperties = {
  width: '24px', height: '24px', borderRadius: '4px', border: '1px solid #d1d5db',
  backgroundColor: '#fff', cursor: 'pointer', fontSize: '14px', fontWeight: 600,
  display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#334155',
};

const confirmBtnStyle: React.CSSProperties = {
  flex: 1, padding: '10px', backgroundColor: '#3B82F6', color: '#fff',
  border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: 600,
};

const cancelBtnStyle: React.CSSProperties = {
  padding: '10px 20px', backgroundColor: '#e2e8f0', color: '#334155',
  border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: 600,
};
