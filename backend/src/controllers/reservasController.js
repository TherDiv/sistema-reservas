const db = require('../config/db');

// 1️⃣ Crear una reserva (Rol: USER)
const createBooking = async (req, res) => {
    try {
        const { horario_id, comentario } = req.body;
        const usuario_id = req.user.id; // ¡Gracias a nuestro middleware verifyToken!

        if (!horario_id) {
            return res.status(400).json({ message: 'El ID del horario es obligatorio' });
        }

        // 🛑 VALIDACIÓN ESTRELLA (Nivel Profesional): Evitar doble reserva
        // Buscamos si ya existe una reserva para este horario que NO esté cancelada ni rechazada
        const [existingBookings] = await db.execute(
            `SELECT * FROM reservas 
             WHERE horario_id = ? AND estado IN ('pendiente', 'aprobado')`,
            [horario_id]
        );

        if (existingBookings.length > 0) {
            return res.status(409).json({ message: 'Este horario ya ha sido reservado por otro usuario.' });
        }

        // Si está libre, creamos la reserva con estado inicial 'pendiente'
        const [result] = await db.execute(
            `INSERT INTO reservas (usuario_id, horario_id, estado, comentario) 
             VALUES (?, ?, 'pendiente', ?)`,
            [usuario_id, horario_id, comentario || '']
        );

        res.status(201).json({
            message: 'Reserva creada exitosamente y está pendiente de aprobación.',
            bookingId: result.insertId
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error interno del servidor al crear la reserva' });
    }
};

// 2️⃣ Ver mis reservas (Rol: USER)
const getMyBookings = async (req, res) => {
    try {
        const usuario_id = req.user.id;

        // Hacemos un JOIN con horarios_disponibles para devolverle la fecha y hora al usuario
        const [bookings] = await db.execute(
            `SELECT r.id, r.estado, r.comentario, r.created_at, 
                    h.fecha, h.hora_inicio, h.hora_fin 
             FROM reservas r
             JOIN horarios_disponibles h ON r.horario_id = h.id
             WHERE r.usuario_id = ?
             ORDER BY h.fecha ASC`,
            [usuario_id]
        );

        res.status(200).json(bookings);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener tus reservas' });
    }
};

const getAllBookings = async (req, res) => {
    try {
        // Hacemos un JOIN triple para traer los datos de la reserva, del usuario y del horario
        const [bookings] = await db.execute(
            `SELECT r.id AS reserva_id, r.estado, r.comentario, r.created_at,
                    u.nombre AS cliente, u.email,
                    h.fecha, h.hora_inicio, h.hora_fin
             FROM reservas r
             JOIN usuarios u ON r.usuario_id = u.id
             JOIN horarios_disponibles h ON r.horario_id = h.id
             ORDER BY h.fecha ASC, h.hora_inicio ASC`
        );

        res.status(200).json(bookings);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener todas las reservas' });
    }
};

// 4️⃣ Cambiar el estado de una reserva (SOLO ADMIN)
const updateBookingStatus = async (req, res) => {
    try {
        const { id } = req.params; // El ID de la reserva viene en la URL
        const { estado } = req.body; // El nuevo estado viene en el body (JSON)

        // Validar que el estado sea uno de los permitidos
        const estadosPermitidos = ['pendiente', 'aprobado', 'rechazado', 'cancelado'];
        if (!estadosPermitidos.includes(estado)) {
            return res.status(400).json({ message: 'Estado no válido' });
        }

        // Actualizar el estado en la base de datos
        const [result] = await db.execute(
            'UPDATE reservas SET estado = ? WHERE id = ?',
            [estado, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Reserva no encontrada' });
        }

        res.status(200).json({ message: `Reserva actualizada al estado: ${estado}` });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al actualizar el estado de la reserva' });
    }
};

// 🛑 ¡IMPORTANTE! No olvides exportar las nuevas funciones:
module.exports = { createBooking, getMyBookings, getAllBookings, updateBookingStatus };