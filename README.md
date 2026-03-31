# Appointment Booking System (Full-Stack)

Sistema integral de gestión de citas diseñado para digitalizar el flujo de reservaciones. Permite a los administradores gestionar su disponibilidad y a los clientes agendar citas de manera autónoma con confirmación en tiempo real.

---

## Características Principales

### Vista del Cliente (Usuario)
- **Autenticación Segura:** Registro e inicio de sesión protegidos por **JWT**.
- **Reserva Inteligente:** Visualización de horarios disponibles filtrados por fecha local.
- **Historial de Citas:** Panel personal para seguimiento de estados (Pendiente, Aprobado, Rechazado).
- **UX Optimizada:** Notificaciones flotantes y estados de carga (Spinners) para evitar errores.

### Vista del Administrador
- **Gestión de Disponibilidad (CRUD):** Creación, edición y eliminación de horarios.
- **Panel de Control de Citas:** Gestión centralizada para aprobar o rechazar solicitudes.
- **Base de Clientes:** Acceso a la información de contacto de cada reserva realizada.

---

## Stack Tecnológico

### Frontend
- **React.js (Vite)**
- **Bootstrap 5** (Diseño Responsivo)
- **React Router Dom** (Navegación)
- **Lucide React** (Iconografía)
- **React Hot Toast** (Notificaciones)

### Backend
- **Node.js & Express.js**
- **MySQL** (Base de Datos Relacional)
- **JSON Web Token** (Seguridad de Sesiones)
- **Bcrypt.js** (Encriptación de Contraseñas)
- **CORS** (Comunicación Segura entre Orígenes)

---

## Instalación y Configuración

### 1. Clonar y Dependencias
```bash
git clone [https://github.com/tu-usuario/nombre-del-repo.git](https://github.com/tu-usuario/nombre-del-repo.git)
cd nombre-del-repo

# Instalar en Backend
cd backend && npm install

# Instalar en Frontend
cd ../frontend && npm install
```

# 📖 Documentación Técnica del Sistema

## 1. Arquitectura del Sistema
El proyecto sigue un modelo de **Arquitectura Desacoplada** basada en una **API RESTful**. 

- **Frontend:** Single Page Application (SPA) que consume recursos JSON.
- **Backend:** Servidor de recursos que gestiona la lógica de negocio y persistencia.

## 2. Flujo de Datos y Comunicación (CORS)
Para permitir la comunicación entre el puerto del frontend (5173) y el backend (3000), se implementó el middleware `cors` en Express, permitiendo métodos `GET, POST, PUT, DELETE, PATCH`.

## 3. Modelo de Entidad-Relación
El sistema se sustenta en tres tablas relacionales:

1. **Users:** `id, nombre, email, password, rol`.
2. **Slots (Horarios):** `id, fecha, hora_inicio, hora_fin, disponible (boolean)`.
3. **Bookings (Reservas):** `id, usuario_id, horario_id, estado (enum), fecha_creacion`.

## 4. Lógica de Seguridad (JWT + Middleware)
El sistema utiliza un **AuthMiddleware** en el backend que realiza los siguientes pasos:
1. Extrae el token del header `Authorization: Bearer <token>`.
2. Verifica la firma con la clave secreta.
3. Inyecta los datos del usuario (`id`, `rol`) en el objeto `req` para que los controladores sepan quién hace la petición.

## 5. Decisiones de Diseño en UX
- **Prevención de Double-Click:** Se utiliza un estado de React (`cargando`) para deshabilitar botones de acción durante las promesas asíncronas.
- **Feedback Inmediato:** Uso de `toast.promise` para mostrar el progreso de las peticiones al servidor.
- **Manejo de Fechas:** Se evitó el uso de `toISOString()` directo para el valor `min` de los calendarios, optando por una construcción manual de la fecha local para garantizar precisión horaria.
