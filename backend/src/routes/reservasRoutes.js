const express = require('express');
const router = express.Router();
const { createBooking, getMyBookings, getAllBookings, updateBookingStatus } = require('../controllers/reservasController');
const { verifyToken } = require('../middleware/authMiddleware');
const { authorizeRole } = require('../middleware/roleMiddleware');

/**
 * @swagger
 * /api/bookings/my:
 *   get:
 *     summary: Obtener las reservas del usuario autenticado
 *     tags: [Reservas]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de reservas del usuario
 *       401:
 *         description: No autorizado
 */
router.get('/my', verifyToken, getMyBookings);

/**
 * @swagger
 * /api/bookings:
 *   post:
 *     summary: Crear una nueva reserva
 *     tags: [Reservas]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - slot_id
 *             properties:
 *               slot_id:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       201:
 *         description: Reserva creada exitosamente
 *       400:
 *         description: El horario no está disponible o no existe
 *       401:
 *         description: No autorizado
 */
router.post('/', verifyToken, createBooking);

/**
 * @swagger
 * /api/bookings/admin/all:
 *   get:
 *     summary: Obtener todas las reservas del sistema (Solo ADMIN)
 *     tags: [Reservas (Admin)]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de todas las reservas
 *       403:
 *         description: Prohibido, se requiere rol de ADMIN
 */
router.get('/admin/all', verifyToken, authorizeRole('ADMIN'), getAllBookings);

/**
 * @swagger
 * /api/bookings/admin/{id}/status:
 *   patch:
 *     summary: Actualizar el estado de una reserva (Solo ADMIN)
 *     tags: [Reservas (Admin)]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la reserva
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - estado
 *             properties:
 *               estado:
 *                 type: string
 *                 enum: [pendiente, confirmada, cancelada]
 *                 example: confirmada
 *     responses:
 *       200:
 *         description: Estado de la reserva actualizado
 *       403:
 *         description: Prohibido, se requiere rol de ADMIN
 *       404:
 *         description: Reserva no encontrada
 */
router.patch('/admin/:id/status', verifyToken, authorizeRole('ADMIN'), updateBookingStatus);

module.exports = router;