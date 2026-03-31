const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

// 1️⃣ Controlador para Registrar Usuario
const register = async (req, res) => {
    try {
        const { nombre, email, password } = req.body;

        // Validar que vengan los datos (Básico, luego usaremos express-validator)
        if (!nombre || !email || !password) {
            return res.status(400).json({ message: 'Todos los campos son obligatorios' });
        }

        // Encriptar la contraseña (Salt de 10 rondas es el estándar seguro)
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        // Guardar en la base de datos usando consultas parametrizadas (?)
        const [result] = await db.execute(
            'INSERT INTO usuarios (nombre, email, password_hash) VALUES (?, ?, ?)',
            [nombre, email, passwordHash]
        );

        res.status(201).json({
            message: 'Usuario registrado exitosamente',
            userId: result.insertId
        });

    } catch (error) {
        // Error 1062 en MySQL significa "Entrada duplicada" (Email ya existe)
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ message: 'El correo electrónico ya está registrado' });
        }
        console.error(error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};

// 2️⃣ Controlador para Iniciar Sesión (Login)
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Email y contraseña son obligatorios' });
        }

        // Buscar al usuario por su email
        const [users] = await db.execute('SELECT * FROM usuarios WHERE email = ?', [email]);
        
        if (users.length === 0) {
            return res.status(401).json({ message: 'Credenciales inválidas' });
        }

        const user = users[0];

        // Verificar si el usuario está inactivo (borrado lógico)
        if (!user.activo) {
            return res.status(403).json({ message: 'Cuenta desactivada. Contacte al administrador.' });
        }

        // Comparar la contraseña que llegó con el hash de la base de datos
        const isMatch = await bcrypt.compare(password, user.password_hash);
        
        if (!isMatch) {
            return res.status(401).json({ message: 'Credenciales inválidas' });
        }

        // Generar el Token JWT usando las variables de entorno
        const token = jwt.sign(
            { id: user.id, rol: user.rol }, // Payload (Datos útiles)
            process.env.JWT_SECRET,         // Firma secreta
            { expiresIn: process.env.JWT_EXPIRES_IN } // Tiempo de vida
        );

        // Devolver el token y datos básicos (NUNCA devolver el password_hash)
        res.status(200).json({
            message: 'Login exitoso',
            token,
            rol: user.rol,
            user: {
                id: user.id,
                nombre: user.nombre,
                email: user.email,
                rol: user.rol
            }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};

module.exports = { register, login };