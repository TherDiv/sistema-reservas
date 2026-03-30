const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    try {
        // 1. Obtener el header de autorización
        const authHeader = req.headers.authorization;

        // 2. Verificar si el header existe y si tiene el formato correcto "Bearer <token>"
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'Acceso denegado. Token no proporcionado o formato inválido.' });
        }

        // 3. Extraer solo el token (quitando la palabra "Bearer ")
        const token = authHeader.split(' ')[1];

        // 4. Verificar la firma y caducidad del token usando nuestra clave secreta
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // 5. Inyectar los datos del usuario decodificados (id, rol) en la petición actual
        req.user = decoded;

        // 6. Darle permiso para continuar al siguiente paso (el controlador)
        next();

    } catch (error) {
        // Si el token expiró o fue modificado maliciosamente, caerá aquí
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'El token ha expirado. Por favor, inicie sesión nuevamente.' });
        }
        return res.status(401).json({ message: 'Token inválido.' });
    }
};

module.exports = { verifyToken };