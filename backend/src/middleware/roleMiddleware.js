// Recibe como parámetro el rol permitido (ej. "ADMIN")
const authorizeRole = (rolPermitido) => {
    
    // Retorna una función middleware
    return (req, res, next) => {
        
        // Verificamos que el req.user exista (gracias al verifyToken anterior)
        if (!req.user) {
            return res.status(500).json({ message: 'Error de servidor: No se verificó el token antes del rol.' });
        }

        // Comparamos el rol del usuario con el rol exigido para esta ruta
        if (req.user.rol !== rolPermitido) {
            return res.status(403).json({ 
                message: 'Acceso denegado. No tienes los permisos suficientes (Se requiere rol: ' + rolPermitido + ').' 
            });
        }

        // Si es el rol correcto, lo dejamos pasar
        next();
    };
};

module.exports = { authorizeRole };