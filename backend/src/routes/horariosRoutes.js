const express = require('express');
const router = express.Router();
const { createSlot, getAvailableSlots } = require('../controllers/horariosController');

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

module.exports = router;