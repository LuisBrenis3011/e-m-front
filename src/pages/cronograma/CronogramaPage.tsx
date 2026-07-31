import { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { eventosApi, clientesApi, categoriasApi } from '../../api';
import { paquetesApi } from '../../api';
import type { Evento, EventoRequest, Cliente, Categoria, Tematica, Paquete } from '../../types';
import { InventoryPickerModal, type PickedItem } from '../../components/ui/InventoryPickerModal';
import { ESTADOS_EVENTO, COLORES_CALENDARIO } from '../../utils/constants';

const emptyForm: EventoRequest = {
  clienteId: 0, categoriaId: 0, paqueteId: 0, tematicaId: null, tipoEvento: '',
  nombreCumpleanero: '', edadCumpleanero: 0,
  fechaEvento: '', horaInicio: '', horaFinEstimada: '',
  direccion: '', referencia: '', aforoEstimado: 0,
  colorCalendario: '#3B82F6', notasInternas: '',
};

export function CronogramaPage() {
  const calendarRef = useRef<any>(null);
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [showDayEvents, setShowDayEvents] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedEvent, setSelectedEvent] = useState<Evento | null>(null);
  const [editing, setEditing] = useState<Evento | null>(null);
  const [form, setForm] = useState<EventoRequest>(emptyForm);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [tematicas, setTematicas] = useState<Tematica[]>([]);
  const [paquetes, setPaquetes] = useState<Paquete[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [quickCat, setQuickCat] = useState(false);
  const [quickCatNombre, setQuickCatNombre] = useState('');
  const [quickCatDesc, setQuickCatDesc] = useState('');
  const [quickCatError, setQuickCatError] = useState('');
  const [quickCatSaving, setQuickCatSaving] = useState(false);
  const [quickTem, setQuickTem] = useState(false);
  const [quickTemNombre, setQuickTemNombre] = useState('');
  const [quickTemError, setQuickTemError] = useState('');
  const [quickTemSaving, setQuickTemSaving] = useState(false);
  const [clienteSearch, setClienteSearch] = useState('');
  const [showClienteDropdown, setShowClienteDropdown] = useState(false);
  const [adicionalesPicker, setAdicionalesPicker] = useState(false);
  const [adicionalesItems, setAdicionalesItems] = useState<PickedItem[]>([]);

  const loadEventos = useCallback(async () => {
    const calApi = calendarRef.current?.getApi();
    if (!calApi) return;
    const view = calApi.view;
    const inicio = view.activeStart.toISOString().split('T')[0];
    const fin = view.activeEnd.toISOString().split('T')[0];
    const res = await eventosApi.getCalendario({ inicio, fin, size: 200 });
    setEventos(res.content);
  }, []);

  useEffect(() => {
    loadEventos();
    clientesApi.getAll(0, 200).then((r) => setClientes(r.content));
    categoriasApi.getAll().then(setCategorias);
  }, [loadEventos]);

  const eventosPorFecha = useMemo(() => {
    const map: Record<string, Evento[]> = {};
    eventos.forEach((e) => {
      if (!map[e.fechaEvento]) map[e.fechaEvento] = [];
      map[e.fechaEvento].push(e);
    });
    return map;
  }, [eventos]);

  const handleDateClick = (arg: { dateStr: string }) => {
    const evts = eventosPorFecha[arg.dateStr];
    if (evts && evts.length > 0) {
      setSelectedDate(arg.dateStr);
      setShowDayEvents(true);
    } else {
      setEditing(null);
      setError('');
      setForm({ ...emptyForm, fechaEvento: arg.dateStr });
      setTematicas([]);
      setClienteSearch('');
      setShowClienteDropdown(false);
      setAdicionalesItems([]);
      setShowForm(true);
    }
  };

  const handleEventClick = (e: Evento) => {
    setSelectedEvent(e);
    setShowDetail(true);
  };

  const handleCategoriaChange = async (categoriaId: number) => {
    setForm((p) => ({ ...p, categoriaId, paqueteId: 0, tematicaId: null }));
    setTematicas([]);
    setPaquetes([]);
    if (categoriaId === 0) return;
    const [tems, pqs] = await Promise.all([
      categoriasApi.getTematicasByCategoria(categoriaId),
      paquetesApi.getAll(0, 50, categoriaId),
    ]);
    setTematicas(tems);
    setPaquetes(pqs.content);
  };

  const handleSubmit = async () => {
    setError('');
    if (!form.clienteId) { setError('Seleccione un cliente.'); return; }
    if (!form.categoriaId) { setError('Seleccione una categoria.'); return; }
    if (!form.paqueteId) { setError('Seleccione un paquete.'); return; }
    if (!form.fechaEvento) { setError('Seleccione una fecha.'); return; }
    if (!form.horaInicio) { setError('Ingrese la hora de inicio.'); return; }
    if (!form.direccion.trim()) { setError('Ingrese la direccion del evento.'); return; }

    const payload = {
      ...form,
      horaInicio: form.horaInicio.length === 5 ? form.horaInicio + ':00' : form.horaInicio,
      horaFinEstimada: form.horaFinEstimada
        ? form.horaFinEstimada.length === 5 ? form.horaFinEstimada + ':00' : form.horaFinEstimada
        : undefined,
      tematicaId: form.tematicaId || null,
    };

    setLoading(true);
    try {
      let eventoId: number;
      if (editing) {
        await eventosApi.update(editing.id, payload as EventoRequest);
        eventoId = editing.id;
      } else {
        const ev = await eventosApi.create(payload as EventoRequest);
        eventoId = ev.id;
      }
      if (adicionalesItems.length > 0) {
        localStorage.setItem(`adicionales_${eventoId}`, JSON.stringify(adicionalesItems));
      }
      setShowForm(false);
      setAdicionalesItems([]);
      await loadEventos();
    } catch (err: any) {
      const msg = err?.response?.data?.message
        ?? err?.response?.data?.errors
          ? JSON.stringify(err.response.data.errors)
          : 'Error al guardar.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const changeEstado = async (id: number, estado: string) => {
    await eventosApi.changeEstado(id, estado);
    setShowDetail(false);
    setShowDayEvents(false);
    loadEventos();
  };

  const handleQuickCreateCategoria = async () => {
    setQuickCatError('');
    if (!quickCatNombre.trim()) { setQuickCatError('Nombre requerido.'); return; }
    setQuickCatSaving(true);
    try {
      const nueva = await categoriasApi.create({ nombre: quickCatNombre, descripcion: quickCatDesc });
      setCategorias((prev) => [...prev, nueva]);
      setForm((p) => ({ ...p, categoriaId: nueva.id }));
      setQuickCat(false);
      setQuickCatNombre('');
      setQuickCatDesc('');
    } catch (err: any) {
      setQuickCatError(err?.response?.data?.message ?? 'Error al crear.');
    } finally {
      setQuickCatSaving(false);
    }
  };

  const handleQuickCreateTematica = async () => {
    setQuickTemError('');
    if (!quickTemNombre.trim()) { setQuickTemError('Nombre requerido.'); return; }
    if (!form.categoriaId) { setQuickTemError('Seleccione una categoria primero.'); return; }
    setQuickTemSaving(true);
    try {
      const nueva = await categoriasApi.createTematica(form.categoriaId, { nombre: quickTemNombre });
      setTematicas((prev) => [...prev, nueva]);
      setForm((p) => ({ ...p, tematicaId: nueva.id }));
      setQuickTem(false);
      setQuickTemNombre('');
    } catch (err: any) {
      setQuickTemError(err?.response?.data?.message ?? 'Error al crear.');
    } finally {
      setQuickTemSaving(false);
    }
  };

  const filteredClientes = clienteSearch
    ? clientes.filter((c) => c.nombreCompleto.toLowerCase().includes(clienteSearch.toLowerCase()))
    : clientes;

  const handleSelectCliente = (c: Cliente) => {
    setForm((p) => ({ ...p, clienteId: c.id, direccion: c.direccion, referencia: c.referencia }));
    setClienteSearch(c.nombreCompleto);
    setShowClienteDropdown(false);
  };

  const dayEvents = selectedDate ? eventosPorFecha[selectedDate] ?? [] : [];

  const dayCellContent = (arg: { date: Date; dayNumberText: string }) => {
    const dateStr = arg.date.toISOString().split('T')[0];
    const count = eventosPorFecha[dateStr]?.length ?? 0;
    return (
      <div style={{ position: 'relative', paddingTop: '2px' }}>
        <span style={{ fontSize: '13px', fontWeight: 500 }}>{arg.dayNumberText.replace('日', '')}</span>
        {count > 0 && (
          <span style={{
            position: 'absolute', top: '-2px', right: '2px',
            backgroundColor: '#3B82F6', color: '#fff',
            fontSize: '10px', fontWeight: 700, padding: '1px 5px',
            borderRadius: '10px', lineHeight: '14px',
          }}>
            {count}
          </span>
        )}
      </div>
    );
  };

  const calendarEvents = eventos.map((e) => ({
    id: String(e.id),
    title: `${e.horaInicio.substring(0, 5)} ${e.clienteNombre}`,
    start: `${e.fechaEvento}T${e.horaInicio}`,
    end: e.horaFinEstimada ? `${e.fechaEvento}T${e.horaFinEstimada}` : undefined,
    backgroundColor: e.colorCalendario ?? '#3B82F6',
    borderColor: e.colorCalendario ?? '#3B82F6',
    textColor: '#fff',
    extendedProps: { evento: e },
  }));

  return (
    <div>
      <style>{calendarStyles}</style>
      <h2 style={{ margin: '0 0 16px', color: '#1e293b', fontSize: '22px', fontWeight: 700 }}>Cronograma</h2>
      <div style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)' }}>
        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin as never, interactionPlugin as never]}
          initialView="dayGridMonth"
          selectable
          editable
          events={calendarEvents}
          dateClick={handleDateClick}
          eventClick={(arg) => handleEventClick(arg.event.extendedProps.evento)}
          dayMaxEvents={1}
          moreLinkContent={(arg) => `+${arg.num}`}
          dayCellContent={dayCellContent}
          locale="es"
          height="auto"
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,dayGridWeek',
          }}
          datesSet={loadEventos}
        />
      </div>

      {/* Modal: Lista de eventos del dia */}
      {showDayEvents && (
        <div style={overlayStyle} onClick={() => setShowDayEvents(false)}>
          <div style={panelStyle} onClick={(e) => e.stopPropagation()}>
            <div style={panelHeaderStyle}>
              <div>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700 }}>
                  {(() => {
                    const d = new Date(selectedDate + 'T12:00');
                    return d.toLocaleDateString('es', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
                  })()}
                </h3>
                <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#64748b' }}>{dayEvents.length} evento{dayEvents.length !== 1 ? 's' : ''}</p>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => { setShowDayEvents(false); setEditing(null); setError(''); setForm({ ...emptyForm, fechaEvento: selectedDate }); setTematicas([]); setShowForm(true); }}
                  style={{ ...btnPrimaryStyle, padding: '8px 16px', fontSize: '13px' }}
                >
                  + Crear evento
                </button>
                <button onClick={() => setShowDayEvents(false)} style={btnGhostStyle}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              </div>
            </div>
            <div style={{ overflowY: 'auto', flex: 1, minHeight: 0, paddingRight: '4px' }}>
              {dayEvents.map((ev) => (
                <div
                  key={ev.id}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '14px',
                    padding: '14px 16px', marginBottom: '8px',
                    backgroundColor: '#fff', borderRadius: '10px',
                    border: '1px solid #e2e8f0',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                  onClick={() => { setShowDayEvents(false); handleEventClick(ev); }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 12px rgba(0,0,0,0.06)';
                    (e.currentTarget as HTMLDivElement).style.borderColor = '#cbd5e1';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLDivElement).style.boxShadow = '';
                    (e.currentTarget as HTMLDivElement).style.borderColor = '#e2e8f0';
                  }}
                >
                  <div style={{
                    width: '10px', height: '10px', borderRadius: '50%',
                    backgroundColor: ev.colorCalendario ?? '#3B82F6', flexShrink: 0,
                  }}/>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: '#1e293b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {ev.clienteNombre}
                    </div>
                    <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                      {ev.horaInicio?.substring(0, 5)} {ev.horaFinEstimada ? `- ${ev.horaFinEstimada.substring(0, 5)}` : ''}
                      {ev.categoriaNombre ? ` · ${ev.categoriaNombre}` : ''}
                    </div>
                  </div>
                  <div style={{
                    padding: '3px 10px', borderRadius: '12px',
                    fontSize: '11px', fontWeight: 600,
                    backgroundColor: `${ESTADOS_EVENTO.find((s) => s.value === ev.estado)?.color ?? '#9CA3AF'}18`,
                    color: ESTADOS_EVENTO.find((s) => s.value === ev.estado)?.color ?? '#9CA3AF',
                    flexShrink: 0,
                  }}>
                    {ev.estado}
                  </div>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" style={{ flexShrink: 0 }}>
                    <polyline points="9 18 15 12 9 6"/>
                  </svg>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Modal: Detalle del evento */}
      {showDetail && selectedEvent && (
        <div style={overlayStyle} onClick={() => setShowDetail(false)}>
          <div style={{ ...panelStyle, maxWidth: '520px', overflowY: 'auto' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
              <div>
                <div style={{
                  display: 'inline-block', padding: '4px 12px', borderRadius: '12px',
                  fontSize: '12px', fontWeight: 700, marginBottom: '8px',
                  backgroundColor: `${ESTADOS_EVENTO.find((s) => s.value === selectedEvent.estado)?.color ?? '#9CA3AF'}18`,
                  color: ESTADOS_EVENTO.find((s) => s.value === selectedEvent.estado)?.color ?? '#9CA3AF',
                }}>
                  {selectedEvent.estado}
                </div>
                <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 700, color: '#0f172a' }}>{selectedEvent.clienteNombre}</h3>
                <p style={{ margin: '4px 0 0', fontSize: '14px', color: '#64748b' }}>
                  {selectedEvent.categoriaNombre}{selectedEvent.paqueteNombre ? ` · ${selectedEvent.paqueteNombre}` : ''}{selectedEvent.tematicaNombre ? ` · ${selectedEvent.tematicaNombre}` : ''}
                </p>
              </div>
              <button onClick={() => setShowDetail(false)} style={btnGhostStyle}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '20px' }}>
              <InfoCard icon="📅" label="Fecha" value={`${selectedEvent.fechaEvento} ${selectedEvent.horaInicio?.substring(0, 5)}`} />
              {selectedEvent.horaFinEstimada && <InfoCard icon="🕐" label="Hora fin" value={selectedEvent.horaFinEstimada.substring(0, 5)} />}
              {selectedEvent.tipoEvento && <InfoCard icon="🎯" label="Tipo" value={selectedEvent.tipoEvento} />}
              {selectedEvent.nombreCumpleanero && <InfoCard icon="🎂" label="Cumpleanero" value={`${selectedEvent.nombreCumpleanero} (${selectedEvent.edadCumpleanero})`} />}
              <InfoCard icon="📍" label="Direccion" value={selectedEvent.direccion} />
              {selectedEvent.referencia && <InfoCard icon="📌" label="Referencia" value={selectedEvent.referencia} />}
              {selectedEvent.aforoEstimado > 0 && <InfoCard icon="👥" label="Aforo" value={String(selectedEvent.aforoEstimado)} />}
              {selectedEvent.notasInternas && <InfoCard icon="📝" label="Notas" value={selectedEvent.notasInternas} />}
            </div>

            <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '16px', marginBottom: '16px' }}>
              <p style={{ fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '10px' }}>Cambiar estado</p>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {ESTADOS_EVENTO.filter((s) => s.value !== selectedEvent.estado).map((s) => (
                  <button
                    key={s.value}
                    onClick={() => changeEstado(selectedEvent.id, s.value)}
                    style={{
                      padding: '8px 16px', border: 'none', borderRadius: '8px', cursor: 'pointer',
                      fontSize: '12px', fontWeight: 600, backgroundColor: s.color, color: '#fff',
                      transition: 'opacity 0.15s',
                    }}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => {
                setShowDetail(false);
                setEditing(selectedEvent);
                setForm({
                  clienteId: selectedEvent.clienteId,
                  categoriaId: selectedEvent.categoriaId,
                  paqueteId: selectedEvent.paqueteId,
                  tematicaId: selectedEvent.tematicaId ?? null,
                  tipoEvento: selectedEvent.tipoEvento ?? '',
                  nombreCumpleanero: selectedEvent.nombreCumpleanero ?? '',
                  edadCumpleanero: selectedEvent.edadCumpleanero ?? 0,
                  fechaEvento: selectedEvent.fechaEvento,
                  horaInicio: selectedEvent.horaInicio?.substring(0, 5) ?? '',
                  horaFinEstimada: selectedEvent.horaFinEstimada?.substring(0, 5) ?? '',
                  direccion: selectedEvent.direccion ?? '',
                  referencia: selectedEvent.referencia ?? '',
                  aforoEstimado: selectedEvent.aforoEstimado ?? 0,
                  colorCalendario: selectedEvent.colorCalendario ?? '#3B82F6',
                  notasInternas: selectedEvent.notasInternas ?? '',
                });
                if (selectedEvent.categoriaId) handleCategoriaChange(selectedEvent.categoriaId);
                setShowForm(true);
              }}
              style={{ ...btnPrimaryStyle, width: '100%', padding: '10px', marginTop: '4px' }}
            >
              Editar evento
            </button>
          </div>
        </div>
      )}

      {/* Modal: Formulario crear/editar evento */}
      <InventoryPickerModal
        open={adicionalesPicker}
        onClose={() => setAdicionalesPicker(false)}
        onConfirm={(items) => { setAdicionalesItems(items); setAdicionalesPicker(false); }}
        initialItems={adicionalesItems}
        title="Agregar items adicionales"
      />

      {showForm && (
        <div style={overlayStyle}>
          <div style={{ ...panelStyle, maxWidth: '560px', overflowY: 'auto' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700 }}>
                {editing ? 'Editar Evento' : 'Nuevo Evento'}
              </h3>
              <button onClick={() => setShowForm(false)} style={btnGhostStyle}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>

            {error && <div style={errorBoxStyle}>{error}</div>}

            <div style={sectionStyle}>
              <div style={stepLabelStyle}>1. Cliente *</div>
              <div style={{ position: 'relative' }}>
                <input
                  value={clienteSearch}
                  onChange={(e) => { setClienteSearch(e.target.value); setShowClienteDropdown(true); if (e.target.value === '') setForm((p) => ({ ...p, clienteId: 0 })); }}
                  onFocus={() => setShowClienteDropdown(true)}
                  onBlur={() => setTimeout(() => setShowClienteDropdown(false), 150)}
                  style={selectStyle}
                  placeholder="Buscar cliente por nombre..."
                />
                {showClienteDropdown && filteredClientes.length > 0 && (
                  <div style={{
                    position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 50,
                    backgroundColor: '#fff', border: '1px solid #d1d5db', borderRadius: '8px',
                    maxHeight: '180px', overflowY: 'auto', boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  }}>
                    {filteredClientes.map((c) => (
                      <div
                        key={c.id}
                        onMouseDown={() => handleSelectCliente(c)}
                        style={{
                          padding: '10px 14px', cursor: 'pointer', fontSize: '14px',
                          backgroundColor: form.clienteId === c.id ? '#eff6ff' : '#fff',
                          borderBottom: '1px solid #f1f5f9',
                        }}
                      >
                        <span style={{ fontWeight: 500 }}>{c.nombreCompleto}</span>
                        <span style={{ color: '#94a3b8', fontSize: '12px', marginLeft: '8px' }}>{c.dni}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div style={sectionStyle}>
              <div style={{ ...stepLabelStyle, display: 'flex', justifyContent: 'space-between' }}>
                <span>2. Categoria *</span>
                <button type="button" onClick={() => { setQuickCatNombre(''); setQuickCatDesc(''); setQuickCatError(''); setQuickCat(true); }} style={miniAddStyle}>+ Crear</button>
              </div>
              <select value={form.categoriaId} onChange={(e) => handleCategoriaChange(Number(e.target.value))} style={selectStyle}>
                <option value={0}>Seleccionar categoria...</option>
                {categorias.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
              </select>
              {quickCat && (
                <div style={inlineFormStyle}>
                  {quickCatError && <div style={{ color: '#dc2626', fontSize: '12px', marginBottom: '6px' }}>{quickCatError}</div>}
                  <input value={quickCatNombre} onChange={(e) => setQuickCatNombre(e.target.value)} placeholder="Nombre" style={miniInputStyle} />
                  <input value={quickCatDesc} onChange={(e) => setQuickCatDesc(e.target.value)} placeholder="Descripcion (opcional)" style={{ ...miniInputStyle, marginTop: '4px' }} />
                  <div style={{ display: 'flex', gap: '6px', marginTop: '6px' }}>
                    <button type="button" onClick={handleQuickCreateCategoria} disabled={quickCatSaving} style={{ ...btnPrimaryStyle, flex: 1, padding: '5px 10px', fontSize: '12px' }}>
                      {quickCatSaving ? '...' : 'Crear'}
                    </button>
                    <button type="button" onClick={() => setQuickCat(false)} style={{ ...btnGhostStyle, fontSize: '12px', padding: '5px 10px' }}>Cancelar</button>
                  </div>
                </div>
              )}
            </div>

            {form.categoriaId > 0 && (
              <div style={sectionStyle}>
                <div style={stepLabelStyle}>3. Paquete *</div>
                {paquetes.length > 0 ? (
                  <select value={form.paqueteId} onChange={(e) => setForm((p) => ({ ...p, paqueteId: Number(e.target.value) }))} style={selectStyle}>
                    <option value={0}>Seleccionar paquete...</option>
                    {paquetes.map((p) => <option key={p.id} value={p.id}>{p.nombre} - S/{p.precioBase}</option>)}
                  </select>
                ) : (
                  <p style={{ color: '#94a3b8', fontSize: '13px', margin: '4px 0' }}>
                    No hay paquetes para esta categoria. Crea uno en la seccion Paquetes.
                  </p>
                )}
              </div>
            )}

            <div style={sectionStyle}>
              <div style={{ ...stepLabelStyle, display: 'flex', justifyContent: 'space-between' }}>
                <span>4. Tematica (opcional)</span>
                {form.categoriaId > 0 && (
                  <button type="button" onClick={() => { setQuickTemNombre(''); setQuickTemError(''); setQuickTem(true); }} style={miniAddStyle}>+ Crear</button>
                )}
              </div>
              {tematicas.length > 0 ? (
                <select value={form.tematicaId ?? 0} onChange={(e) => { const v = Number(e.target.value); setForm((p) => ({ ...p, tematicaId: v === 0 ? null : v })); }} style={selectStyle}>
                  <option value={0}>Sin tematica</option>
                  {tematicas.map((t) => <option key={t.id} value={t.id}>{t.nombre}</option>)}
                </select>
              ) : (
                <p style={{ color: '#94a3b8', fontSize: '13px', margin: '4px 0' }}>{form.categoriaId > 0 ? 'No hay tematicas para esta categoria.' : 'Seleccione una categoria.'}</p>
              )}
              {quickTem && (
                <div style={inlineFormStyle}>
                  {quickTemError && <div style={{ color: '#dc2626', fontSize: '12px', marginBottom: '6px' }}>{quickTemError}</div>}
                  <input value={quickTemNombre} onChange={(e) => setQuickTemNombre(e.target.value)} placeholder="Nombre" style={miniInputStyle} />
                  <div style={{ display: 'flex', gap: '6px', marginTop: '6px' }}>
                    <button type="button" onClick={handleQuickCreateTematica} disabled={quickTemSaving} style={{ ...btnPrimaryStyle, flex: 1, padding: '5px 10px', fontSize: '12px' }}>
                      {quickTemSaving ? '...' : 'Crear'}
                    </button>
                    <button type="button" onClick={() => setQuickTem(false)} style={{ ...btnGhostStyle, fontSize: '12px', padding: '5px 10px' }}>Cancelar</button>
                  </div>
                </div>
              )}
            </div>

            <div style={sectionStyle}>
              <div style={{ ...stepLabelStyle, display: 'flex', justifyContent: 'space-between' }}>
                <span>5. Items adicionales (opcional)</span>
                <button type="button" onClick={() => setAdicionalesPicker(true)} style={miniAddStyle}>+ Agregar</button>
              </div>
              {adicionalesItems.length === 0 && (
                <p style={{ color: '#94a3b8', fontSize: '13px', margin: '4px 0' }}>Sin items adicionales</p>
              )}
              {adicionalesItems.map((item) => (
                <div key={item.inventarioId} style={{ display: 'flex', gap: '8px', alignItems: 'center', padding: '3px 0', fontSize: '13px' }}>
                  <span style={{ flex: 1 }}>{item.cantidad}x {item.inventarioNombre}</span>
                  <button type="button" onClick={() => setAdicionalesItems((prev) => prev.filter((it) => it.inventarioId !== item.inventarioId))} style={{ color: '#dc2626', border: 'none', background: 'none', cursor: 'pointer', fontWeight: 700 }}>X</button>
                </div>
              ))}
            </div>

            <div style={sectionStyle}>
              <div style={stepLabelStyle}>6. Tipo de evento (opcional)</div>
              <input value={form.tipoEvento} onChange={(e) => setForm((p) => ({ ...p, tipoEvento: e.target.value }))} style={inputStyle} placeholder="Ej: Cumpleanos con show de magia, Cena de gala..." maxLength={100} />
            </div>

            <div style={sectionStyle}>
              <div style={stepLabelStyle}>7. Cumpleanero (opcional)</div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input value={form.nombreCumpleanero} onChange={(e) => setForm((p) => ({ ...p, nombreCumpleanero: e.target.value }))} style={inputStyle} placeholder="Nombre" maxLength={150} />
                <input type="number" value={form.edadCumpleanero || ''} onChange={(e) => setForm((p) => ({ ...p, edadCumpleanero: Number(e.target.value) }))} style={{ ...inputStyle, width: '80px' }} placeholder="Edad" />
              </div>
            </div>

            <div style={sectionStyle}>
              <div style={stepLabelStyle}>8. Fecha y hora</div>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '6px' }}>
                <input type="date" value={form.fechaEvento} onChange={(e) => setForm((p) => ({ ...p, fechaEvento: e.target.value }))} style={inputStyle} />
                <input type="time" value={form.horaInicio.substring(0, 5)} onChange={(e) => setForm((p) => ({ ...p, horaInicio: e.target.value }))} style={inputStyle} />
              </div>
              <input type="time" value={form.horaFinEstimada ? form.horaFinEstimada.substring(0, 5) : ''} onChange={(e) => setForm((p) => ({ ...p, horaFinEstimada: e.target.value }))} style={{ ...inputStyle, width: '50%' }} placeholder="Hora fin (opcional)" />
            </div>

            <div style={sectionStyle}>
              <div style={stepLabelStyle}>9. Ubicacion</div>
              <input value={form.direccion} onChange={(e) => setForm((p) => ({ ...p, direccion: e.target.value }))} style={{ ...inputStyle, marginBottom: '6px' }} placeholder="Direccion *" />
              <input value={form.referencia} onChange={(e) => setForm((p) => ({ ...p, referencia: e.target.value }))} style={inputStyle} placeholder="Referencia (opcional)" />
            </div>

            <div style={{ ...sectionStyle, marginBottom: 0 }}>
              <div style={stepLabelStyle}>10. Detalles adicionales</div>
              <input type="number" value={form.aforoEstimado || ''} onChange={(e) => setForm((p) => ({ ...p, aforoEstimado: Number(e.target.value) }))} style={{ ...inputStyle, marginBottom: '6px' }} placeholder="Aforo estimado" />
              <div style={{ marginBottom: '6px' }}>
                <span style={{ fontSize: '12px', color: '#64748b', display: 'block', marginBottom: '4px' }}>Color</span>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {COLORES_CALENDARIO.map((color) => (
                    <button key={color} type="button" onClick={() => setForm((p) => ({ ...p, colorCalendario: color }))}
                      style={{
                        width: '28px', height: '28px', borderRadius: '8px', backgroundColor: color,
                        border: form.colorCalendario === color ? '3px solid #0f172a' : '2px solid transparent',
                        cursor: 'pointer', transition: 'transform 0.1s',
                        transform: form.colorCalendario === color ? 'scale(1.15)' : 'scale(1)',
                      }}
                    />
                  ))}
                </div>
              </div>
              <textarea value={form.notasInternas} onChange={(e) => setForm((p) => ({ ...p, notasInternas: e.target.value }))} style={{ ...inputStyle, minHeight: '60px', resize: 'vertical' }} placeholder="Notas internas..." rows={2} />
            </div>

            <div style={{ display: 'flex', gap: '8px', marginTop: '20px' }}>
              <button onClick={handleSubmit} disabled={loading} style={{ ...btnPrimaryStyle, flex: 1, padding: '12px' }}>
                {loading ? 'Guardando...' : editing ? 'Actualizar' : 'Crear Evento'}
              </button>
              <button onClick={() => setShowForm(false)} style={{ ...btnGhostStyle, padding: '12px 20px' }}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function InfoCard({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div style={{ backgroundColor: '#f8fafc', borderRadius: '8px', padding: '12px' }}>
      <div style={{ fontSize: '18px', marginBottom: '4px' }}>{icon}</div>
      <div style={{ fontSize: '12px', fontWeight: 600, color: '#64748b' }}>{label}</div>
      <div style={{ fontSize: '13px', color: '#1e293b', marginTop: '2px', wordBreak: 'break-word' }}>{value}</div>
    </div>
  );
}

const overlayStyle: React.CSSProperties = {
  position: 'fixed', inset: 0, zIndex: 1000,
  backgroundColor: 'rgba(15, 23, 42, 0.5)',
  backdropFilter: 'blur(4px)',
  display: 'flex', justifyContent: 'center', alignItems: 'center',
  padding: '20px',
  animation: 'fadeIn 0.15s ease',
};

const panelStyle: React.CSSProperties = {
  backgroundColor: '#fff', borderRadius: '16px',
  padding: '24px', width: '100%', maxWidth: '560px', maxHeight: '80vh',
  overflow: 'hidden', display: 'flex', flexDirection: 'column',
  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  animation: 'slideUp 0.2s ease',
};

const panelHeaderStyle: React.CSSProperties = {
  display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
  paddingBottom: '16px', borderBottom: '1px solid #e2e8f0', marginBottom: '16px',
};

const btnPrimaryStyle: React.CSSProperties = {
  backgroundColor: '#3B82F6', color: '#fff', border: 'none',
  borderRadius: '8px', cursor: 'pointer', fontWeight: 600,
  transition: 'background 0.15s',
};

const btnGhostStyle: React.CSSProperties = {
  backgroundColor: 'transparent', color: '#64748b', border: 'none',
  borderRadius: '8px', cursor: 'pointer', padding: '6px',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
};

const errorBoxStyle: React.CSSProperties = { backgroundColor: '#fef2f2', color: '#dc2626', padding: '10px 14px', borderRadius: '8px', fontSize: '13px', marginBottom: '14px' };

const sectionStyle: React.CSSProperties = { marginBottom: '14px' };
const stepLabelStyle: React.CSSProperties = { fontSize: '13px', fontWeight: 700, color: '#3B82F6', marginBottom: '6px' };
const selectStyle: React.CSSProperties = { width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', backgroundColor: '#fff', outline: 'none' };
const inputStyle: React.CSSProperties = { width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box', outline: 'none' };
const miniAddStyle: React.CSSProperties = { padding: '3px 10px', backgroundColor: '#10B981', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '11px', fontWeight: 600 };
const miniInputStyle: React.CSSProperties = { width: '100%', padding: '8px 10px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '13px', boxSizing: 'border-box', outline: 'none' };
const inlineFormStyle: React.CSSProperties = { marginTop: '8px', padding: '12px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' };

const calendarStyles = `
  .fc { font-family: system-ui, -apple-system, sans-serif; }
  .fc-toolbar-title { font-size: 18px !important; font-weight: 700 !important; color: #1e293b !important; text-transform: capitalize; }
  .fc-button { background-color: #fff !important; border: 1px solid #d1d5db !important; color: #334155 !important; border-radius: 8px !important; padding: 6px 14px !important; font-size: 13px !important; font-weight: 600 !important; text-transform: capitalize !important; box-shadow: none !important; }
  .fc-button-active { background-color: #3B82F6 !important; border-color: #3B82F6 !important; color: #fff !important; }
  .fc-button:hover { background-color: #f1f5f9 !important; }
  .fc-button-active:hover { background-color: #2563EB !important; }
  .fc-today-button { background-color: #3B82F6 !important; color: #fff !important; border-color: #3B82F6 !important; }
  .fc-today-button:hover { background-color: #2563EB !important; }
  .fc-today-button:disabled { background-color: #94a3b8 !important; border-color: #94a3b8 !important; }
  .fc-day-today { background-color: #eff6ff !important; }
  .fc th { padding: 10px 0 !important; font-size: 11px !important; font-weight: 700 !important; color: #64748b !important; text-transform: uppercase !important; letter-spacing: 0.5px !important; border: none !important; }
  .fc-daygrid-day-frame { min-height: 80px !important; cursor: pointer; }
  .fc-daygrid-day-number { font-size: 13px !important; font-weight: 500 !important; padding: 6px 8px !important; color: #334155 !important; }
  .fc-day-other .fc-daygrid-day-number { color: #cbd5e1 !important; }
  .fc .fc-daygrid-day.fc-day-today { background-color: #eff6ff !important; }
  .fc .fc-daygrid-day.fc-day-today .fc-daygrid-day-number { color: #3B82F6 !important; font-weight: 700 !important; }
  .fc-event { border-radius: 6px !important; padding: 3px 8px !important; font-size: 12px !important; font-weight: 500 !important; border: none !important; cursor: pointer !important; margin: 1px 3px !important; }
  .fc-more-link { font-size: 12px !important; font-weight: 600 !important; color: #3B82F6 !important; }
  .fc-col-header-cell { background-color: #f8fafc !important; border-bottom: 1px solid #e2e8f0 !important; }
  .fc-scrollgrid { border: 1px solid #e2e8f0 !important; border-radius: 10px !important; overflow: hidden !important; }
  .fc-scrollgrid td { border: none !important; }
  .fc-scrollgrid { border: none !important; }
  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  @keyframes slideUp { from { opacity: 0; transform: translateY(10px) scale(0.98); } to { opacity: 1; transform: translateY(0) scale(1); } }
`;
