const errorHandler = (err, req, res, next) => {
    // 1. Imprimimos el error en la terminal para que el desarrollador (tú) lo vea
    console.error('🔥 ERROR DETECTADO:', err.message);
    console.error(err.stack); // Muestra exactamente en qué línea de código falló

    // 2. Determinamos el código de estado (Si el error no trae uno, asumimos 500 - Error Interno)
    const statusCode = err.statusCode || 500;

    // 3. Le enviamos una respuesta limpia y segura al Frontend
    res.status(statusCode).json({
        success: false,
        message: statusCode === 500 ? 'Error interno del servidor' : err.message,
        // (Opcional) En producción no deberías enviar el stack, pero en desarrollo es útil
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined 
    });
};

module.exports = errorHandler;