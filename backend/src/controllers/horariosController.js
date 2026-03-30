const db = require('../config/db');

// 1️⃣ Crear un nuevo horario (SOLO ADMIN)
const createSlot = async (req, res) => {
    try {
        const { fecha, hora_inicio, hora_fin } = req.body;

        // Validación básica
        if (!fecha || !hora_inicio || !hora_fin) {
            return res.status(400).json({ message: 'Fecha, hora de inicio y hora de fin son obligatorios' });
        }

        // Insertar en la base de datos
        const [result] = await db.execute(
            'INSERT INTO horarios_disponibles (fecha, hora_inicio, hora_fin) VALUES (?, ?, ?)',
            [fecha, hora_inicio, hora_fin]
        );

        res.status(201).json({
            message: 'Horario creado exitosamente',
            slotId: result.insertId
        });

    } catch (error) {
        // ¿Recuerdas el UNIQUE KEY que pusimos en el script SQL? Aquí nos salva de horarios duplicados.
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ message: 'Este bloque de horario ya existe para esta fecha.' });
        }
        console.error(error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};

// 2️⃣ Obtener horarios disponibles (USER y ADMIN)
const getAvailableSlots = async (req, res) => {
    try {
        // 👇 AQUÍ ESTÁ LA MAGIA: 
        // Cruzamos horarios_disponibles (hd) con reservas (r).
        // Traemos solo los horarios donde NO existe una reserva (r.id IS NULL).
        const query = `
            SELECT hd.* FROM horarios_disponibles hd
            LEFT JOIN reservas r ON hd.id = r.horario_id
            WHERE r.id IS NULL AND hd.disponible = TRUE 
            ORDER BY hd.fecha ASC, hd.hora_inicio ASC
        `;

        const [slots] = await db.execute(query);

        res.status(200).json(slots);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener los horarios' });
    }
};

module.exports = { createSlot, getAvailableSlots };