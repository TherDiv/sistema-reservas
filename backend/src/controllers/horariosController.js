const db = require('../config/db');

// 1️⃣ Crear un nuevo horario (SOLO ADMIN)
const createSlot = async (req, res) => {
    try {
        const { fecha, hora_inicio, hora_fin } = req.body;

        if (!fecha || !hora_inicio || !hora_fin) {
            return res.status(400).json({ message: 'Fecha, hora de inicio y hora de fin son obligatorios' });
        }

        const [result] = await db.execute(
            'INSERT INTO horarios_disponibles (fecha, hora_inicio, hora_fin) VALUES (?, ?, ?)',
            [fecha, hora_inicio, hora_fin]
        );

        res.status(201).json({
            message: 'Horario creado exitosamente',
            slotId: result.insertId
        });

    } catch (error) {
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

// 3️⃣ NUEVO: Actualizar un horario existente (Editar)
const updateSlot = async (req, res) => {
    try {
        const { id } = req.params; // Sacamos el ID de la URL
        const { fecha, hora_inicio, hora_fin } = req.body;

        if (!fecha || !hora_inicio || !hora_fin) {
            return res.status(400).json({ message: 'Todos los campos son obligatorios' });
        }

        const [result] = await db.execute(
            'UPDATE horarios_disponibles SET fecha = ?, hora_inicio = ?, hora_fin = ? WHERE id = ?',
            [fecha, hora_inicio, hora_fin, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Horario no encontrado' });
        }

        res.status(200).json({ message: 'Horario actualizado correctamente' });

    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ message: 'Este bloque de horario ya existe.' });
        }
        console.error(error);
        res.status(500).json({ message: 'Error al actualizar el horario' });
    }
};

// 4️⃣ NUEVO: Eliminar un horario
const deleteSlot = async (req, res) => {
    try {
        const { id } = req.params;

        const [result] = await db.execute('DELETE FROM horarios_disponibles WHERE id = ?', [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Horario no encontrado' });
        }

        res.status(200).json({ message: 'Horario eliminado correctamente' });

    } catch (error) {
        // Si intentamos borrar un horario que ya tiene una reserva, MySQL dará un error de Clave Foránea (ER_ROW_IS_REFERENCED_2)
        if (error.code === 'ER_ROW_IS_REFERENCED_2') {
            return res.status(400).json({ message: 'No se puede eliminar este horario porque ya tiene reservas de clientes.' });
        }
        console.error(error);
        res.status(500).json({ message: 'Error al eliminar el horario' });
    }
};

// 👇 No olvides exportar las nuevas funciones
module.exports = { createSlot, getAvailableSlots, updateSlot, deleteSlot };