import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
    // Estados para guardar lo que el usuario escribe
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [mensaje, setMensaje] = useState({ texto: '', tipo: '' });

    // Herramienta para redireccionar a otra página
    const navigate = useNavigate();

    const manejarLogin = async (e) => {
        e.preventDefault(); // Evita que la página se recargue al enviar el formulario
        setMensaje({ texto: 'Cargando...', tipo: 'text-primary' });

        try {
            const respuesta = await fetch('http://localhost:3000/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await respuesta.json();

            if (respuesta.ok) {
                // Guardamos el token y el rol
                localStorage.setItem('token_reservas', data.token);
                localStorage.setItem('rol_usuario', data.rol); // 👈 ¡Línea nueva!

                // Redirigimos al usuario
                navigate('/dashboard');
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
                        <h3 className="card-title text-center mb-4">🚀 Iniciar Sesión</h3>

                        <form onSubmit={manejarLogin}>
                            <div className="mb-3">
                                <label className="form-label">Correo Electrónico</label>
                                <input
                                    type="email"
                                    className="form-control"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="mb-3">
                                <label className="form-label">Contraseña</label>
                                <input
                                    type="password"
                                    className="form-control"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>

                            <button type="submit" className="btn btn-primary w-100 mb-3">
                                Entrar
                            </button>

                            <div className="text-center mt-3 mb-2">
                                <span>¿No tienes una cuenta? </span>
                                <Link to="/register" className="text-decoration-none">Regístrate aquí</Link>
                            </div>

                            {/* Mostrar mensaje de error o carga */}
                            {mensaje.texto && (
                                <div className={`text-center fw-bold ${mensaje.tipo}`}>
                                    {mensaje.texto}
                                </div>
                            )}
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;