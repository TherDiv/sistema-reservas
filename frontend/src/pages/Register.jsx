import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const Register = () => {
    const [formData, setFormData] = useState({ nombre: '', email: '', password: '' });
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const manejarRegistro = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const respuesta = await fetch('http://localhost:3000/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            const data = await respuesta.json();

            if (respuesta.ok) {
                toast.success('Cuenta creada. Redirigiendo...');
                setTimeout(() => navigate('/login'), 1800);
            } else {
                toast.error(data.message || 'No se pudo crear la cuenta.');
            }
        } catch {
            toast.error('Error de conexión con el servidor.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500&family=DM+Serif+Display&display=swap');
                .auth-root {
                    min-height: 100vh; display: grid;
                    grid-template-columns: 1fr 1fr;
                    font-family: 'DM Sans', sans-serif; background: #fff;
                }
                .auth-panel-left {
                    background: #0f0f0f; display: flex;
                    flex-direction: column; justify-content: space-between;
                    padding: 56px 64px; position: relative; overflow: hidden;
                }
                .auth-panel-left::before {
                    content: ''; position: absolute;
                    top: -120px; right: -120px; width: 400px; height: 400px;
                    border-radius: 50%;
                    background: radial-gradient(circle, rgba(255,255,255,0.04) 0%, transparent 70%);
                }
                .auth-brand { display: flex; align-items: center; gap: 10px; }
                .auth-brand-dot { width: 8px; height: 8px; background: #fff; border-radius: 50%; }
                .auth-brand-name { font-weight: 500; font-size: 15px; color: #fff; letter-spacing: 0.04em; text-transform: uppercase; }
                .auth-headline { font-family: 'DM Serif Display', serif; font-size: 42px; line-height: 1.15; color: #fff; font-weight: 400; margin: 0 0 10px 0; }
                .auth-headline span { color: #666; }
                .auth-tagline { font-size: 13px; color: #444; letter-spacing: 0.02em; }
                .auth-panel-right { display: flex; align-items: center; justify-content: center; padding: 56px 80px; }
                .auth-form-container { width: 100%; max-width: 360px; }
                .auth-form-title { font-size: 22px; font-weight: 500; color: #0f0f0f; margin: 0 0 6px 0; letter-spacing: -0.02em; }
                .auth-form-subtitle { font-size: 13px; color: #888; margin: 0 0 36px 0; font-weight: 300; }
                .auth-field { margin-bottom: 18px; }
                .auth-label { display: block; font-size: 11px; font-weight: 500; letter-spacing: 0.08em; text-transform: uppercase; color: #555; margin-bottom: 8px; }
                .auth-input { width: 100%; padding: 12px 16px; border: 1.5px solid #e8e8e8; border-radius: 6px; font-size: 14px; font-family: 'DM Sans', sans-serif; color: #0f0f0f; background: #fafafa; transition: border-color 0.15s, background 0.15s; box-sizing: border-box; outline: none; }
                .auth-input:focus { border-color: #0f0f0f; background: #fff; }
                .auth-input::placeholder { color: #bbb; }
                .auth-btn { width: 100%; padding: 13px; background: #0f0f0f; color: #fff; border: none; border-radius: 6px; font-size: 14px; font-weight: 500; font-family: 'DM Sans', sans-serif; cursor: pointer; letter-spacing: 0.02em; transition: background 0.15s, opacity 0.15s; margin-top: 8px; }
                .auth-btn:hover:not(:disabled) { background: #2a2a2a; }
                .auth-btn:disabled { opacity: 0.5; cursor: not-allowed; }
                .auth-divider { height: 1px; background: #f0f0f0; margin: 28px 0; }
                .auth-footer-text { font-size: 13px; color: #888; text-align: center; }
                .auth-footer-text a { color: #0f0f0f; font-weight: 500; text-decoration: none; border-bottom: 1px solid #0f0f0f; padding-bottom: 1px; transition: opacity 0.15s; }
                .auth-footer-text a:hover { opacity: 0.5; }
                @media (max-width: 768px) {
                    .auth-root { grid-template-columns: 1fr; }
                    .auth-panel-left { display: none; }
                    .auth-panel-right { padding: 40px 24px; }
                }
            `}</style>

            <div className="auth-root">
                <div className="auth-panel-left">
                    <div className="auth-brand">
                        <div className="auth-brand-dot"></div>
                        <span className="auth-brand-name">Reserva tu reunión</span>
                    </div>
                    <div>
                        <p className="auth-headline">Tu reunión<br /><span>comienza</span><br />aquí.</p>
                        <p className="auth-tagline">Crea tu cuenta en menos de un minuto</p>
                    </div>
                    <p className="auth-tagline">© 2026 Reserva tu Cita</p>
                </div>

                <div className="auth-panel-right">
                    <div className="auth-form-container">
                        <h1 className="auth-form-title">Crear cuenta</h1>
                        <p className="auth-form-subtitle">Completa los datos para registrarte</p>

                        <form onSubmit={manejarRegistro}>
                            <div className="auth-field">
                                <label className="auth-label">Nombre completo</label>
                                <input type="text" className="auth-input" placeholder="Tu nombre" name="nombre" value={formData.nombre} onChange={handleChange} required />
                            </div>
                            <div className="auth-field">
                                <label className="auth-label">Correo electrónico</label>
                                <input type="email" className="auth-input" placeholder="tu@correo.com" name="email" value={formData.email} onChange={handleChange} required />
                            </div>
                            <div className="auth-field">
                                <label className="auth-label">Contraseña</label>
                                <input type="password" className="auth-input" placeholder="••••••••" name="password" value={formData.password} onChange={handleChange} required />
                            </div>
                            <button type="submit" className="auth-btn" disabled={loading}>
                                {loading ? 'Creando cuenta...' : 'Registrarse'}
                            </button>
                        </form>

                        <div className="auth-divider"></div>
                        <p className="auth-footer-text">
                            ¿Ya tienes cuenta? <Link to="/login">Inicia sesión aquí</Link>
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Register;