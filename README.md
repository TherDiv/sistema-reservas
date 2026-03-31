# 📅 Appointment Booking System (Full-Stack)

Sistema integral de gestión de citas diseñado para digitalizar el flujo de reservaciones. Permite a los administradores gestionar su disponibilidad y a los clientes agendar citas de manera autónoma con confirmación en tiempo real.

---

## ✨ Características Principales

### 👤 Vista del Cliente (Usuario)
- **Autenticación Segura:** Registro e inicio de sesión protegidos por **JWT**.
- **Reserva Inteligente:** Visualización de horarios disponibles filtrados por fecha local.
- **Historial de Citas:** Panel personal para seguimiento de estados (Pendiente, Aprobado, Rechazado).
- **UX Optimizada:** Notificaciones flotantes y estados de carga (Spinners) para evitar errores.

### 🛠️ Vista del Administrador
- **Gestión de Disponibilidad (CRUD):** Creación, edición y eliminación de horarios.
- **Panel de Control de Citas:** Gestión centralizada para aprobar o rechazar solicitudes.
- **Base de Clientes:** Acceso a la información de contacto de cada reserva realizada.

---

## 🚀 Stack Tecnológico

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

## 🛠️ Instalación y Configuración

### 1. Clonar y Dependencias
```bash
git clone [https://github.com/tu-usuario/nombre-del-repo.git](https://github.com/tu-usuario/nombre-del-repo.git)
cd nombre-del-repo

# Instalar en Backend
cd backend && npm install

# Instalar en Frontend
cd ../frontend && npm install
