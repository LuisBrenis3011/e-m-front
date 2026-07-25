import { useEffect, useState, useCallback, useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { eventosApi, clientesApi } from '../../api';
import type { Evento, EventoRequest, Cliente } from '../../types';
import { ESTADOS_EVENTO, TIPOS_EVENTO, COLORES_CALENDARIO } from '../../utils/constants';

const emptyForm: EventoRequest = {
  clienteId: 0, tipoEvento: 'SHOW INFANTIL', nombreCumpleanero: '',
  edadCumpleanero: 0, fechaEvento: '', horaInicio: '', horaFinEstimada: '',
  referencia: '', aforoEstimado: 0, colorCalendario: '#3B82F6', notasInternas: '',
};

export function CronogramaPage() {
  const calendarRef = useRef<any>(null);
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [editing, setEditing] = useState<Evento | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<Evento | null>(null);
  const [form, setForm] = useState<EventoRequest>(emptyForm);
  const [clientes, setClientes] = useState<Cliente[]>([]);

  const loadEventos = useCallback(async () => {
    const calApi = calendarRef.current?.getApi();
    if (!calApi) return;
    const view = calApi.view;
    const inicio = view.activeStart.toISOString().split('T')[0];
    const fin = view.activeEnd.toISOString().split('T')[0];
    const res = await eventosApi.getCalendario({ inicio, fin, size: 100 });
    setEventos(res.content);
  }, []);

  useEffect(() => {
    loadEventos();
    clientesApi.getAll(0, 100).then((r) => setClientes(r.content));
  }, [loadEventos]);

  const handleDateSelect = (arg: { startStr: string }) => {
    setEditing(null);
    setForm({ ...emptyForm, fechaEvento: arg.startStr.split('T')[0] });
    setShowForm(true);
  };

  const handleEventClick = (arg: { event: { id: string } }) => {
    const ev = eventos.find((e) => e.id === Number(arg.event.id));
    if (ev) {
      setSelectedEvent(ev);
      setShowDetail(true);
    }
  };

  const handleSubmit = async () => {
    if (editing) {
      await eventosApi.update(editing.id, form);
    } else {
      await eventosApi.create(form);
    }
    setShowForm(false);
    loadEventos();
  };

  const changeEstado = async (id: number, estado: string) => {
    await eventosApi.changeEstado(id, estado);
    setShowDetail(false);
    loadEventos();
  };

  const calendarEvents = eventos.map((e) => ({
    id: String(e.id),
    title: `${e.clienteNombre} - ${e.tematicaNombre ?? e.tipoEvento}`,
    start: `${e.fechaEvento}T${e.horaInicio}`,
    end: e.horaFinEstimada ? `${e.fechaEvento}T${e.horaFinEstimada}` : undefined,
    backgroundColor: e.colorCalendario ?? '#3B82F6',
    borderColor: e.colorCalendario ?? '#3B82F6',
    textColor: '#fff',
  }));

  return (
    <div>
      <h2 style={{ margin: '0 0 16px', color: '#1e293b' }}>Cronograma</h2>
      <div style={{ backgroundColor: '#fff', borderRadius: '8px', padding: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin as never, interactionPlugin as never]}
          initialView="dayGridMonth"
          selectable
          editable
          events={calendarEvents}
          select={handleDateSelect}
          eventClick={handleEventClick}
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

      {showForm && (
        <div style={styles.modal}>
          <div style={{ ...styles.modalCard, maxWidth: '560px' }}>
            <h3>{editing ? 'Editar Evento' : 'Nuevo Evento'}</h3>

            <div style={{ marginBottom: '10px' }}>
              <label style={labelStyle}>Cliente</label>
              <select value={form.clienteId} onChange={(e) => setForm((p) => ({ ...p, clienteId: Number(e.target.value) }))} style={inputStyle}>
                <option value={0}>Seleccionar...</option>
                {clientes.map((c) => <option key={c.id} value={c.id}>{c.nombreCompleto}</option>)}
              </select>
            </div>
            <div style={{ marginBottom: '10px' }}>
              <label style={labelStyle}>Tipo Evento</label>
              <select value={form.tipoEvento} onChange={(e) => setForm((p) => ({ ...p, tipoEvento: e.target.value }))} style={inputStyle}>
                {TIPOS_EVENTO.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <div style={{ flex: 1, marginBottom: '10px' }}>
                <label style={labelStyle}>Nombre Cumpleanero</label>
                <input value={form.nombreCumpleanero} onChange={(e) => setForm((p) => ({ ...p, nombreCumpleanero: e.target.value }))} style={inputStyle} />
              </div>
              <div style={{ flex: 1, marginBottom: '10px' }}>
                <label style={labelStyle}>Edad</label>
                <input type="number" value={form.edadCumpleanero} onChange={(e) => setForm((p) => ({ ...p, edadCumpleanero: Number(e.target.value) }))} style={inputStyle} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <div style={{ flex: 1, marginBottom: '10px' }}>
                <label style={labelStyle}>Fecha</label>
                <input type="date" value={form.fechaEvento} onChange={(e) => setForm((p) => ({ ...p, fechaEvento: e.target.value }))} style={inputStyle} />
              </div>
              <div style={{ flex: 1, marginBottom: '10px' }}>
                <label style={labelStyle}>Hora Inicio</label>
                <input type="time" value={form.horaInicio} onChange={(e) => setForm((p) => ({ ...p, horaInicio: e.target.value + ':00' }))} style={inputStyle} />
              </div>
            </div>
            <div style={{ marginBottom: '10px' }}>
              <label style={labelStyle}>Hora Fin Estimada</label>
              <input type="time" value={form.horaFinEstimada} onChange={(e) => setForm((p) => ({ ...p, horaFinEstimada: e.target.value + ':00' }))} style={inputStyle} />
            </div>
            <div style={{ marginBottom: '10px' }}>
              <label style={labelStyle}>Referencia</label>
              <input value={form.referencia} onChange={(e) => setForm((p) => ({ ...p, referencia: e.target.value }))} style={inputStyle} />
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <div style={{ flex: 1, marginBottom: '10px' }}>
                <label style={labelStyle}>Aforo Estimado</label>
                <input type="number" value={form.aforoEstimado} onChange={(e) => setForm((p) => ({ ...p, aforoEstimado: Number(e.target.value) }))} style={inputStyle} />
              </div>
              <div style={{ flex: 1, marginBottom: '10px' }}>
                <label style={labelStyle}>Color</label>
                <select value={form.colorCalendario} onChange={(e) => setForm((p) => ({ ...p, colorCalendario: e.target.value }))} style={inputStyle}>
                  {COLORES_CALENDARIO.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div style={{ marginBottom: '10px' }}>
              <label style={labelStyle}>Notas Internas</label>
              <input value={form.notasInternas} onChange={(e) => setForm((p) => ({ ...p, notasInternas: e.target.value }))} style={inputStyle} />
            </div>

            <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
              <button onClick={handleSubmit} style={{ ...styles.addBtn, flex: 1 }}>Guardar</button>
              <button onClick={() => setShowForm(false)} style={cancelBtnStyle}>Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {showDetail && selectedEvent && (
        <div style={styles.modal}>
          <div style={{ ...styles.modalCard, maxWidth: '480px' }}>
            <h3>Detalle del Evento</h3>
            <p><strong>Cliente:</strong> {selectedEvent.clienteNombre}</p>
            <p><strong>Tipo:</strong> {selectedEvent.tipoEvento}</p>
            <p><strong>Fecha:</strong> {selectedEvent.fechaEvento} {selectedEvent.horaInicio}</p>
            <p><strong>Estado:</strong> {selectedEvent.estado}</p>
            <p><strong>Cumpleanero:</strong> {selectedEvent.nombreCumpleanero} ({selectedEvent.edadCumpleanero} anios)</p>

            <div style={{ marginTop: '12px' }}>
              <p style={{ fontWeight: 600, marginBottom: '8px' }}>Cambiar Estado</p>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {ESTADOS_EVENTO.filter((s) => s.value !== selectedEvent.estado).map((s) => (
                  <button key={s.value} onClick={() => changeEstado(selectedEvent.id, s.value)} style={{ ...styles.statusBtn, backgroundColor: s.color, color: '#fff' }}>
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            <button onClick={() => setShowDetail(false)} style={{ ...cancelBtnStyle, marginTop: '16px', width: '100%' }}>Cerrar</button>
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
  addBtn: { padding: '10px 18px', backgroundColor: '#3B82F6', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: 600 },
  modal: { position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100 },
  modalCard: { backgroundColor: '#fff', borderRadius: '12px', padding: '28px', width: '100%', maxHeight: '90vh', overflow: 'auto' },
  statusBtn: { padding: '6px 14px', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: 600 },
};
