# Portal de Padres - Next.js

Sistema de gestión escolar desarrollado con Next.js 15, TypeScript y SQLite.

## Características

- Frontend: Next.js 15 con App Router
- Backend: API Routes integradas
- Base de datos: SQLite con compilación automática desde `database/schema.sql`
- UI: Tailwind CSS con componentes personalizados
- Autenticación y roles: Administrador, Docente y Padre

## Estructura del Proyecto

```
portalpadres/
├── src/
│   ├── app/                    # App Router de Next.js
│   │   ├── api/               # API Routes (Backend)
│   │   ├── login/             # Página de login
│   │   ├── admin/             # Dashboard de administrador
│   │   ├── parent/            # Dashboard de padres
│   │   └── teacher/           # Dashboard de docentes
│   ├── components/            # Componentes React
│   │   ├── ui/               # Componentes UI reutilizables
│   │   ├── auth/             # Componentes de autenticación
│   │   └── layout/           # Componentes de layout
│   ├── lib/                  # Utilidades y configuración
│   │   ├── database.ts       # Clase para manejo de base de datos
│   │   └── utils.ts          # Utilidades generales
│   └── types/                # Tipos TypeScript
├── database/
│   ├── schema.sql            # Esquema de base de datos (EDITABLE)
│   └── portal_padres.db      # Base de datos SQLite (generada automáticamente)
├── scripts/
│   └── compile-database.js   # Script para compilar base de datos
└── public/
    └── assets/               # Imágenes y recursos estáticos
```

## Base de Datos

### Compilación Automática
La base de datos se compila automáticamente desde `database/schema.sql` si no existe.

### Editar la Base de Datos
Para modificar la estructura o los datos iniciales:

1. **Edita** `database/schema.sql`
2. **Elimina** la base de datos existente: `rm database/portal_padres.db`
3. **Reinicia** la aplicación: `npm run dev`

### Scripts Disponibles
```bash
npm run db:compile    # Compilar base de datos desde schema.sql
npm run db:reset      # Eliminar y recrear base de datos
```

## Credenciales de Acceso

| Usuario      | Contraseña | Rol           | Descripción                    |
|--------------|------------|---------------|--------------------------------|
| `admin`      | `123456`   | Administrador | Acceso completo al sistema     |
| `profjuan`   | `123456`   | Docente       | Profesor principal             |
| `proflaura`  | `123456`   | Docente       | Profesora adicional            |
| `profmiguel` | `123456`   | Docente       | Profesor adicional             |
| `papacarlos` | `123456`   | Padre         | Padre de Ana y Luis            |
| `mamalucia`  | `123456`   | Padre         | Madre de Sofia y Diego         |
| `papajose`   | `123456`   | Padre         | Padre de Isabella              |
| `mamacarmen` | `123456`   | Padre         | Madre de Mateo y Valentina     |

> Nota: todas las contraseñas iniciales se pueden cambiar desde las pantallas de Configuración.

## URLs de Acceso Rápido (modo desarrollo)

- Admin: `http://localhost:3001/admin`
- Docente: `http://localhost:3001/teacher`
  - Estudiantes: `http://localhost:3001/teacher/students`
  - Calificaciones: `http://localhost:3001/teacher/grades`
  - Asistencia: `http://localhost:3001/teacher/attendance`
  - Horario: `http://localhost:3001/teacher/schedule`
  - Configuración: `http://localhost:3001/teacher/settings`
- Padre: `http://localhost:3001/parent`
  - Hijos: `http://localhost:3001/parent/children`
  - Notas: `http://localhost:3001/parent/grades`
  - Asistencia: `http://localhost:3001/parent/attendance`
  - Configuración: `http://localhost:3001/parent/settings`

## Instalación y Uso

### Prerrequisitos
- Node.js 18 o superior
- npm o yarn

### Instalación
```bash
# Clonar el repositorio
git clone <repository-url>
cd portalpadres

# Instalar dependencias
npm install

# Compilar base de datos (opcional; también se compila automáticamente al iniciar)
npm run db:compile

# Iniciar servidor en desarrollo (por defecto en http://localhost:3001)
npm run dev
```

### Desarrollo
```bash
# Iniciar servidor de desarrollo
npm run dev

# Compilar para producción
npm run build

# Iniciar servidor de producción
npm start
```

## Datos de Ejemplo

La base de datos incluye datos de ejemplo:

- **8 Usuarios** con diferentes roles
- **4 Padres** con información completa
- **7 Hijos** con edades variadas
- **27 Registros de Asistencia**
- **20 Notas** de diferentes materias
- **7 Citas** programadas
- **3 Eventos de Calendario**

## Personalización

### Colores de Marca
Edita `tailwind.config.ts` para cambiar los colores:
```typescript
colors: {
  brand: {
    500: '#a53434', // Color principal
    // ... más variantes
  }
}
```

### Componentes UI
Los componentes están en `src/components/ui/` y son fácilmente personalizables.

### Base de Datos
Modifica `database/schema.sql` para cambiar la estructura o datos iniciales.

## Tecnologías Utilizadas

- **Next.js 15** - Framework React
- **TypeScript** - Tipado estático
- **Tailwind CSS** - Estilos
- **SQLite** - Base de datos
- **Lucide React** - Iconos
- **Class Variance Authority** - Variantes de componentes

## Notas de Desarrollo

- La base de datos se compila automáticamente al iniciar la aplicación
- Todos los usuarios tienen la misma contraseña por defecto: `123456`
- El sistema usa `INSERT OR IGNORE` para evitar duplicados
- Las rutas están protegidas por roles de usuario

## Despliegue

Para desplegar en producción:

1. **Compilar** la aplicación: `npm run build`
2. **Iniciar** el servidor: `npm start`
3. **Configurar** variables de entorno si es necesario
4. **Asegurar** que la base de datos esté accesible

La aplicación es compatible con Vercel, Netlify o cualquier plataforma que soporte Next.js.

## Solución de Problemas Comunes

- Error SQLite: “The process cannot access the file ... because it is being used by another process”.
  - Cierra el servidor de desarrollo y vuelve a iniciar.
  - En Windows, asegúrate de cerrar procesos `node.exe` que mantengan bloqueado el archivo.
- Cambios en `schema.sql` no se reflejan.
  - Ejecuta `npm run db:reset` para eliminar y recrear la base.
- Tailwind no aplica clases.
  - Verifica que `postcss.config` y `tailwind.config` estén correctamente configurados para la versión instalada.