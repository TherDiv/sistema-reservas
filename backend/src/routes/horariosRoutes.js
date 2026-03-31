const express = require('express');
const router = express.Router();
const { createSlot, getAvailableSlots, updateSlot, deleteSlot } = require('../controllers/horariosController');
const { verifyToken } = require('../middleware/authMiddleware');
const { authorizeRole } = require('../middleware/roleMiddleware');

/**
 * @swagger
 * /api/slots:
 *   get:
 *     summary: Obtener todos los horarios disponibles
 *     tags: [Horarios]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de horarios obtenida con éxito
 *       401:
 *         description: No autorizado (Token faltante o inválido)
 */
router.get('/', verifyToken, getAvailableSlots);

/**
 * @swagger
 * /api/slots:
 *   post:
 *     summary: Crear un nuevo horario (solo ADMIN)
 *     tags: [Horarios]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - fecha
 *               - hora_inicio
 *               - hora_fin
 *             properties:
 *               fecha:
 *                 type: string
 *                 example: "2026-04-15"
 *               hora_inicio:
 *                 type: string
 *                 example: "09:00:00"
 *               hora_fin:
 *                 type: string
 *                 example: "10:00:00"
 *     responses:
 *       201:
 *         description: Horario creado exitosamente
 *       401:
 *         description: No autorizado (Token faltante o inválido)
 *       403:
 *         description: Prohibido (No tienes rol de ADMIN)
 */
router.post('/', verifyToken, authorizeRole('ADMIN'), createSlot);

/**
 * @swagger
 * /api/slots/{id}:
 *   put:
 *     summary: Actualizar un horario existente (solo ADMIN)
 *     tags: [Horarios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del horario a actualizar
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - fecha
 *               - hora_inicio
 *               - hora_fin
 *             properties:
 *               fecha:
 *                 type: string
 *                 example: "2026-04-16"
 *               hora_inicio:
 *                 type: string
 *                 example: "10:00:00"
 *               hora_fin:
 *                 type: string
 *                 example: "11:00:00"
 *     responses:
 *       200:
 *         description: Horario actualizado correctamente
 *       400:
 *         description: Datos inválidos
 *       404:
 *         description: Horario no encontrado
 *       409:
 *         description: Conflicto (El horario ya existe)
 */
router.put('/:id', verifyToken, authorizeRole('ADMIN'), updateSlot);

/**
 * @swagger
 * /api/slots/{id}:
 *   delete:
 *     summary: Eliminar un horario existente (solo ADMIN)
 *     tags: [Horarios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del horario a eliminar
 *     responses:
 *       200:
 *         description: Horario eliminado correctamente
 *       400:
 *         description: No se puede eliminar (ya tiene reservas)
 *       404:
 *         description: Horario no encontrado
 */
router.delete('/:id', verifyToken, authorizeRole('ADMIN'), deleteSlot);

module.exports = router;