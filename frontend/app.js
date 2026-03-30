const API_URL = 'http://localhost:3000/api';

// 1. Al cargar la página, verificamos si ya hay un token guardado
document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token_reservas');
    if (token) {
        mostrarInterfazLogueado();
    }
});

// 2. Función de Login
async function login() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const mensaje = document.getElementById('mensaje-login');

    mensaje.innerHTML = '<span class="text-primary">Cargando...</span>';

    try {
        const respuesta = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await respuesta.json();

        if (respuesta.ok) {
            // Guardamos el token y cambiamos la interfaz
            localStorage.setItem('token_reservas', data.token);
            mostrarInterfazLogueado();
        } else {
            mensaje.innerHTML = `<span class="text-danger">Error: ${data.message}</span>`;
        }
    } catch (error) {
        mensaje.innerHTML = '<span class="text-danger">Error al conectar con el servidor.</span>';
    }
}

// 3. Función para cambiar visualmente el formulario cuando ya entramos
function mostrarInterfazLogueado() {
    document.getElementById('email').disabled = true;
    document.getElementById('password').disabled = true;
    
    // 👇 NUEVO: Ocultamos el botón azul de Entrar
    document.getElementById('btn-login').style.display = 'none'; 
    
    const mensaje = document.getElementById('mensaje-login');
    mensaje.innerHTML = `
        <div class="alert alert-success mt-3 py-2">¡Sesión iniciada correctamente!</div>
        <button onclick="logout()" class="btn btn-outline-danger w-100 mt-2">Cerrar Sesión</button>
    `;
}

// 4. Función de Logout
function logout() {
    localStorage.removeItem('token_reservas'); 
    
    document.getElementById('email').disabled = false;
    document.getElementById('password').disabled = false;
    document.getElementById('password').value = ''; 
    document.getElementById('mensaje-login').innerHTML = '';
    
    // 👇 NUEVO: Volvemos a mostrar el botón azul de Entrar
    document.getElementById('btn-login').style.display = 'block'; 
    
    document.getElementById('lista-horarios').innerHTML = `
        <div class="alert alert-secondary text-center">
            Haz clic en "Cargar Horarios" para ver la disponibilidad.
        </div>
    `;
}

// 5. Función para obtener horarios protegidos
async function obtenerHorarios() {
    const lista = document.getElementById('lista-horarios');
    const token = localStorage.getItem('token_reservas');

    if (!token) {
        lista.innerHTML = '<div class="alert alert-warning">⚠️ Debes iniciar sesión primero.</div>';
        return;
    }

    // Ponemos un "Spinner" (ruedita de carga) de Bootstrap mientras esperamos
    lista.innerHTML = `
        <div class="text-center py-4">
            <div class="spinner-border text-primary" role="status"></div>
            <p class="mt-2 text-muted">Buscando horarios...</p>
        </div>
    `;

    try {
        const respuesta = await fetch(`${API_URL}/slots`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await respuesta.json();

        if (respuesta.ok) {
            lista.innerHTML = ""; // Limpiamos la ruedita de carga
            
            if (data.length === 0) {
                lista.innerHTML = '<div class="alert alert-info">No hay horarios disponibles en este momento.</div>';
                return;
            }

            // Dibujamos cada horario usando clases de Bootstrap
            data.forEach(horario => {
                // Formateamos la fecha al estilo español
                const fechaLimpia = new Date(horario.fecha).toLocaleDateString('es-ES', {
                    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
                });

                const div = document.createElement('div');
                div.className = 'list-group-item list-group-item-action d-flex justify-content-between align-items-center mb-2 shadow-sm rounded border';
                
                div.innerHTML = `
                    <div>
                        <h6 class="mb-1 text-capitalize text-primary">📅 ${fechaLimpia}</h6>
                        <small class="text-muted">⏰ De ${horario.hora_inicio} a ${horario.hora_fin}</small>
                    </div>
<button onclick="crearReserva(${horario.id})" class="btn btn-sm btn-success">Reservar</button>
                `;
                lista.appendChild(div);
            });
        } else {
            lista.innerHTML = `<div class="alert alert-danger">❌ Error: ${data.message}</div>`;
            // Si el token expiró (401), forzamos el cierre de sesión
            if(respuesta.status === 401) logout(); 
        }
    } catch (error) {
        lista.innerHTML = '<div class="alert alert-danger">Error de conexión.</div>';
    }
}
// 6. Función para crear una reserva (Ahora sí, completamente libre en el archivo)
async function crearReserva(idDelHorario) {
    const token = localStorage.getItem('token_reservas');

    if (!token) {
        alert("⚠️ Sesión expirada. Vuelve a iniciar sesión.");
        return;
    }

    const confirmar = confirm("¿Estás seguro de que deseas reservar este horario?");
    if (!confirmar) return;

    try {
        const respuesta = await fetch(`${API_URL}/bookings`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            // Usamos horario_id para que coincida con tu base de datos
            body: JSON.stringify({ horario_id: idDelHorario }) 
        });

        const data = await respuesta.json();

        if (respuesta.ok) {
            alert("🎉 ¡Reserva creada con éxito en la Base de Datos!");
            obtenerHorarios(); 
        } else {
            alert(`❌ No se pudo reservar: ${data.message}`);
        }
    } catch (error) {
        alert("Error de conexión al intentar reservar.");
    }
}