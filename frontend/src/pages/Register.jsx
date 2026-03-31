import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const Register = () => {
    // Usamos un solo estado para manejar todo el formulario
    const [formData, setFormData] = useState({
        nombre: '',
        email: '',
        password: ''
    });
    const [mensaje, setMensaje] = useState({ texto: '', tipo: '' });
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const manejarRegistro = async (e) => {
        e.preventDefault();
        setMensaje({ texto: 'Creando cuenta...', tipo: 'text-primary' });

        try {
            // Asegúrate de que esta URL coincida con la ruta de tu backend
            const respuesta = await fetch('http://localhost:3000/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await respuesta.json();

            if (respuesta.ok) {
                setMensaje({ texto: '¡Registro exitoso! Redirigiendo al login...', tipo: 'text-success' });
                // Esperamos 2 segundos y lo mandamos a iniciar sesión
                setTimeout(() => navigate('/login'), 2000);
            } else {
                setMensaje({ texto: `Error: ${data.message}`, tipo: 'text-danger' });
            }
        } catch (error) {
            setMensaje({ texto: 'Error de conexión con el servidor.', tipo: 'text-danger' });
        }
    };

    return (
        <div className="row justify-content-center mt-5">
            <div className="col-md-5">
                <div className="card shadow-sm">
                    <div className="card-body">
                        <h3 className="card-title text-center mb-4">📝 Crear Cuenta</h3>

                        <form onSubmit={manejarRegistro}>
                            <div className="mb-3">
                                <label className="form-label">Nombre Completo</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    name="nombre"
                                    value={formData.nombre}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="mb-3">
                                <label className="form-label">Correo Electrónico</label>
                                <input
                                    type="email"
                                    className="form-control"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="mb-3">
                                <label className="form-label">Contraseña</label>
                                <input
                                    type="password"
                                    className="form-control"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <button type="submit" className="btn btn-success w-100 mb-3">
                                Registrarse
                            </button>

                            {/* Mensajes de éxito o error */}
                            {mensaje.texto && (
                                <div className={`text-center fw-bold ${mensaje.tipo}`}>
                                    {mensaje.texto}
                                </div>
                            )}
                        </form>

                        <div className="text-center mt-3">
                            <span>¿Ya tienes una cuenta? </span>
                            {/* Usamos Link de React Router en lugar de etiquetas <a> normales */}
                            <Link to="/login" className="text-decoration-none">Inicia sesión aquí</Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;