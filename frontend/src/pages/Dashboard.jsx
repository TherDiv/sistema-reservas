import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const Dashboard = () => {
    const navigate = useNavigate();
    const token = localStorage.getItem('token_reservas');
    const rol = localStorage.getItem('rol_usuario')?.toUpperCase();

    const [horarios, setHorarios] = useState([]);
    const [misReservas, setMisReservas] = useState([]);
    const [nuevoHorario, setNuevoHorario] = useState({ fecha: '', hora_inicio: '', hora_fin: '' });
    const [todasLasReservas, setTodasLasReservas] = useState([]);
    const [editandoId, setEditandoId] = useState(null);

    const cargarHorarios = async () => {
        try {
            const r = await fetch('http://localhost:3000/api/slots', { headers: { 'Authorization': `Bearer ${token}` } });
            if (r.ok) setHorarios(await r.json());
        } catch { /* silent */ }
    };

    const cargarMisReservas = async () => {
        try {
            const r = await fetch('http://localhost:3000/api/bookings/my', { headers: { 'Authorization': `Bearer ${token}` } });
            if (r.ok) setMisReservas(await r.json());
        } catch { /* silent */ }
    };

    const manejarReserva = async (horarioId) => {
        try {
            const r = await fetch('http://localhost:3000/api/bookings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ slot_id: horarioId })
            });
            if (r.ok) { toast.success('Reserva confirmada'); cargarHorarios(); cargarMisReservas(); }
            else { const d = await r.json(); toast.error(d.message || 'No se pudo reservar'); }
        } catch { toast.error('Error al intentar reservar'); }
    };

    const manejarCrearHorario = async (e) => {
        e.preventDefault();
        if (nuevoHorario.hora_fin <= nuevoHorario.hora_inicio) { toast.error('La hora de fin debe ser posterior al inicio'); return; }
        const url = editandoId ? `http://localhost:3000/api/slots/${editandoId}` : 'http://localhost:3000/api/slots';
        try {
            const r = await fetch(url, {
                method: editandoId ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(nuevoHorario)
            });
            if (r.ok) { toast.success(editandoId ? 'Horario actualizado' : 'Horario creado'); cancelarEdicion(); cargarHorarios(); }
            else toast.error('Error al procesar la solicitud');
        } catch { toast.error('Error al conectar con el servidor'); }
    };

    const iniciarEdicion = (h) => {
        setEditandoId(h.id);
        setNuevoHorario({ fecha: new Date(h.fecha).toISOString().split('T')[0], hora_inicio: h.hora_inicio, hora_fin: h.hora_fin });
        window.scrollTo(0, 0);
    };

    const cancelarEdicion = () => { setEditandoId(null); setNuevoHorario({ fecha: '', hora_inicio: '', hora_fin: '' }); };

    const eliminarHorario = async (id) => {
        if (!window.confirm('¿Confirmas eliminar este horario?')) return;
        try {
            const r = await fetch(`http://localhost:3000/api/slots/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
            if (r.ok) { toast.success('Horario eliminado'); cargarHorarios(); }
            else { const d = await r.json(); toast.error(d.message || 'No se pudo eliminar'); }
        } catch { toast.error('Error al eliminar'); }
    };

    const cargarTodasLasReservas = async () => {
        try {
            const r = await fetch('http://localhost:3000/api/bookings/admin/all', { headers: { 'Authorization': `Bearer ${token}` } });
            if (r.ok) setTodasLasReservas(await r.json());
        } catch { /* silent */ }
    };

    const cambiarEstadoReserva = async (reservaId, nuevoEstado) => {
        try {
            const r = await fetch(`http://localhost:3000/api/bookings/admin/${reservaId}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ estado: nuevoEstado })
            });
            if (r.ok) { toast.success(`Reserva ${nuevoEstado}`); cargarTodasLasReservas(); }
        } catch { toast.error('Error al cambiar el estado'); }
    };

    useEffect(() => {
        if (!token) { navigate('/login'); return; }
        if (rol === 'USER') { cargarHorarios(); cargarMisReservas(); }
        else if (rol === 'ADMIN') { cargarHorarios(); cargarTodasLasReservas(); }
    }, []);

    const cerrarSesion = () => {
        localStorage.removeItem('token_reservas');
        localStorage.removeItem('rol_usuario');
        navigate('/login');
    };

    const fechaLocal = new Date();
    const fechaHoy = `${fechaLocal.getFullYear()}-${String(fechaLocal.getMonth() + 1).padStart(2, '0')}-${String(fechaLocal.getDate()).padStart(2, '0')}`;

    const Badge = ({ estado }) => {
        const map = {
            pendiente: { bg: '#fef3c7', color: '#92400e' },
            aprobado: { bg: '#d1fae5', color: '#065f46' },
            confirmada: { bg: '#d1fae5', color: '#065f46' },
            rechazado: { bg: '#fee2e2', color: '#991b1b' },
            cancelada: { bg: '#fee2e2', color: '#991b1b' },
        };
        const s = map[estado] || { bg: '#f3f4f6', color: '#374151' };
        return (
            <span style={{ background: s.bg, color: s.color, padding: '3px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '500' }}>
                {estado.charAt(0).toUpperCase() + estado.slice(1)}
            </span>
        );
    };

    const css = `
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500&display=swap');
        * { box-sizing: border-box; }
        .db { font-family: 'DM Sans', sans-serif; background: #f7f7f7; min-height: 100vh; }
        .db-bar { background: #fff; border-bottom: 1px solid #ebebeb; padding: 0 40px; height: 60px; display: flex; align-items: center; justify-content: space-between; position: sticky; top: 0; z-index: 10; }
        .db-logo { display: flex; align-items: center; gap: 8px; }
        .db-dot { width: 7px; height: 7px; background: #0f0f0f; border-radius: 50%; }
        .db-name { font-size: 14px; font-weight: 500; color: #0f0f0f; letter-spacing: 0.04em; text-transform: uppercase; }
        .db-role { font-size: 12px; color: #bbb; letter-spacing: 0.06em; text-transform: uppercase; }
        .db-logout { font-size: 13px; color: #888; background: none; border: 1px solid #e0e0e0; padding: 7px 16px; border-radius: 6px; cursor: pointer; font-family: 'DM Sans', sans-serif; transition: all 0.15s; }
        .db-logout:hover { border-color: #0f0f0f; color: #0f0f0f; }
        .db-main { max-width: 1100px; margin: 0 auto; padding: 40px 40px 80px; }
        .db-h1 { font-size: 24px; font-weight: 500; color: #0f0f0f; letter-spacing: -0.02em; margin: 0 0 36px 0; }
        .db-label { font-size: 11px; font-weight: 500; letter-spacing: 0.08em; text-transform: uppercase; color: #999; margin: 0 0 14px 0; }
        .db-card { background: #fff; border: 1px solid #ebebeb; border-radius: 10px; margin-bottom: 32px; overflow: hidden; }
        .db-card-pad { padding: 24px; }
        .db-grid3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; }
        .db-fl { display: flex; flex-direction: column; }
        .db-fl label { font-size: 11px; font-weight: 500; letter-spacing: 0.08em; text-transform: uppercase; color: #555; margin-bottom: 7px; }
        .db-in { width: 100%; padding: 10px 14px; border: 1.5px solid #e8e8e8; border-radius: 6px; font-size: 14px; font-family: 'DM Sans', sans-serif; color: #0f0f0f; background: #fafafa; outline: none; transition: border-color 0.15s, background 0.15s; }
        .db-in:focus { border-color: #0f0f0f; background: #fff; }
        .db-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 20px; }
        .db-btn { padding: 10px 22px; border: none; border-radius: 6px; font-size: 13px; font-weight: 500; font-family: 'DM Sans', sans-serif; cursor: pointer; transition: background 0.15s; }
        .db-btn-dark { background: #0f0f0f; color: #fff; }
        .db-btn-dark:hover { background: #2a2a2a; }
        .db-btn-ghost { background: #fff; color: #555; border: 1px solid #e0e0e0; }
        .db-btn-ghost:hover { border-color: #aaa; color: #0f0f0f; }
        .db-tbl { width: 100%; border-collapse: collapse; }
        .db-tbl th { font-size: 11px; font-weight: 500; letter-spacing: 0.07em; text-transform: uppercase; color: #999; padding: 12px 20px; text-align: left; border-bottom: 1px solid #f0f0f0; }
        .db-tbl td { font-size: 14px; color: #333; padding: 14px 20px; border-bottom: 1px solid #f7f7f7; vertical-align: middle; }
        .db-tbl tr:last-child td { border-bottom: none; }
        .db-tbl tr:hover td { background: #fafafa; }
        .db-empty { font-size: 13px; color: #ccc; text-align: center; padding: 40px 20px; }
        .db-slots { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 14px; margin-bottom: 32px; }
        .db-slot { background: #fff; border: 1.5px solid #ebebeb; border-radius: 10px; padding: 18px; transition: border-color 0.15s, box-shadow 0.15s; }
        .db-slot:hover { border-color: #0f0f0f; box-shadow: 0 4px 16px rgba(0,0,0,0.06); }
        .db-slot-d { font-size: 12px; color: #aaa; margin: 0 0 4px 0; text-transform: capitalize; }
        .db-slot-t { font-size: 17px; font-weight: 500; color: #0f0f0f; margin: 0 0 16px 0; }
        .db-slot-cta { width: 100%; padding: 9px; background: #0f0f0f; color: #fff; border: none; border-radius: 6px; font-size: 13px; font-weight: 500; font-family: 'DM Sans', sans-serif; cursor: pointer; transition: background 0.15s; }
        .db-slot-cta:hover { background: #2a2a2a; }
        .ab { font-size: 12px; font-family: 'DM Sans', sans-serif; padding: 5px 12px; border-radius: 5px; cursor: pointer; border: 1px solid; transition: all 0.15s; }
        .ab-edit { background: #fff; color: #0f0f0f; border-color: #d0d0d0; }
        .ab-edit:hover { border-color: #0f0f0f; }
        .ab-del { background: #fff; color: #c0392b; border-color: #f5c6c6; margin-left: 6px; }
        .ab-del:hover { background: #fdf2f2; }
        .ab-ok { background: #065f46; color: #fff; border-color: transparent; }
        .ab-ok:hover { background: #047857; }
        .ab-no { background: #fff; color: #c0392b; border-color: #f5c6c6; margin-left: 6px; }
        .ab-no:hover { background: #fdf2f2; }
        .edit-banner { background: #fffbeb; border: 1px solid #fde68a; border-radius: 6px; padding: 10px 16px; margin-bottom: 16px; font-size: 13px; color: #92400e; }
        @media (max-width: 700px) {
            .db-grid3 { grid-template-columns: 1fr; }
            .db-bar { padding: 0 20px; }
            .db-main { padding: 24px 20px 60px; }
        }
    `;

    if (rol === 'ADMIN') return (
        <>
            <style>{css}</style>
            <div className="db">
                <div className="db-bar">
                    <div className="db-logo"><div className="db-dot"></div><span className="db-name">Reserva tu reunión</span></div>
                    <span className="db-role">Administrador</span>
                    <button className="db-logout" onClick={cerrarSesion}>Cerrar sesión</button>
                </div>
                <div className="db-main">
                    <h1 className="db-h1">Panel de administrador</h1>

                    <p className="db-label">{editandoId ? `Editando horario #${editandoId}` : 'Nuevo horario'}</p>
                    <div className="db-card" style={editandoId ? { borderColor: '#fde68a' } : {}}>
                        <div className="db-card-pad">
                            {editandoId && <div className="edit-banner">Modificando horario existente — los cambios se guardarán al confirmar</div>}
                            <form onSubmit={manejarCrearHorario}>
                                <div className="db-grid3">
                                    <div className="db-fl"><label>Fecha</label><input type="date" className="db-in" value={nuevoHorario.fecha} min={fechaHoy} onChange={e => setNuevoHorario({ ...nuevoHorario, fecha: e.target.value })} required /></div>
                                    <div className="db-fl"><label>Hora inicio</label><input type="time" className="db-in" value={nuevoHorario.hora_inicio} onChange={e => setNuevoHorario({ ...nuevoHorario, hora_inicio: e.target.value })} required /></div>
                                    <div className="db-fl"><label>Hora fin</label><input type="time" className="db-in" value={nuevoHorario.hora_fin} onChange={e => setNuevoHorario({ ...nuevoHorario, hora_fin: e.target.value })} required /></div>
                                </div>
                                <div className="db-actions">
                                    {editandoId && <button type="button" className="db-btn db-btn-ghost" onClick={cancelarEdicion}>Cancelar</button>}
                                    <button type="submit" className="db-btn db-btn-dark">{editandoId ? 'Guardar cambios' : 'Guardar horario'}</button>
                                </div>
                            </form>
                        </div>
                    </div>

                    <p className="db-label">Horarios creados</p>
                    <div className="db-card">
                        <table className="db-tbl">
                            <thead><tr><th>ID</th><th>Fecha</th><th>Inicio</th><th>Fin</th><th>Acciones</th></tr></thead>
                            <tbody>
                                {horarios.length === 0
                                    ? <tr><td colSpan="5" className="db-empty">No hay horarios creados.</td></tr>
                                    : horarios.map(h => (
                                        <tr key={h.id}>
                                            <td style={{ color: '#bbb', fontSize: '13px' }}>#{h.id}</td>
                                            <td>{new Date(h.fecha).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                                            <td>{h.hora_inicio}</td>
                                            <td>{h.hora_fin}</td>
                                            <td>
                                                <button className="ab ab-edit" onClick={() => iniciarEdicion(h)}>Editar</button>
                                                <button className="ab ab-del" onClick={() => eliminarHorario(h.id)}>Eliminar</button>
                                            </td>
                                        </tr>
                                    ))
                                }
                            </tbody>
                        </table>
                    </div>

                    <p className="db-label">Gestión de reservas</p>
                    <div className="db-card">
                        <table className="db-tbl">
                            <thead><tr><th>Cliente</th><th>Fecha</th><th>Horario</th><th>Estado</th><th>Acciones</th></tr></thead>
                            <tbody>
                                {todasLasReservas.length === 0
                                    ? <tr><td colSpan="5" className="db-empty">No hay reservas en el sistema.</td></tr>
                                    : todasLasReservas.map(res => (
                                        <tr key={res.reserva_id}>
                                            <td>
                                                <div style={{ fontWeight: '500' }}>{res.cliente}</div>
                                                <div style={{ fontSize: '12px', color: '#aaa' }}>{res.email}</div>
                                            </td>
                                            <td>{new Date(res.fecha).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                                            <td>{res.hora_inicio} – {res.hora_fin}</td>
                                            <td><Badge estado={res.estado} /></td>
                                            <td>
                                                {res.estado === 'pendiente' && <>
                                                    <button className="ab ab-ok" onClick={() => cambiarEstadoReserva(res.reserva_id, 'aprobado')}>Aprobar</button>
                                                    <button className="ab ab-no" onClick={() => cambiarEstadoReserva(res.reserva_id, 'rechazado')}>Rechazar</button>
                                                </>}
                                            </td>
                                        </tr>
                                    ))
                                }
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </>
    );

    return (
        <>
            <style>{css}</style>
            <div className="db">
                <div className="db-bar">
                    <div className="db-logo"><div className="db-dot"></div><span className="db-name">Reserva tu reunión</span></div>
                    <span className="db-role">Mi cuenta</span>
                    <button className="db-logout" onClick={cerrarSesion}>Cerrar sesión</button>
                </div>
                <div className="db-main">
                    <h1 className="db-h1">Reservar una reunión</h1>

                    <p className="db-label">Horarios disponibles</p>
                    {horarios.length === 0
                        ? <div className="db-card"><p className="db-empty">No hay horarios disponibles en este momento.</p></div>
                        : <div className="db-slots">
                            {horarios.map(h => (
                                <div key={h.id} className="db-slot">
                                    <p className="db-slot-d">{new Date(h.fecha).toLocaleDateString('es-PE', { weekday: 'long', day: '2-digit', month: 'long' })}</p>
                                    <p className="db-slot-t">{h.hora_inicio} – {h.hora_fin}</p>
                                    <button className="db-slot-cta" onClick={() => manejarReserva(h.id)}>Reservar</button>
                                </div>
                            ))}
                        </div>
                    }

                    <p className="db-label">Mis reservas</p>
                    <div className="db-card">
                        <table className="db-tbl">
                            <thead><tr><th>Fecha</th><th>Horario</th><th>Estado</th></tr></thead>
                            <tbody>
                                {misReservas.length === 0
                                    ? <tr><td colSpan="3" className="db-empty">Aún no tienes reservas.</td></tr>
                                    : misReservas.map(res => (
                                        <tr key={res.id}>
                                            <td>{new Date(res.fecha).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                                            <td>{res.hora_inicio} – {res.hora_fin}</td>
                                            <td><Badge estado={res.estado} /></td>
                                        </tr>
                                    ))
                                }
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Dashboard;