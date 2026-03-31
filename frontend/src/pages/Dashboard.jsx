import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const Dashboard = () => {
    const navigate = useNavigate();
    const token = localStorage.getItem('token_reservas');
    const rol = localStorage.getItem('rol_usuario')?.toUpperCase();


    // ==========================================
    // 👤 ESTADOS Y FUNCIONES PARA EL CLIENTE (USER)
    // ==========================================
    const [horarios, setHorarios] = useState([]);
    const [misReservas, setMisReservas] = useState([]);

    const cargarHorarios = async () => {
        try {
            const respuesta = await fetch('http://localhost:3000/api/slots', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (respuesta.ok) setHorarios(await respuesta.json());
        } catch (error) {
            console.error('Error al cargar horarios', error);
        }
    };

    const cargarMisReservas = async () => {
        try {
            const respuesta = await fetch('http://localhost:3000/api/bookings/my', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (respuesta.ok) setMisReservas(await respuesta.json());
        } catch (error) {
            console.error('Error al cargar mis reservas', error);
        }
    };

    const manejarReserva = async (horarioId) => {
        try {
            const respuesta = await fetch('http://localhost:3000/api/bookings', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ slot_id: horarioId })
            });

            if (respuesta.ok) {
                toast.success('¡Reserva confirmada! 🎉');
                cargarHorarios();
                cargarMisReservas();
            } else {
                const data = await respuesta.json();
                toast.error(`Error: ${data.message}`);
            }
        } catch (error) {
            toast.error('Error al intentar reservar.');
        }
    };

    // ==========================================
    // 🛠️ ESTADOS Y FUNCIONES PARA EL ADMIN
    // ==========================================
    const [nuevoHorario, setNuevoHorario] = useState({ fecha: '', hora_inicio: '', hora_fin: '' });
    const [todasLasReservas, setTodasLasReservas] = useState([]);
    const [editandoId, setEditandoId] = useState(null); // Guarda el ID si estamos editando

    const manejarCrearHorario = async (e) => {
        e.preventDefault();
        if (nuevoHorario.hora_fin <= nuevoHorario.hora_inicio) {
            setMensaje({
                texto: '⚠️ Error: La hora de fin debe ser posterior a la hora de inicio.',
                tipo: 'alert-warning'
            });
            return;
        }

        // Si hay un editandoId, hacemos PUT (actualizar). Si no, POST (crear).
        const url = editandoId
            ? `http://localhost:3000/api/slots/${editandoId}`
            : 'http://localhost:3000/api/slots';
        const method = editandoId ? 'PUT' : 'POST';

        try {
            const respuesta = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(nuevoHorario)
            });

            if (respuesta.ok) {
                setMensaje({
                    texto: editandoId ? '✅ ¡Horario actualizado!' : '✅ ¡Horario creado!',
                    tipo: 'alert-success'
                });
                cancelarEdicion();
                cargarHorarios();
            } else {
                setMensaje({ texto: 'Error al procesar la solicitud.', tipo: 'alert-danger' });
            }
        } catch (error) {
            setMensaje({ texto: 'Error al conectar con el servidor.', tipo: 'alert-danger' });
        }
    };

    const iniciarEdicion = (horario) => {
        setEditandoId(horario.id);
        const fechaFormateada = new Date(horario.fecha).toISOString().split('T')[0];
        setNuevoHorario({
            fecha: fechaFormateada,
            hora_inicio: horario.hora_inicio,
            hora_fin: horario.hora_fin
        });
        window.scrollTo(0, 0);
    };

    const cancelarEdicion = () => {
        setEditandoId(null);
        setNuevoHorario({ fecha: '', hora_inicio: '', hora_fin: '' });
    };

    const eliminarHorario = async (id) => {
        if (!window.confirm('¿Estás seguro de que deseas eliminar este horario?')) return;

        try {
            const respuesta = await fetch(`http://localhost:3000/api/slots/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (respuesta.ok) {
                setMensaje({ texto: '🗑️ Horario eliminado correctamente.', tipo: 'alert-success' });
                cargarHorarios();
            } else {
                const data = await respuesta.json();
                setMensaje({ texto: `Error: ${data.message || 'No se pudo eliminar'}`, tipo: 'alert-danger' });
            }
        } catch (error) {
            setMensaje({ texto: 'Error al eliminar el horario.', tipo: 'alert-danger' });
        }
    };

    const cargarTodasLasReservas = async () => {
        try {
            const respuesta = await fetch('http://localhost:3000/api/bookings/admin/all', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (respuesta.ok) setTodasLasReservas(await respuesta.json());
        } catch (error) {
            console.error('Error al cargar todas las reservas', error);
        }
    };

    const cambiarEstadoReserva = async (reservaId, nuevoEstado) => {
        try {
            const respuesta = await fetch(`http://localhost:3000/api/bookings/admin/${reservaId}/status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ estado: nuevoEstado })
            });

            if (respuesta.ok) {
                setMensaje({ texto: `Reserva ${nuevoEstado} exitosamente.`, tipo: 'alert-success' });
                cargarTodasLasReservas();
            }
        } catch (error) {
            setMensaje({ texto: 'Error al cambiar el estado.', tipo: 'alert-danger' });
        }
    };

    // ==========================================
    // 🔄 EFECTOS COMPARTIDOS
    // ==========================================
    useEffect(() => {
        if (!token) {
            navigate('/login');
            return;
        }

        if (rol === 'USER') {
            cargarHorarios();
            cargarMisReservas();
        } else if (rol === 'ADMIN') {
            cargarHorarios(); // Admin también necesita ver la lista de horarios
            cargarTodasLasReservas();
        }
    }, [token, navigate, rol]);

    const cerrarSesion = () => {
        localStorage.removeItem('token_reservas');
        localStorage.removeItem('rol_usuario');
        navigate('/login');
    };

    // Calculamos la fecha de hoy usando la ZONA HORARIA LOCAL (Para evitar el salto de día por el UTC)
    const fechaLocal = new Date();
    const año = fechaLocal.getFullYear();
    const mes = String(fechaLocal.getMonth() + 1).padStart(2, '0'); // Se suma 1 porque los meses van de 0 a 11
    const dia = String(fechaLocal.getDate()).padStart(2, '0');
    const fechaHoy = `${año}-${mes}-${dia}`;

    // ==========================================
    // 🎨 RENDERIZADO CONDICIONAL (VISTAS)
    // ==========================================

    // 1️⃣ VISTA DE ADMINISTRADOR
    if (rol === 'ADMIN') {
        return (
            <div className="mt-4 mb-5">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h2 className="text-primary">🛠️ Panel de Administrador</h2>
                    <button onClick={cerrarSesion} className="btn btn-outline-danger">Cerrar Sesión</button>
                </div>

                {/* Formulario de Crear / Editar Horario */}
                <div className={`card shadow-sm mb-5 ${editandoId ? 'border-warning' : ''}`}>
                    <div className="card-body">
                        <h5 className="card-title mb-4">
                            {editandoId ? '✏️ Editar Horario' : 'Crear Nuevo Horario Disponible'}
                        </h5>
                        <form onSubmit={manejarCrearHorario} className="row g-3">
                            <div className="col-md-4">
                                <label className="form-label">Fecha</label>
                                <input
                                    type="date"
                                    className="form-control"
                                    value={nuevoHorario.fecha}
                                    min={fechaHoy}
                                    onChange={(e) => setNuevoHorario({ ...nuevoHorario, fecha: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="col-md-4">
                                <label className="form-label">Hora Inicio</label>
                                <input type="time" className="form-control" value={nuevoHorario.hora_inicio} onChange={(e) => setNuevoHorario({ ...nuevoHorario, hora_inicio: e.target.value })} required />
                            </div>
                            <div className="col-md-4">
                                <label className="form-label">Hora Fin</label>
                                <input type="time" className="form-control" value={nuevoHorario.hora_fin} onChange={(e) => setNuevoHorario({ ...nuevoHorario, hora_fin: e.target.value })} required />
                            </div>
                            <div className="col-12 text-end mt-4">
                                {editandoId && (
                                    <button type="button" onClick={cancelarEdicion} className="btn btn-secondary me-2">Cancelar</button>
                                )}
                                <button type="submit" className={`btn ${editandoId ? 'btn-warning' : 'btn-primary'}`}>
                                    {editandoId ? 'Guardar Cambios' : 'Guardar Horario'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                {/* Tabla de Gestión de Horarios para el Admin */}
                <h4 className="mb-3">🕒 Mis Horarios Creados</h4>
                <div className="card shadow-sm mb-5">
                    <div className="card-body p-0">
                        <div className="table-responsive">
                            <table className="table table-hover mb-0">
                                <thead className="table-light">
                                    <tr>
                                        <th>ID</th>
                                        <th>Fecha</th>
                                        <th>Inicio</th>
                                        <th>Fin</th>
                                        <th>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {horarios.length === 0 ? (
                                        <tr><td colSpan="5" className="text-center py-4 text-muted">No has creado horarios aún.</td></tr>
                                    ) : (
                                        horarios.map(horario => (
                                            <tr key={horario.id}>
                                                <td>{horario.id}</td>
                                                <td>{new Date(horario.fecha).toLocaleDateString()}</td>
                                                <td>{horario.hora_inicio}</td>
                                                <td>{horario.hora_fin}</td>
                                                <td>
                                                    <button onClick={() => iniciarEdicion(horario)} className="btn btn-sm btn-outline-primary me-2">Editar</button>
                                                    <button onClick={() => eliminarHorario(horario.id)} className="btn btn-sm btn-outline-danger">Eliminar</button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Tabla de Gestión de Reservas para el Admin */}
                <h4 className="mb-3">📋 Gestión de Reservas</h4>
                <div className="card shadow-sm">
                    <div className="card-body p-0">
                        <div className="table-responsive">
                            <table className="table table-hover mb-0">
                                <thead className="table-light">
                                    <tr>
                                        <th>Cliente</th>
                                        <th>Fecha</th>
                                        <th>Horario</th>
                                        <th>Estado</th>
                                        <th>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {todasLasReservas.length === 0 ? (
                                        <tr><td colSpan="5" className="text-center py-4 text-muted">No hay reservas en el sistema.</td></tr>
                                    ) : (
                                        todasLasReservas.map(res => (
                                            <tr key={res.reserva_id}>
                                                <td>
                                                    <strong>{res.cliente}</strong><br />
                                                    <small className="text-muted">{res.email}</small>
                                                </td>
                                                <td>{new Date(res.fecha).toLocaleDateString()}</td>
                                                <td>{res.hora_inicio} - {res.hora_fin}</td>
                                                <td>
                                                    <span className={`badge ${res.estado === 'pendiente' ? 'bg-warning' : res.estado === 'aprobado' ? 'bg-success' : 'bg-danger'}`}>
                                                        {res.estado.toUpperCase()}
                                                    </span>
                                                </td>
                                                <td>
                                                    {res.estado === 'pendiente' && (
                                                        <>
                                                            <button onClick={() => cambiarEstadoReserva(res.reserva_id, 'aprobado')} className="btn btn-sm btn-success me-2">Aprobar</button>
                                                            <button onClick={() => cambiarEstadoReserva(res.reserva_id, 'rechazado')} className="btn btn-sm btn-danger">Rechazar</button>
                                                        </>
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // 2️⃣ VISTA DE CLIENTE (USER)
    return (
        <div className="mt-4 mb-5">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="text-primary">📅 Reserva tu Cita</h2>
                <button onClick={cerrarSesion} className="btn btn-outline-danger">Cerrar Sesión</button>
            </div>

            {mensaje.texto && <div className={`alert ${mensaje.tipo}`}>{mensaje.texto}</div>}

            <h4 className="mb-3">Horarios Disponibles</h4>
            <div className="row mb-5">
                {horarios.length === 0 ? (
                    <div className="col-12 text-muted"><p>No hay horarios disponibles en este momento.</p></div>
                ) : (
                    horarios.map((horario) => (
                        <div key={horario.id} className="col-md-4 mb-3">
                            <div className="card shadow-sm border-primary">
                                <div className="card-body text-center">
                                    <h5 className="card-title text-primary">{new Date(horario.fecha).toLocaleDateString()}</h5>
                                    <p className="card-text fw-bold">⏰ {horario.hora_inicio} - {horario.hora_fin}</p>
                                    <button onClick={() => manejarReserva(horario.id)} className="btn btn-primary w-100">Reservar Ahora</button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <h4 className="mb-3">📝 Mis Reservas</h4>
            <div className="card shadow-sm">
                <div className="card-body p-0">
                    <div className="table-responsive">
                        <table className="table table-striped mb-0">
                            <thead className="table-light">
                                <tr>
                                    <th>Fecha</th>
                                    <th>Horario</th>
                                    <th>Estado</th>
                                </tr>
                            </thead>
                            <tbody>
                                {misReservas.length === 0 ? (
                                    <tr><td colSpan="3" className="text-center py-4 text-muted">Aún no tienes reservas.</td></tr>
                                ) : (
                                    misReservas.map(res => (
                                        <tr key={res.id}>
                                            <td>{new Date(res.fecha).toLocaleDateString()}</td>
                                            <td>{res.hora_inicio} - {res.hora_fin}</td>
                                            <td>
                                                <span className={`badge ${res.estado === 'pendiente' ? 'bg-warning text-dark' : res.estado === 'aprobado' ? 'bg-success' : 'bg-danger'}`}>
                                                    {res.estado.toUpperCase()}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;