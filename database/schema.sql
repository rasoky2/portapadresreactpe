-- Portal de Padres - Esquema de Base de Datos SQLite
-- Este archivo se compila automáticamente si no existe la base de datos
-- Estructura adaptada para colegio peruano con Primaria y Secundaria

-- Tabla de Roles
CREATE TABLE IF NOT EXISTS Roles (
    IdRol INTEGER PRIMARY KEY AUTOINCREMENT,
    NombreRol TEXT NOT NULL
);

-- Tabla de Usuarios
CREATE TABLE IF NOT EXISTS Usuarios (
    IdUsuario INTEGER PRIMARY KEY AUTOINCREMENT,
    Usuario TEXT NOT NULL UNIQUE,
    Contraseña TEXT NOT NULL,
    IdRol INTEGER NOT NULL,
    Nombre TEXT,
    Apellido TEXT,
    Email TEXT,
    Telefono TEXT,
    FOREIGN KEY (IdRol) REFERENCES Roles(IdRol)
);

-- Tabla de Niveles Educativos
CREATE TABLE IF NOT EXISTS Niveles (
    IdNivel INTEGER PRIMARY KEY AUTOINCREMENT,
    NombreNivel TEXT NOT NULL,
    Orden INTEGER NOT NULL
);

-- Tabla de Grados
CREATE TABLE IF NOT EXISTS Grados (
    IdGrado INTEGER PRIMARY KEY AUTOINCREMENT,
    IdNivel INTEGER NOT NULL,
    NumeroGrado INTEGER NOT NULL,
    NombreGrado TEXT NOT NULL,
    FOREIGN KEY (IdNivel) REFERENCES Niveles(IdNivel)
);

-- Tabla de Secciones
CREATE TABLE IF NOT EXISTS Secciones (
    IdSeccion INTEGER PRIMARY KEY AUTOINCREMENT,
    IdGrado INTEGER NOT NULL,
    NombreSeccion TEXT NOT NULL,
    CapacidadMaxima INTEGER DEFAULT 30,
    FOREIGN KEY (IdGrado) REFERENCES Grados(IdGrado)
);

-- Tabla de Materias
CREATE TABLE IF NOT EXISTS Materias (
    IdMateria INTEGER PRIMARY KEY AUTOINCREMENT,
    NombreMateria TEXT NOT NULL,
    IdNivel INTEGER NOT NULL,
    HorasSemanales INTEGER DEFAULT 2,
    FOREIGN KEY (IdNivel) REFERENCES Niveles(IdNivel)
);

-- Tabla de Padres
CREATE TABLE IF NOT EXISTS Padres (
    IdPadre INTEGER PRIMARY KEY AUTOINCREMENT,
    IdUsuario INTEGER NOT NULL,
    NombrePadre TEXT,
    ApellidoPadre TEXT,
    Telefono TEXT,
    Direccion TEXT,
    DNI TEXT,
    FOREIGN KEY (IdUsuario) REFERENCES Usuarios(IdUsuario)
);

-- Tabla de Hijos (Estudiantes)
CREATE TABLE IF NOT EXISTS Hijos (
    IdHijo INTEGER PRIMARY KEY AUTOINCREMENT,
    NombreHijo TEXT NOT NULL,
    ApellidoHijo TEXT NOT NULL,
    FechaNacimiento DATE,
    Edad INTEGER,
    IdPadre INTEGER NOT NULL,
    IdGrado INTEGER,
    IdSeccion INTEGER,
    CodigoEstudiante TEXT UNIQUE,
    Estado TEXT DEFAULT 'Activo', -- Activo, Inactivo, Graduado
    FOREIGN KEY (IdPadre) REFERENCES Padres(IdPadre),
    FOREIGN KEY (IdGrado) REFERENCES Grados(IdGrado),
    FOREIGN KEY (IdSeccion) REFERENCES Secciones(IdSeccion)
);

-- Tabla de Horarios de Materias
CREATE TABLE IF NOT EXISTS HorariosMaterias (
    IdHorario INTEGER PRIMARY KEY AUTOINCREMENT,
    IdMateria INTEGER NOT NULL,
    DiaSemana TEXT NOT NULL, -- Lunes, Martes, Miércoles, Jueves, Viernes, Sábado
    HoraInicio TIME NOT NULL,
    HoraFin TIME NOT NULL,
    FOREIGN KEY (IdMateria) REFERENCES Materias(IdMateria)
);

-- Tabla de Asignación de Docentes a Materias y Grados
CREATE TABLE IF NOT EXISTS DocenteMateriaGrado (
    IdAsignacion INTEGER PRIMARY KEY AUTOINCREMENT,
    IdUsuario INTEGER NOT NULL, -- Docente
    IdMateria INTEGER NOT NULL,
    IdGrado INTEGER NOT NULL,
    IdSeccion INTEGER,
    FOREIGN KEY (IdUsuario) REFERENCES Usuarios(IdUsuario),
    FOREIGN KEY (IdMateria) REFERENCES Materias(IdMateria),
    FOREIGN KEY (IdGrado) REFERENCES Grados(IdGrado),
    FOREIGN KEY (IdSeccion) REFERENCES Secciones(IdSeccion)
);

-- Tabla de Asistencia
CREATE TABLE IF NOT EXISTS Asistencia (
    IdAsistencia INTEGER PRIMARY KEY AUTOINCREMENT,
    IdHijo INTEGER NOT NULL,
    Fecha DATE NOT NULL,
    Asistio BOOLEAN NOT NULL,
    FOREIGN KEY (IdHijo) REFERENCES Hijos(IdHijo)
);

-- Tabla de Calendario
CREATE TABLE IF NOT EXISTS Calendario (
    IdEvento INTEGER PRIMARY KEY AUTOINCREMENT,
    Fecha DATE NOT NULL,
    Descripcion TEXT NOT NULL,
    Tipo TEXT
);

-- Tabla de Citas
CREATE TABLE IF NOT EXISTS Citas (
    IdCita INTEGER PRIMARY KEY AUTOINCREMENT,
    IdPadre INTEGER NOT NULL,
    IdDocente INTEGER NOT NULL,
    Fecha DATE NOT NULL,
    Hora TIME NOT NULL,
    Descripcion TEXT,
    FOREIGN KEY (IdPadre) REFERENCES Padres(IdPadre),
    FOREIGN KEY (IdDocente) REFERENCES Usuarios(IdUsuario)
);

-- Tabla de Notas
CREATE TABLE IF NOT EXISTS Notas (
    IdNota INTEGER PRIMARY KEY AUTOINCREMENT,
    IdHijo INTEGER NOT NULL,
    IdMateria INTEGER NOT NULL,
    IdUsuario INTEGER NOT NULL, -- Docente que califica
    Bimestre INTEGER NOT NULL DEFAULT 1 CHECK (Bimestre BETWEEN 1 AND 4), -- 1 a 4
    Unidad TEXT,
    Criterio TEXT,
    Nota DECIMAL(5,2),
    Peso DECIMAL(3,2) DEFAULT 1.0, -- Peso de la nota (ej: 0.3 para 30%)
    TipoNota TEXT DEFAULT 'Parcial', -- Parcial, Bimestral, Final
    Fecha DATE NOT NULL,
    FOREIGN KEY (IdHijo) REFERENCES Hijos(IdHijo),
    FOREIGN KEY (IdMateria) REFERENCES Materias(IdMateria),
    FOREIGN KEY (IdUsuario) REFERENCES Usuarios(IdUsuario)
);

-- Tabla de Conceptos de Pago
CREATE TABLE IF NOT EXISTS ConceptosPago (
    IdConcepto INTEGER PRIMARY KEY AUTOINCREMENT,
    NombreConcepto TEXT NOT NULL,
    Descripcion TEXT,
    Monto DECIMAL(10,2) NOT NULL,
    TipoConcepto TEXT NOT NULL, -- Matricula, Mensualidad
    DuracionMeses INTEGER, -- 1,2,3,12 para planes; NULL para matrícula
    IdGrado INTEGER,
    IdNivel INTEGER,
    Activo BOOLEAN DEFAULT 1,
    FechaCreacion DATE DEFAULT CURRENT_DATE,
    FOREIGN KEY (IdGrado) REFERENCES Grados(IdGrado),
    FOREIGN KEY (IdNivel) REFERENCES Niveles(IdNivel)
);

-- Tabla de Settings (clave/valor) para configuración del sistema
CREATE TABLE IF NOT EXISTS Settings (
    Key TEXT PRIMARY KEY,
    Value TEXT
);

-- Tabla de Facturas
CREATE TABLE IF NOT EXISTS Facturas (
    IdFactura INTEGER PRIMARY KEY AUTOINCREMENT,
    IdPadre INTEGER NOT NULL,
    IdHijo INTEGER NOT NULL,
    NumeroFactura TEXT UNIQUE NOT NULL,
    FechaEmision DATE NOT NULL,
    FechaVencimiento DATE NOT NULL,
    Estado TEXT DEFAULT 'Pendiente', -- Pendiente, Pagada, Vencida, Cancelada
    Subtotal DECIMAL(10,2) NOT NULL,
    Descuento DECIMAL(10,2) DEFAULT 0,
    Total DECIMAL(10,2) NOT NULL,
    Observaciones TEXT,
    FechaCreacion DATE DEFAULT CURRENT_DATE,
    FOREIGN KEY (IdPadre) REFERENCES Padres(IdPadre),
    FOREIGN KEY (IdHijo) REFERENCES Hijos(IdHijo)
);

-- Tabla de Detalles de Factura
CREATE TABLE IF NOT EXISTS DetalleFactura (
    IdDetalle INTEGER PRIMARY KEY AUTOINCREMENT,
    IdFactura INTEGER NOT NULL,
    IdConcepto INTEGER NOT NULL,
    Cantidad INTEGER DEFAULT 1,
    PrecioUnitario DECIMAL(10,2) NOT NULL,
    Subtotal DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (IdFactura) REFERENCES Facturas(IdFactura),
    FOREIGN KEY (IdConcepto) REFERENCES ConceptosPago(IdConcepto)
);

-- Tabla de Pagos
CREATE TABLE IF NOT EXISTS Pagos (
    IdPago INTEGER PRIMARY KEY AUTOINCREMENT,
    IdFactura INTEGER NOT NULL,
    FechaPago DATE NOT NULL,
    Monto DECIMAL(10,2) NOT NULL,
    MetodoPago TEXT NOT NULL, -- Efectivo, Transferencia, Tarjeta, Yape, Plin, etc.
    Referencia TEXT,
    Estado TEXT DEFAULT 'Confirmado', -- Confirmado, Pendiente, Rechazado
    Observaciones TEXT,
    FechaCreacion DATE DEFAULT CURRENT_DATE,
    FOREIGN KEY (IdFactura) REFERENCES Facturas(IdFactura)
);

-- Insertar Roles
INSERT OR IGNORE INTO Roles (IdRol, NombreRol) VALUES (1, 'Administrador');
INSERT OR IGNORE INTO Roles (IdRol, NombreRol) VALUES (2, 'Docente');
INSERT OR IGNORE INTO Roles (IdRol, NombreRol) VALUES (3, 'Padre');

-- Insertar Niveles Educativos
INSERT OR IGNORE INTO Niveles (IdNivel, NombreNivel, Orden) VALUES (1, 'Primaria', 1);
INSERT OR IGNORE INTO Niveles (IdNivel, NombreNivel, Orden) VALUES (2, 'Secundaria', 2);

-- Insertar Grados
-- Primaria (1-6)
INSERT OR IGNORE INTO Grados (IdGrado, IdNivel, NumeroGrado, NombreGrado) VALUES (1, 1, 1, 'Primer Grado');
INSERT OR IGNORE INTO Grados (IdGrado, IdNivel, NumeroGrado, NombreGrado) VALUES (2, 1, 2, 'Segundo Grado');
INSERT OR IGNORE INTO Grados (IdGrado, IdNivel, NumeroGrado, NombreGrado) VALUES (3, 1, 3, 'Tercer Grado');
INSERT OR IGNORE INTO Grados (IdGrado, IdNivel, NumeroGrado, NombreGrado) VALUES (4, 1, 4, 'Cuarto Grado');
INSERT OR IGNORE INTO Grados (IdGrado, IdNivel, NumeroGrado, NombreGrado) VALUES (5, 1, 5, 'Quinto Grado');
INSERT OR IGNORE INTO Grados (IdGrado, IdNivel, NumeroGrado, NombreGrado) VALUES (6, 1, 6, 'Sexto Grado');
-- Secundaria (1-5)
INSERT OR IGNORE INTO Grados (IdGrado, IdNivel, NumeroGrado, NombreGrado) VALUES (7, 2, 1, 'Primer Año');
INSERT OR IGNORE INTO Grados (IdGrado, IdNivel, NumeroGrado, NombreGrado) VALUES (8, 2, 2, 'Segundo Año');
INSERT OR IGNORE INTO Grados (IdGrado, IdNivel, NumeroGrado, NombreGrado) VALUES (9, 2, 3, 'Tercer Año');
INSERT OR IGNORE INTO Grados (IdGrado, IdNivel, NumeroGrado, NombreGrado) VALUES (10, 2, 4, 'Cuarto Año');
INSERT OR IGNORE INTO Grados (IdGrado, IdNivel, NumeroGrado, NombreGrado) VALUES (11, 2, 5, 'Quinto Año');

-- Insertar Secciones (A, B, C para cada grado)
INSERT OR IGNORE INTO Secciones (IdSeccion, IdGrado, NombreSeccion, CapacidadMaxima) VALUES (1, 1, 'A', 25);
INSERT OR IGNORE INTO Secciones (IdSeccion, IdGrado, NombreSeccion, CapacidadMaxima) VALUES (2, 1, 'B', 25);
INSERT OR IGNORE INTO Secciones (IdSeccion, IdGrado, NombreSeccion, CapacidadMaxima) VALUES (3, 2, 'A', 25);
INSERT OR IGNORE INTO Secciones (IdSeccion, IdGrado, NombreSeccion, CapacidadMaxima) VALUES (4, 2, 'B', 25);
INSERT OR IGNORE INTO Secciones (IdSeccion, IdGrado, NombreSeccion, CapacidadMaxima) VALUES (5, 3, 'A', 25);
INSERT OR IGNORE INTO Secciones (IdSeccion, IdGrado, NombreSeccion, CapacidadMaxima) VALUES (6, 3, 'B', 25);
INSERT OR IGNORE INTO Secciones (IdSeccion, IdGrado, NombreSeccion, CapacidadMaxima) VALUES (7, 4, 'A', 25);
INSERT OR IGNORE INTO Secciones (IdSeccion, IdGrado, NombreSeccion, CapacidadMaxima) VALUES (8, 4, 'B', 25);
INSERT OR IGNORE INTO Secciones (IdSeccion, IdGrado, NombreSeccion, CapacidadMaxima) VALUES (9, 5, 'A', 25);
INSERT OR IGNORE INTO Secciones (IdSeccion, IdGrado, NombreSeccion, CapacidadMaxima) VALUES (10, 5, 'B', 25);
INSERT OR IGNORE INTO Secciones (IdSeccion, IdGrado, NombreSeccion, CapacidadMaxima) VALUES (11, 6, 'A', 25);
INSERT OR IGNORE INTO Secciones (IdSeccion, IdGrado, NombreSeccion, CapacidadMaxima) VALUES (12, 6, 'B', 25);
INSERT OR IGNORE INTO Secciones (IdSeccion, IdGrado, NombreSeccion, CapacidadMaxima) VALUES (13, 7, 'A', 30);
INSERT OR IGNORE INTO Secciones (IdSeccion, IdGrado, NombreSeccion, CapacidadMaxima) VALUES (14, 7, 'B', 30);
INSERT OR IGNORE INTO Secciones (IdSeccion, IdGrado, NombreSeccion, CapacidadMaxima) VALUES (15, 8, 'A', 30);
INSERT OR IGNORE INTO Secciones (IdSeccion, IdGrado, NombreSeccion, CapacidadMaxima) VALUES (16, 8, 'B', 30);
INSERT OR IGNORE INTO Secciones (IdSeccion, IdGrado, NombreSeccion, CapacidadMaxima) VALUES (17, 9, 'A', 30);
INSERT OR IGNORE INTO Secciones (IdSeccion, IdGrado, NombreSeccion, CapacidadMaxima) VALUES (18, 9, 'B', 30);
INSERT OR IGNORE INTO Secciones (IdSeccion, IdGrado, NombreSeccion, CapacidadMaxima) VALUES (19, 10, 'A', 30);
INSERT OR IGNORE INTO Secciones (IdSeccion, IdGrado, NombreSeccion, CapacidadMaxima) VALUES (20, 10, 'B', 30);
INSERT OR IGNORE INTO Secciones (IdSeccion, IdGrado, NombreSeccion, CapacidadMaxima) VALUES (21, 11, 'A', 30);
INSERT OR IGNORE INTO Secciones (IdSeccion, IdGrado, NombreSeccion, CapacidadMaxima) VALUES (22, 11, 'B', 30);

-- Insertar Materias por Nivel
-- Materias de Primaria
INSERT OR IGNORE INTO Materias (IdMateria, NombreMateria, IdNivel, HorasSemanales) VALUES (1, 'Comunicación', 1, 5);
INSERT OR IGNORE INTO Materias (IdMateria, NombreMateria, IdNivel, HorasSemanales) VALUES (2, 'Matemática', 1, 5);
INSERT OR IGNORE INTO Materias (IdMateria, NombreMateria, IdNivel, HorasSemanales) VALUES (3, 'Personal Social', 1, 3);
INSERT OR IGNORE INTO Materias (IdMateria, NombreMateria, IdNivel, HorasSemanales) VALUES (4, 'Ciencia y Tecnología', 1, 3);
INSERT OR IGNORE INTO Materias (IdMateria, NombreMateria, IdNivel, HorasSemanales) VALUES (5, 'Arte y Cultura', 1, 2);
INSERT OR IGNORE INTO Materias (IdMateria, NombreMateria, IdNivel, HorasSemanales) VALUES (6, 'Educación Física', 1, 2);
INSERT OR IGNORE INTO Materias (IdMateria, NombreMateria, IdNivel, HorasSemanales) VALUES (7, 'Religión', 1, 2);
INSERT OR IGNORE INTO Materias (IdMateria, NombreMateria, IdNivel, HorasSemanales) VALUES (8, 'Inglés', 1, 2);

-- Materias de Secundaria
INSERT OR IGNORE INTO Materias (IdMateria, NombreMateria, IdNivel, HorasSemanales) VALUES (9, 'Comunicación', 2, 4);
INSERT OR IGNORE INTO Materias (IdMateria, NombreMateria, IdNivel, HorasSemanales) VALUES (10, 'Matemática', 2, 4);
INSERT OR IGNORE INTO Materias (IdMateria, NombreMateria, IdNivel, HorasSemanales) VALUES (11, 'Historia, Geografía y Economía', 2, 3);
INSERT OR IGNORE INTO Materias (IdMateria, NombreMateria, IdNivel, HorasSemanales) VALUES (12, 'Ciencia, Tecnología y Ambiente', 2, 3);
INSERT OR IGNORE INTO Materias (IdMateria, NombreMateria, IdNivel, HorasSemanales) VALUES (13, 'Formación Ciudadana y Cívica', 2, 2);
INSERT OR IGNORE INTO Materias (IdMateria, NombreMateria, IdNivel, HorasSemanales) VALUES (14, 'Arte y Cultura', 2, 2);
INSERT OR IGNORE INTO Materias (IdMateria, NombreMateria, IdNivel, HorasSemanales) VALUES (15, 'Educación Física', 2, 2);
INSERT OR IGNORE INTO Materias (IdMateria, NombreMateria, IdNivel, HorasSemanales) VALUES (16, 'Religión', 2, 2);
INSERT OR IGNORE INTO Materias (IdMateria, NombreMateria, IdNivel, HorasSemanales) VALUES (17, 'Inglés', 2, 3);
INSERT OR IGNORE INTO Materias (IdMateria, NombreMateria, IdNivel, HorasSemanales) VALUES (18, 'Educación para el Trabajo', 2, 3);

-- Insertar Usuarios
INSERT OR IGNORE INTO Usuarios (IdUsuario, Usuario, Contraseña, IdRol, Nombre, Apellido, Email, Telefono) VALUES (1, 'admin', '123456', 1, 'Administrador', 'Sistema', 'admin@colegio.edu.pe', '555-0001');
INSERT OR IGNORE INTO Usuarios (IdUsuario, Usuario, Contraseña, IdRol, Nombre, Apellido, Email, Telefono) VALUES (2, 'profjuan', '123456', 2, 'Juan', 'Pérez', 'juan.perez@colegio.edu.pe', '555-0101');
INSERT OR IGNORE INTO Usuarios (IdUsuario, Usuario, Contraseña, IdRol, Nombre, Apellido, Email, Telefono) VALUES (3, 'proflaura', '123456', 2, 'Laura', 'García', 'laura.garcia@colegio.edu.pe', '555-0102');
INSERT OR IGNORE INTO Usuarios (IdUsuario, Usuario, Contraseña, IdRol, Nombre, Apellido, Email, Telefono) VALUES (4, 'profmiguel', '123456', 2, 'Miguel', 'Rodríguez', 'miguel.rodriguez@colegio.edu.pe', '555-0103');
INSERT OR IGNORE INTO Usuarios (IdUsuario, Usuario, Contraseña, IdRol, Nombre, Apellido, Email, Telefono) VALUES (5, 'profcarmen', '123456', 2, 'Carmen', 'López', 'carmen.lopez@colegio.edu.pe', '555-0104');
INSERT OR IGNORE INTO Usuarios (IdUsuario, Usuario, Contraseña, IdRol, Nombre, Apellido, Email, Telefono) VALUES (6, 'profroberto', '123456', 2, 'Roberto', 'Silva', 'roberto.silva@colegio.edu.pe', '555-0105');
INSERT OR IGNORE INTO Usuarios (IdUsuario, Usuario, Contraseña, IdRol, Nombre, Apellido, Email, Telefono) VALUES (7, 'papacarlos', '123456', 3, 'Carlos', 'Pérez', 'carlos.perez@email.com', '555-0201');
INSERT OR IGNORE INTO Usuarios (IdUsuario, Usuario, Contraseña, IdRol, Nombre, Apellido, Email, Telefono) VALUES (8, 'mamalucia', '123456', 3, 'Lucía', 'García', 'lucia.garcia@email.com', '555-0202');
INSERT OR IGNORE INTO Usuarios (IdUsuario, Usuario, Contraseña, IdRol, Nombre, Apellido, Email, Telefono) VALUES (9, 'papajose', '123456', 3, 'José', 'Martínez', 'jose.martinez@email.com', '555-0203');
INSERT OR IGNORE INTO Usuarios (IdUsuario, Usuario, Contraseña, IdRol, Nombre, Apellido, Email, Telefono) VALUES (10, 'mamacarmen', '123456', 3, 'Carmen', 'López', 'carmen.lopez@email.com', '555-0204');

-- Insertar Padres
INSERT OR IGNORE INTO Padres (IdPadre, IdUsuario, NombrePadre, ApellidoPadre, Telefono, Direccion, DNI) VALUES (1, 7, 'Carlos', 'Pérez', '555-0123', 'Calle Principal 123', '12345678');
INSERT OR IGNORE INTO Padres (IdPadre, IdUsuario, NombrePadre, ApellidoPadre, Telefono, Direccion, DNI) VALUES (2, 8, 'Lucía', 'García', '555-0456', 'Avenida Central 456', '23456789');
INSERT OR IGNORE INTO Padres (IdPadre, IdUsuario, NombrePadre, ApellidoPadre, Telefono, Direccion, DNI) VALUES (3, 9, 'José', 'Martínez', '555-0789', 'Calle Secundaria 789', '34567890');
INSERT OR IGNORE INTO Padres (IdPadre, IdUsuario, NombrePadre, ApellidoPadre, Telefono, Direccion, DNI) VALUES (4, 10, 'Carmen', 'López', '555-0321', 'Plaza Mayor 321', '45678901');

-- Insertar Hijos (Estudiantes) con grados y secciones
-- Primaria
INSERT OR IGNORE INTO Hijos (IdHijo, NombreHijo, ApellidoHijo, FechaNacimiento, Edad, IdPadre, IdGrado, IdSeccion, CodigoEstudiante, Estado) VALUES (1, 'Ana', 'Pérez', '2016-03-15', 8, 1, 3, 5, 'PRI-2024-001', 'Activo');
INSERT OR IGNORE INTO Hijos (IdHijo, NombreHijo, ApellidoHijo, FechaNacimiento, Edad, IdPadre, IdGrado, IdSeccion, CodigoEstudiante, Estado) VALUES (2, 'Luis', 'Pérez', '2014-07-22', 10, 1, 5, 9, 'PRI-2024-002', 'Activo');
INSERT OR IGNORE INTO Hijos (IdHijo, NombreHijo, ApellidoHijo, FechaNacimiento, Edad, IdPadre, IdGrado, IdSeccion, CodigoEstudiante, Estado) VALUES (3, 'Sofia', 'García', '2017-11-08', 7, 2, 2, 3, 'PRI-2024-003', 'Activo');
INSERT OR IGNORE INTO Hijos (IdHijo, NombreHijo, ApellidoHijo, FechaNacimiento, Edad, IdPadre, IdGrado, IdSeccion, CodigoEstudiante, Estado) VALUES (4, 'Diego', 'García', '2015-01-30', 9, 2, 4, 7, 'PRI-2024-004', 'Activo');
INSERT OR IGNORE INTO Hijos (IdHijo, NombreHijo, ApellidoHijo, FechaNacimiento, Edad, IdPadre, IdGrado, IdSeccion, CodigoEstudiante, Estado) VALUES (5, 'Isabella', 'Martínez', '2018-05-12', 6, 3, 1, 1, 'PRI-2024-005', 'Activo');
INSERT OR IGNORE INTO Hijos (IdHijo, NombreHijo, ApellidoHijo, FechaNacimiento, Edad, IdPadre, IdGrado, IdSeccion, CodigoEstudiante, Estado) VALUES (6, 'Mateo', 'López', '2016-09-18', 8, 4, 3, 5, 'PRI-2024-006', 'Activo');
-- Secundaria
INSERT OR IGNORE INTO Hijos (IdHijo, NombreHijo, ApellidoHijo, FechaNacimiento, Edad, IdPadre, IdGrado, IdSeccion, CodigoEstudiante, Estado) VALUES (7, 'Valentina', 'López', '2013-12-03', 11, 4, 7, 13, 'SEC-2024-001', 'Activo');
INSERT OR IGNORE INTO Hijos (IdHijo, NombreHijo, ApellidoHijo, FechaNacimiento, Edad, IdPadre, IdGrado, IdSeccion, CodigoEstudiante, Estado) VALUES (8, 'Sebastián', 'Pérez', '2012-04-25', 12, 1, 8, 15, 'SEC-2024-002', 'Activo');
INSERT OR IGNORE INTO Hijos (IdHijo, NombreHijo, ApellidoHijo, FechaNacimiento, Edad, IdPadre, IdGrado, IdSeccion, CodigoEstudiante, Estado) VALUES (9, 'Camila', 'García', '2011-08-14', 13, 2, 9, 17, 'SEC-2024-003', 'Activo');
INSERT OR IGNORE INTO Hijos (IdHijo, NombreHijo, ApellidoHijo, FechaNacimiento, Edad, IdPadre, IdGrado, IdSeccion, CodigoEstudiante, Estado) VALUES (10, 'Alejandro', 'Martínez', '2010-02-28', 14, 3, 10, 19, 'SEC-2024-004', 'Activo');

-- Estudiantes sin padre asignado (disponibles para vincular)
INSERT OR IGNORE INTO Hijos (IdHijo, NombreHijo, ApellidoHijo, FechaNacimiento, Edad, IdPadre, IdGrado, IdSeccion, CodigoEstudiante, Estado) VALUES (11, 'María', 'Fernández', '2017-06-10', 7, NULL, 2, 4, 'PRI-2024-007', 'Activo');
INSERT OR IGNORE INTO Hijos (IdHijo, NombreHijo, ApellidoHijo, FechaNacimiento, Edad, IdPadre, IdGrado, IdSeccion, CodigoEstudiante, Estado) VALUES (12, 'Carlos', 'Ruiz', '2016-09-25', 8, NULL, 3, 6, 'PRI-2024-008', 'Activo');
INSERT OR IGNORE INTO Hijos (IdHijo, NombreHijo, ApellidoHijo, FechaNacimiento, Edad, IdPadre, IdGrado, IdSeccion, CodigoEstudiante, Estado) VALUES (13, 'Elena', 'Morales', '2015-12-03', 9, NULL, 4, 8, 'PRI-2024-009', 'Activo');
INSERT OR IGNORE INTO Hijos (IdHijo, NombreHijo, ApellidoHijo, FechaNacimiento, Edad, IdPadre, IdGrado, IdSeccion, CodigoEstudiante, Estado) VALUES (14, 'Roberto', 'Jiménez', '2012-03-18', 12, NULL, 8, 16, 'SEC-2024-005', 'Activo');
INSERT OR IGNORE INTO Hijos (IdHijo, NombreHijo, ApellidoHijo, FechaNacimiento, Edad, IdPadre, IdGrado, IdSeccion, CodigoEstudiante, Estado) VALUES (15, 'Lucía', 'Vargas', '2011-11-12', 13, NULL, 9, 18, 'SEC-2024-006', 'Activo');

-- Insertar Asignaciones de Docentes a Materias y Grados
-- Prof. Juan - Matemática Primaria
INSERT OR IGNORE INTO DocenteMateriaGrado (IdAsignacion, IdUsuario, IdMateria, IdGrado, IdSeccion) VALUES (1, 2, 2, 1, 1);
INSERT OR IGNORE INTO DocenteMateriaGrado (IdAsignacion, IdUsuario, IdMateria, IdGrado, IdSeccion) VALUES (2, 2, 2, 2, 3);
INSERT OR IGNORE INTO DocenteMateriaGrado (IdAsignacion, IdUsuario, IdMateria, IdGrado, IdSeccion) VALUES (3, 2, 2, 3, 5);
-- Prof. Laura - Comunicación Primaria
INSERT OR IGNORE INTO DocenteMateriaGrado (IdAsignacion, IdUsuario, IdMateria, IdGrado, IdSeccion) VALUES (4, 3, 1, 1, 1);
INSERT OR IGNORE INTO DocenteMateriaGrado (IdAsignacion, IdUsuario, IdMateria, IdGrado, IdSeccion) VALUES (5, 3, 1, 2, 3);
INSERT OR IGNORE INTO DocenteMateriaGrado (IdAsignacion, IdUsuario, IdMateria, IdGrado, IdSeccion) VALUES (6, 3, 1, 3, 5);
-- Prof. Miguel - Matemática Secundaria
INSERT OR IGNORE INTO DocenteMateriaGrado (IdAsignacion, IdUsuario, IdMateria, IdGrado, IdSeccion) VALUES (7, 4, 10, 7, 13);
INSERT OR IGNORE INTO DocenteMateriaGrado (IdAsignacion, IdUsuario, IdMateria, IdGrado, IdSeccion) VALUES (8, 4, 10, 8, 15);
INSERT OR IGNORE INTO DocenteMateriaGrado (IdAsignacion, IdUsuario, IdMateria, IdGrado, IdSeccion) VALUES (9, 4, 10, 9, 17);
-- Prof. Carmen - Comunicación Secundaria
INSERT OR IGNORE INTO DocenteMateriaGrado (IdAsignacion, IdUsuario, IdMateria, IdGrado, IdSeccion) VALUES (10, 5, 9, 7, 13);
INSERT OR IGNORE INTO DocenteMateriaGrado (IdAsignacion, IdUsuario, IdMateria, IdGrado, IdSeccion) VALUES (11, 5, 9, 8, 15);
INSERT OR IGNORE INTO DocenteMateriaGrado (IdAsignacion, IdUsuario, IdMateria, IdGrado, IdSeccion) VALUES (12, 5, 9, 9, 17);
-- Prof. Roberto - Ciencia y Tecnología
INSERT OR IGNORE INTO DocenteMateriaGrado (IdAsignacion, IdUsuario, IdMateria, IdGrado, IdSeccion) VALUES (13, 6, 4, 4, 7);
INSERT OR IGNORE INTO DocenteMateriaGrado (IdAsignacion, IdUsuario, IdMateria, IdGrado, IdSeccion) VALUES (14, 6, 4, 5, 9);
INSERT OR IGNORE INTO DocenteMateriaGrado (IdAsignacion, IdUsuario, IdMateria, IdGrado, IdSeccion) VALUES (15, 6, 12, 7, 13);
INSERT OR IGNORE INTO DocenteMateriaGrado (IdAsignacion, IdUsuario, IdMateria, IdGrado, IdSeccion) VALUES (16, 6, 12, 8, 15);

-- Insertar Asistencia
INSERT OR IGNORE INTO Asistencia (IdAsistencia, IdHijo, Fecha, Asistio) VALUES (1, 1, '2024-01-15', 1);
INSERT OR IGNORE INTO Asistencia (IdAsistencia, IdHijo, Fecha, Asistio) VALUES (2, 1, '2024-01-16', 1);
INSERT OR IGNORE INTO Asistencia (IdAsistencia, IdHijo, Fecha, Asistio) VALUES (3, 1, '2024-01-17', 0);
INSERT OR IGNORE INTO Asistencia (IdAsistencia, IdHijo, Fecha, Asistio) VALUES (4, 1, '2024-01-18', 1);
INSERT OR IGNORE INTO Asistencia (IdAsistencia, IdHijo, Fecha, Asistio) VALUES (5, 1, '2024-01-19', 1);
INSERT OR IGNORE INTO Asistencia (IdAsistencia, IdHijo, Fecha, Asistio) VALUES (6, 1, '2024-01-22', 0);
INSERT OR IGNORE INTO Asistencia (IdAsistencia, IdHijo, Fecha, Asistio) VALUES (7, 2, '2024-01-15', 1);
INSERT OR IGNORE INTO Asistencia (IdAsistencia, IdHijo, Fecha, Asistio) VALUES (8, 2, '2024-01-16', 1);
INSERT OR IGNORE INTO Asistencia (IdAsistencia, IdHijo, Fecha, Asistio) VALUES (9, 2, '2024-01-17', 1);
INSERT OR IGNORE INTO Asistencia (IdAsistencia, IdHijo, Fecha, Asistio) VALUES (10, 2, '2024-01-18', 1);
INSERT OR IGNORE INTO Asistencia (IdAsistencia, IdHijo, Fecha, Asistio) VALUES (11, 2, '2024-01-19', 1);
INSERT OR IGNORE INTO Asistencia (IdAsistencia, IdHijo, Fecha, Asistio) VALUES (12, 2, '2024-01-22', 1);
INSERT OR IGNORE INTO Asistencia (IdAsistencia, IdHijo, Fecha, Asistio) VALUES (13, 3, '2024-01-15', 1);
INSERT OR IGNORE INTO Asistencia (IdAsistencia, IdHijo, Fecha, Asistio) VALUES (14, 3, '2024-01-16', 1);
INSERT OR IGNORE INTO Asistencia (IdAsistencia, IdHijo, Fecha, Asistio) VALUES (15, 3, '2024-01-17', 1);
INSERT OR IGNORE INTO Asistencia (IdAsistencia, IdHijo, Fecha, Asistio) VALUES (16, 4, '2024-01-15', 1);
INSERT OR IGNORE INTO Asistencia (IdAsistencia, IdHijo, Fecha, Asistio) VALUES (17, 4, '2024-01-16', 0);
INSERT OR IGNORE INTO Asistencia (IdAsistencia, IdHijo, Fecha, Asistio) VALUES (18, 4, '2024-01-17', 1);
INSERT OR IGNORE INTO Asistencia (IdAsistencia, IdHijo, Fecha, Asistio) VALUES (19, 5, '2024-01-15', 1);
INSERT OR IGNORE INTO Asistencia (IdAsistencia, IdHijo, Fecha, Asistio) VALUES (20, 5, '2024-01-16', 1);
INSERT OR IGNORE INTO Asistencia (IdAsistencia, IdHijo, Fecha, Asistio) VALUES (21, 5, '2024-01-17', 1);
INSERT OR IGNORE INTO Asistencia (IdAsistencia, IdHijo, Fecha, Asistio) VALUES (22, 6, '2024-01-15', 1);
INSERT OR IGNORE INTO Asistencia (IdAsistencia, IdHijo, Fecha, Asistio) VALUES (23, 6, '2024-01-16', 1);
INSERT OR IGNORE INTO Asistencia (IdAsistencia, IdHijo, Fecha, Asistio) VALUES (24, 6, '2024-01-17', 1);
INSERT OR IGNORE INTO Asistencia (IdAsistencia, IdHijo, Fecha, Asistio) VALUES (25, 7, '2024-01-15', 0);
INSERT OR IGNORE INTO Asistencia (IdAsistencia, IdHijo, Fecha, Asistio) VALUES (26, 7, '2024-01-16', 1);
INSERT OR IGNORE INTO Asistencia (IdAsistencia, IdHijo, Fecha, Asistio) VALUES (27, 7, '2024-01-17', 1);

-- Insertar Calendario
INSERT OR IGNORE INTO Calendario (IdEvento, Fecha, Descripcion, Tipo) VALUES (1, '2024-02-14', 'Día de San Valentín', 'Festivo');
INSERT OR IGNORE INTO Calendario (IdEvento, Fecha, Descripcion, Tipo) VALUES (2, '2024-03-15', 'Reunión de padres', 'Reunión');
INSERT OR IGNORE INTO Calendario (IdEvento, Fecha, Descripcion, Tipo) VALUES (3, '2024-04-01', 'Vacaciones de Semana Santa', 'Vacaciones');

-- Insertar Citas
INSERT OR IGNORE INTO Citas (IdCita, IdPadre, IdDocente, Fecha, Hora, Descripcion) VALUES (1, 1, 2, '2024-01-20', '14:00', 'Revisión de progreso de Ana');
INSERT OR IGNORE INTO Citas (IdCita, IdPadre, IdDocente, Fecha, Hora, Descripcion) VALUES (2, 1, 2, '2024-01-25', '15:30', 'Consulta sobre Luis');
INSERT OR IGNORE INTO Citas (IdCita, IdPadre, IdDocente, Fecha, Hora, Descripcion) VALUES (3, 2, 2, '2024-01-22', '10:00', 'Revisión de progreso de Sofia');
INSERT OR IGNORE INTO Citas (IdCita, IdPadre, IdDocente, Fecha, Hora, Descripcion) VALUES (4, 2, 2, '2024-01-22', '11:00', 'Consulta sobre Diego');
INSERT OR IGNORE INTO Citas (IdCita, IdPadre, IdDocente, Fecha, Hora, Descripcion) VALUES (5, 3, 2, '2024-01-23', '14:00', 'Reunión sobre Isabella');
INSERT OR IGNORE INTO Citas (IdCita, IdPadre, IdDocente, Fecha, Hora, Descripcion) VALUES (6, 4, 2, '2024-01-23', '15:00', 'Consulta sobre Mateo y Valentina');
INSERT OR IGNORE INTO Citas (IdCita, IdPadre, IdDocente, Fecha, Hora, Descripcion) VALUES (7, 1, 2, '2024-01-24', '16:00', 'Seguimiento de Ana y Luis');

-- Insertar Notas (usando nueva estructura con materias)
-- Notas de Primaria
INSERT OR IGNORE INTO Notas (IdNota, IdHijo, IdMateria, IdUsuario, Unidad, Criterio, Nota, Peso, TipoNota, Fecha) VALUES (1, 1, 2, 2, 'Unidad 1', 'Suma y resta básica', 8.5, 0.3, 'Parcial', '2024-01-15');
INSERT OR IGNORE INTO Notas (IdNota, IdHijo, IdMateria, IdUsuario, Unidad, Criterio, Nota, Peso, TipoNota, Fecha) VALUES (2, 1, 1, 3, 'Unidad 1', 'Lectura comprensiva', 9.0, 0.3, 'Parcial', '2024-01-16');
INSERT OR IGNORE INTO Notas (IdNota, IdHijo, IdMateria, IdUsuario, Unidad, Criterio, Nota, Peso, TipoNota, Fecha) VALUES (3, 1, 2, 2, 'Unidad 2', 'Multiplicación básica', 9.0, 0.3, 'Parcial', '2024-01-18');
INSERT OR IGNORE INTO Notas (IdNota, IdHijo, IdMateria, IdUsuario, Unidad, Criterio, Nota, Peso, TipoNota, Fecha) VALUES (4, 1, 1, 3, 'Unidad 2', 'Escritura creativa', 8.5, 0.3, 'Parcial', '2024-01-19');
INSERT OR IGNORE INTO Notas (IdNota, IdHijo, IdMateria, IdUsuario, Unidad, Criterio, Nota, Peso, TipoNota, Fecha) VALUES (5, 1, 4, 6, 'Unidad 1', 'El cuerpo humano', 7.5, 0.3, 'Parcial', '2024-01-20');
INSERT OR IGNORE INTO Notas (IdNota, IdHijo, IdMateria, IdUsuario, Unidad, Criterio, Nota, Peso, TipoNota, Fecha) VALUES (6, 2, 2, 2, 'Unidad 1', 'Multiplicación', 7.5, 0.3, 'Parcial', '2024-01-15');
INSERT OR IGNORE INTO Notas (IdNota, IdHijo, IdMateria, IdUsuario, Unidad, Criterio, Nota, Peso, TipoNota, Fecha) VALUES (7, 2, 4, 6, 'Unidad 1', 'Plantas y animales', 8.0, 0.3, 'Parcial', '2024-01-17');
INSERT OR IGNORE INTO Notas (IdNota, IdHijo, IdMateria, IdUsuario, Unidad, Criterio, Nota, Peso, TipoNota, Fecha) VALUES (8, 2, 2, 2, 'Unidad 2', 'División', 8.0, 0.3, 'Parcial', '2024-01-18');
INSERT OR IGNORE INTO Notas (IdNota, IdHijo, IdMateria, IdUsuario, Unidad, Criterio, Nota, Peso, TipoNota, Fecha) VALUES (9, 2, 3, 3, 'Unidad 1', 'Civilizaciones antiguas', 9.5, 0.3, 'Parcial', '2024-01-19');
INSERT OR IGNORE INTO Notas (IdNota, IdHijo, IdMateria, IdUsuario, Unidad, Criterio, Nota, Peso, TipoNota, Fecha) VALUES (10, 2, 6, 6, 'Unidad 1', 'Coordinación motora', 8.5, 0.3, 'Parcial', '2024-01-20');
INSERT OR IGNORE INTO Notas (IdNota, IdHijo, IdMateria, IdUsuario, Unidad, Criterio, Nota, Peso, TipoNota, Fecha) VALUES (11, 3, 2, 2, 'Unidad 1', 'Números del 1 al 100', 9.0, 0.3, 'Parcial', '2024-01-15');
INSERT OR IGNORE INTO Notas (IdNota, IdHijo, IdMateria, IdUsuario, Unidad, Criterio, Nota, Peso, TipoNota, Fecha) VALUES (12, 3, 1, 3, 'Unidad 1', 'Lectura de cuentos', 8.0, 0.3, 'Parcial', '2024-01-16');
INSERT OR IGNORE INTO Notas (IdNota, IdHijo, IdMateria, IdUsuario, Unidad, Criterio, Nota, Peso, TipoNota, Fecha) VALUES (13, 4, 2, 2, 'Unidad 1', 'Suma y resta con llevadas', 7.0, 0.3, 'Parcial', '2024-01-15');
INSERT OR IGNORE INTO Notas (IdNota, IdHijo, IdMateria, IdUsuario, Unidad, Criterio, Nota, Peso, TipoNota, Fecha) VALUES (14, 4, 4, 6, 'Unidad 1', 'Los animales', 8.5, 0.3, 'Parcial', '2024-01-16');
INSERT OR IGNORE INTO Notas (IdNota, IdHijo, IdMateria, IdUsuario, Unidad, Criterio, Nota, Peso, TipoNota, Fecha) VALUES (15, 5, 2, 2, 'Unidad 1', 'Números del 1 al 50', 9.5, 0.3, 'Parcial', '2024-01-15');
INSERT OR IGNORE INTO Notas (IdNota, IdHijo, IdMateria, IdUsuario, Unidad, Criterio, Nota, Peso, TipoNota, Fecha) VALUES (16, 5, 5, 5, 'Unidad 1', 'Colores primarios', 10.0, 0.3, 'Parcial', '2024-01-16');
INSERT OR IGNORE INTO Notas (IdNota, IdHijo, IdMateria, IdUsuario, Unidad, Criterio, Nota, Peso, TipoNota, Fecha) VALUES (17, 6, 2, 2, 'Unidad 1', 'Tablas de multiplicar', 8.0, 0.3, 'Parcial', '2024-01-15');
INSERT OR IGNORE INTO Notas (IdNota, IdHijo, IdMateria, IdUsuario, Unidad, Criterio, Nota, Peso, TipoNota, Fecha) VALUES (18, 6, 1, 3, 'Unidad 1', 'Ortografía básica', 7.5, 0.3, 'Parcial', '2024-01-16');
-- Notas de Secundaria
INSERT OR IGNORE INTO Notas (IdNota, IdHijo, IdMateria, IdUsuario, Unidad, Criterio, Nota, Peso, TipoNota, Fecha) VALUES (19, 7, 10, 4, 'Unidad 1', 'Fracciones básicas', 9.0, 0.3, 'Parcial', '2024-01-15');
INSERT OR IGNORE INTO Notas (IdNota, IdHijo, IdMateria, IdUsuario, Unidad, Criterio, Nota, Peso, TipoNota, Fecha) VALUES (20, 7, 12, 6, 'Unidad 1', 'El sistema solar', 8.5, 0.3, 'Parcial', '2024-01-16');
INSERT OR IGNORE INTO Notas (IdNota, IdHijo, IdMateria, IdUsuario, Unidad, Criterio, Nota, Peso, TipoNota, Fecha) VALUES (21, 8, 10, 4, 'Unidad 1', 'Álgebra básica', 8.0, 0.3, 'Parcial', '2024-01-15');
INSERT OR IGNORE INTO Notas (IdNota, IdHijo, IdMateria, IdUsuario, Unidad, Criterio, Nota, Peso, TipoNota, Fecha) VALUES (22, 8, 9, 5, 'Unidad 1', 'Análisis literario', 8.5, 0.3, 'Parcial', '2024-01-16');
INSERT OR IGNORE INTO Notas (IdNota, IdHijo, IdMateria, IdUsuario, Unidad, Criterio, Nota, Peso, TipoNota, Fecha) VALUES (23, 9, 10, 4, 'Unidad 1', 'Geometría', 9.5, 0.3, 'Parcial', '2024-01-15');
INSERT OR IGNORE INTO Notas (IdNota, IdHijo, IdMateria, IdUsuario, Unidad, Criterio, Nota, Peso, TipoNota, Fecha) VALUES (24, 9, 9, 5, 'Unidad 1', 'Redacción', 9.0, 0.3, 'Parcial', '2024-01-16');
INSERT OR IGNORE INTO Notas (IdNota, IdHijo, IdMateria, IdUsuario, Unidad, Criterio, Nota, Peso, TipoNota, Fecha) VALUES (25, 10, 10, 4, 'Unidad 1', 'Trigonometría', 8.5, 0.3, 'Parcial', '2024-01-15');
INSERT OR IGNORE INTO Notas (IdNota, IdHijo, IdMateria, IdUsuario, Unidad, Criterio, Nota, Peso, TipoNota, Fecha) VALUES (26, 10, 9, 5, 'Unidad 1', 'Análisis crítico', 9.5, 0.3, 'Parcial', '2024-01-16');

-- Insertar Horarios de Materias
-- Matemática Primaria (ID 2) - Lunes a Viernes
INSERT OR IGNORE INTO HorariosMaterias (IdHorario, IdMateria, DiaSemana, HoraInicio, HoraFin) VALUES (1, 2, 'Lunes', '08:00', '09:00');
INSERT OR IGNORE INTO HorariosMaterias (IdHorario, IdMateria, DiaSemana, HoraInicio, HoraFin) VALUES (2, 2, 'Miércoles', '08:00', '09:00');
INSERT OR IGNORE INTO HorariosMaterias (IdHorario, IdMateria, DiaSemana, HoraInicio, HoraFin) VALUES (3, 2, 'Viernes', '08:00', '09:00');

-- Comunicación Primaria (ID 1) - Lunes a Viernes
INSERT OR IGNORE INTO HorariosMaterias (IdHorario, IdMateria, DiaSemana, HoraInicio, HoraFin) VALUES (4, 1, 'Lunes', '09:00', '10:00');
INSERT OR IGNORE INTO HorariosMaterias (IdHorario, IdMateria, DiaSemana, HoraInicio, HoraFin) VALUES (5, 1, 'Miércoles', '09:00', '10:00');
INSERT OR IGNORE INTO HorariosMaterias (IdHorario, IdMateria, DiaSemana, HoraInicio, HoraFin) VALUES (6, 1, 'Viernes', '09:00', '10:00');

-- Matemática Secundaria (ID 10) - Lunes a Viernes
INSERT OR IGNORE INTO HorariosMaterias (IdHorario, IdMateria, DiaSemana, HoraInicio, HoraFin) VALUES (7, 10, 'Lunes', '10:00', '11:00');
INSERT OR IGNORE INTO HorariosMaterias (IdHorario, IdMateria, DiaSemana, HoraInicio, HoraFin) VALUES (8, 10, 'Miércoles', '10:00', '11:00');
INSERT OR IGNORE INTO HorariosMaterias (IdHorario, IdMateria, DiaSemana, HoraInicio, HoraFin) VALUES (9, 10, 'Viernes', '10:00', '11:00');

-- Comunicación Secundaria (ID 9) - Lunes a Viernes
INSERT OR IGNORE INTO HorariosMaterias (IdHorario, IdMateria, DiaSemana, HoraInicio, HoraFin) VALUES (10, 9, 'Martes', '08:00', '09:00');
INSERT OR IGNORE INTO HorariosMaterias (IdHorario, IdMateria, DiaSemana, HoraInicio, HoraFin) VALUES (11, 9, 'Jueves', '08:00', '09:00');

-- Educación Física Primaria (ID 6) - Martes y Jueves
INSERT OR IGNORE INTO HorariosMaterias (IdHorario, IdMateria, DiaSemana, HoraInicio, HoraFin) VALUES (12, 6, 'Martes', '11:00', '12:00');
INSERT OR IGNORE INTO HorariosMaterias (IdHorario, IdMateria, DiaSemana, HoraInicio, HoraFin) VALUES (13, 6, 'Jueves', '11:00', '12:00');

-- Inglés Primaria (ID 8) - Sábado (opcional)
INSERT OR IGNORE INTO HorariosMaterias (IdHorario, IdMateria, DiaSemana, HoraInicio, HoraFin) VALUES (14, 8, 'Sábado', '08:00', '10:00');

-- Datos adicionales para pruebas ampliadas
-- Usuarios adicionales (docentes y padres)
INSERT OR IGNORE INTO Usuarios (IdUsuario, Usuario, Contraseña, IdRol, Nombre, Apellido, Email, Telefono) VALUES (11, 'profsandra', '123456', 2, 'Sandra', 'Torres', 'sandra.torres@colegio.edu.pe', '555-0106');
INSERT OR IGNORE INTO Usuarios (IdUsuario, Usuario, Contraseña, IdRol, Nombre, Apellido, Email, Telefono) VALUES (12, 'profandres', '123456', 2, 'Andrés', 'Rojas', 'andres.rojas@colegio.edu.pe', '555-0107');
INSERT OR IGNORE INTO Usuarios (IdUsuario, Usuario, Contraseña, IdRol, Nombre, Apellido, Email, Telefono) VALUES (13, 'papamarco', '123456', 3, 'Marco', 'Guzmán', 'marco.guzman@email.com', '555-0205');

-- Valores por defecto de configuración del sistema (colegio y académica)
INSERT OR IGNORE INTO Settings(Key, Value) VALUES
('SCHOOL_NAME', 'Portal Padres'),
('SCHOOL_ADDRESS', 'Av. Principal 123, Lima'),
('SCHOOL_PHONE', '+51 01 555-0000'),
('SCHOOL_EMAIL', 'info@colegio.edu.pe'),
('ACADEMIC_YEAR', '2025'),
('CURRENT_BIMESTER', '1'),
('MAX_STUDENTS_PER_CLASS', '30'),
('ATTENDANCE_THRESHOLD', '80');

-- Insertar Conceptos de Pago
-- Matrículas por nivel
INSERT OR IGNORE INTO ConceptosPago (IdConcepto, NombreConcepto, Descripcion, Monto, TipoConcepto, DuracionMeses, IdNivel) VALUES (1, 'Matrícula Primaria', 'Matrícula anual para estudiantes de primaria', 250.00, 'Matricula', NULL, 1);
INSERT OR IGNORE INTO ConceptosPago (IdConcepto, NombreConcepto, Descripcion, Monto, TipoConcepto, DuracionMeses, IdNivel) VALUES (2, 'Matrícula Secundaria', 'Matrícula anual para estudiantes de secundaria', 300.00, 'Matricula', NULL, 2);

-- Planes de pensión por nivel (1, 2, 3, 12 meses)
INSERT OR IGNORE INTO ConceptosPago (IdConcepto, NombreConcepto, Descripcion, Monto, TipoConcepto, DuracionMeses, IdNivel) VALUES (3, 'Pensión Primaria 1 mes', 'Pago de 1 mes (Primaria)', 150.00, 'Mensualidad', 1, 1);
INSERT OR IGNORE INTO ConceptosPago (IdConcepto, NombreConcepto, Descripcion, Monto, TipoConcepto, DuracionMeses, IdNivel) VALUES (4, 'Pensión Primaria 2 meses', 'Pago de 2 meses (Primaria)', 300.00, 'Mensualidad', 2, 1);
INSERT OR IGNORE INTO ConceptosPago (IdConcepto, NombreConcepto, Descripcion, Monto, TipoConcepto, DuracionMeses, IdNivel) VALUES (5, 'Pensión Primaria 3 meses', 'Pago de 3 meses (Primaria)', 450.00, 'Mensualidad', 3, 1);
INSERT OR IGNORE INTO ConceptosPago (IdConcepto, NombreConcepto, Descripcion, Monto, TipoConcepto, DuracionMeses, IdNivel) VALUES (6, 'Pensión Primaria 12 meses', 'Pago anual 12 meses (Primaria)', 1800.00, 'Mensualidad', 12, 1);

INSERT OR IGNORE INTO ConceptosPago (IdConcepto, NombreConcepto, Descripcion, Monto, TipoConcepto, DuracionMeses, IdNivel) VALUES (7, 'Pensión Secundaria 1 mes', 'Pago de 1 mes (Secundaria)', 180.00, 'Mensualidad', 1, 2);
INSERT OR IGNORE INTO ConceptosPago (IdConcepto, NombreConcepto, Descripcion, Monto, TipoConcepto, DuracionMeses, IdNivel) VALUES (8, 'Pensión Secundaria 2 meses', 'Pago de 2 meses (Secundaria)', 360.00, 'Mensualidad', 2, 2);
INSERT OR IGNORE INTO ConceptosPago (IdConcepto, NombreConcepto, Descripcion, Monto, TipoConcepto, DuracionMeses, IdNivel) VALUES (9, 'Pensión Secundaria 3 meses', 'Pago de 3 meses (Secundaria)', 540.00, 'Mensualidad', 3, 2);
INSERT OR IGNORE INTO ConceptosPago (IdConcepto, NombreConcepto, Descripcion, Monto, TipoConcepto, DuracionMeses, IdNivel) VALUES (10, 'Pensión Secundaria 12 meses', 'Pago anual 12 meses (Secundaria)', 2160.00, 'Mensualidad', 12, 2);
INSERT OR IGNORE INTO Usuarios (IdUsuario, Usuario, Contraseña, IdRol, Nombre, Apellido, Email, Telefono) VALUES (14, 'mamapaula', '123456', 3, 'Paula', 'Navarro', 'paula.navarro@email.com', '555-0206');

-- Padres adicionales
INSERT OR IGNORE INTO Padres (IdPadre, IdUsuario, NombrePadre, ApellidoPadre, Telefono, Direccion, DNI) VALUES (5, 13, 'Marco', 'Guzmán', '555-0220', 'Av. Los Héroes 123', '56789012');
INSERT OR IGNORE INTO Padres (IdPadre, IdUsuario, NombrePadre, ApellidoPadre, Telefono, Direccion, DNI) VALUES (6, 14, 'Paula', 'Navarro', '555-0221', 'Jr. Las Flores 456', '67890123');

-- Hijos adicionales (vinculados y sin vincular)
INSERT OR IGNORE INTO Hijos (IdHijo, NombreHijo, ApellidoHijo, FechaNacimiento, Edad, IdPadre, IdGrado, IdSeccion, CodigoEstudiante, Estado) VALUES (16, 'Bruno', 'Guzmán', '2015-04-02', 9, 5, 4, 7, 'PRI-2024-010', 'Activo');
INSERT OR IGNORE INTO Hijos (IdHijo, NombreHijo, ApellidoHijo, FechaNacimiento, Edad, IdPadre, IdGrado, IdSeccion, CodigoEstudiante, Estado) VALUES (17, 'Lucero', 'Guzmán', '2017-10-19', 7, 5, 2, 4, 'PRI-2024-011', 'Activo');
INSERT OR IGNORE INTO Hijos (IdHijo, NombreHijo, ApellidoHijo, FechaNacimiento, Edad, IdPadre, IdGrado, IdSeccion, CodigoEstudiante, Estado) VALUES (18, 'Renato', 'Navarro', '2013-02-05', 11, 6, 9, 17, 'SEC-2024-007', 'Activo');
INSERT OR IGNORE INTO Hijos (IdHijo, NombreHijo, ApellidoHijo, FechaNacimiento, Edad, IdPadre, IdGrado, IdSeccion, CodigoEstudiante, Estado) VALUES (19, 'Adriana', 'Navarro', '2012-08-25', 12, 6, 10, 19, 'SEC-2024-008', 'Activo');
INSERT OR IGNORE INTO Hijos (IdHijo, NombreHijo, ApellidoHijo, FechaNacimiento, Edad, IdPadre, IdGrado, IdSeccion, CodigoEstudiante, Estado) VALUES (20, 'Patricia', 'Campos', '2016-01-12', 8, NULL, 3, 6, 'PRI-2024-012', 'Activo');
INSERT OR IGNORE INTO Hijos (IdHijo, NombreHijo, ApellidoHijo, FechaNacimiento, Edad, IdPadre, IdGrado, IdSeccion, CodigoEstudiante, Estado) VALUES (21, 'Jorge', 'Salas', '2011-09-03', 13, NULL, 9, 18, 'SEC-2024-009', 'Activo');

-- Asignaciones para nuevos docentes
INSERT OR IGNORE INTO DocenteMateriaGrado (IdAsignacion, IdUsuario, IdMateria, IdGrado, IdSeccion) VALUES (17, 11, 3, 4, 7);
INSERT OR IGNORE INTO DocenteMateriaGrado (IdAsignacion, IdUsuario, IdMateria, IdGrado, IdSeccion) VALUES (18, 11, 5, 5, 9);
INSERT OR IGNORE INTO DocenteMateriaGrado (IdAsignacion, IdUsuario, IdMateria, IdGrado, IdSeccion) VALUES (19, 12, 12, 7, 13);
INSERT OR IGNORE INTO DocenteMateriaGrado (IdAsignacion, IdUsuario, IdMateria, IdGrado, IdSeccion) VALUES (20, 12, 12, 8, 15);
INSERT OR IGNORE INTO DocenteMateriaGrado (IdAsignacion, IdUsuario, IdMateria, IdGrado, IdSeccion) VALUES (21, 12, 10, 10, 19);
INSERT OR IGNORE INTO DocenteMateriaGrado (IdAsignacion, IdUsuario, IdMateria, IdGrado, IdSeccion) VALUES (22, 11, 1, 6, 11);

-- Asistencia adicional
INSERT OR IGNORE INTO Asistencia (IdAsistencia, IdHijo, Fecha, Asistio) VALUES (28, 16, '2024-01-15', 1);
INSERT OR IGNORE INTO Asistencia (IdAsistencia, IdHijo, Fecha, Asistio) VALUES (29, 16, '2024-01-16', 0);
INSERT OR IGNORE INTO Asistencia (IdAsistencia, IdHijo, Fecha, Asistio) VALUES (30, 17, '2024-01-15', 1);
INSERT OR IGNORE INTO Asistencia (IdAsistencia, IdHijo, Fecha, Asistio) VALUES (31, 18, '2024-01-15', 1);
INSERT OR IGNORE INTO Asistencia (IdAsistencia, IdHijo, Fecha, Asistio) VALUES (32, 18, '2024-01-16', 1);
INSERT OR IGNORE INTO Asistencia (IdAsistencia, IdHijo, Fecha, Asistio) VALUES (33, 18, '2024-01-17', 0);
INSERT OR IGNORE INTO Asistencia (IdAsistencia, IdHijo, Fecha, Asistio) VALUES (34, 19, '2024-01-15', 1);
INSERT OR IGNORE INTO Asistencia (IdAsistencia, IdHijo, Fecha, Asistio) VALUES (35, 19, '2024-01-16', 1);
INSERT OR IGNORE INTO Asistencia (IdAsistencia, IdHijo, Fecha, Asistio) VALUES (36, 20, '2024-01-15', 1);
INSERT OR IGNORE INTO Asistencia (IdAsistencia, IdHijo, Fecha, Asistio) VALUES (37, 20, '2024-01-16', 1);
INSERT OR IGNORE INTO Asistencia (IdAsistencia, IdHijo, Fecha, Asistio) VALUES (38, 21, '2024-01-15', 0);
INSERT OR IGNORE INTO Asistencia (IdAsistencia, IdHijo, Fecha, Asistio) VALUES (39, 21, '2024-01-16', 1);

-- Notas adicionales
INSERT OR IGNORE INTO Notas (IdNota, IdHijo, IdMateria, IdUsuario, Unidad, Criterio, Nota, Peso, TipoNota, Fecha) VALUES (27, 16, 3, 11, 'Unidad 1', 'Historia del Perú', 8.0, 0.3, 'Parcial', '2024-01-18');
INSERT OR IGNORE INTO Notas (IdNota, IdHijo, IdMateria, IdUsuario, Unidad, Criterio, Nota, Peso, TipoNota, Fecha) VALUES (28, 16, 5, 11, 'Unidad 1', 'Dibujo y color', 9.0, 0.3, 'Parcial', '2024-01-19');
INSERT OR IGNORE INTO Notas (IdNota, IdHijo, IdMateria, IdUsuario, Unidad, Criterio, Nota, Peso, TipoNota, Fecha) VALUES (29, 17, 2, 2, 'Unidad 1', 'Suma y resta', 8.5, 0.3, 'Parcial', '2024-01-18');
INSERT OR IGNORE INTO Notas (IdNota, IdHijo, IdMateria, IdUsuario, Unidad, Criterio, Nota, Peso, TipoNota, Fecha) VALUES (30, 18, 12, 12, 'Unidad 1', 'Física básica', 7.5, 0.3, 'Parcial', '2024-01-16');
INSERT OR IGNORE INTO Notas (IdNota, IdHijo, IdMateria, IdUsuario, Unidad, Criterio, Nota, Peso, TipoNota, Fecha) VALUES (31, 18, 10, 12, 'Unidad 1', 'Ecuaciones', 8.0, 0.3, 'Parcial', '2024-01-17');
INSERT OR IGNORE INTO Notas (IdNota, IdHijo, IdMateria, IdUsuario, Unidad, Criterio, Nota, Peso, TipoNota, Fecha) VALUES (32, 19, 9, 5, 'Unidad 1', 'Lectura crítica', 9.0, 0.3, 'Parcial', '2024-01-16');
INSERT OR IGNORE INTO Notas (IdNota, IdHijo, IdMateria, IdUsuario, Unidad, Criterio, Nota, Peso, TipoNota, Fecha) VALUES (33, 19, 10, 4, 'Unidad 1', 'Geometría plana', 8.5, 0.3, 'Parcial', '2024-01-17');
INSERT OR IGNORE INTO Notas (IdNota, IdHijo, IdMateria, IdUsuario, Unidad, Criterio, Nota, Peso, TipoNota, Fecha) VALUES (34, 20, 2, 2, 'Unidad 1', 'División', 7.5, 0.3, 'Parcial', '2024-01-18');
INSERT OR IGNORE INTO Notas (IdNota, IdHijo, IdMateria, IdUsuario, Unidad, Criterio, Nota, Peso, TipoNota, Fecha) VALUES (35, 21, 10, 4, 'Unidad 1', 'Trigonometría', 8.0, 0.3, 'Parcial', '2024-01-18');
INSERT OR IGNORE INTO Notas (IdNota, IdHijo, IdMateria, IdUsuario, Unidad, Criterio, Nota, Peso, TipoNota, Fecha) VALUES (36, 21, 9, 5, 'Unidad 1', 'Reseña literaria', 8.5, 0.3, 'Parcial', '2024-01-19');

-- Horarios adicionales
INSERT OR IGNORE INTO HorariosMaterias (IdHorario, IdMateria, DiaSemana, HoraInicio, HoraFin) VALUES (15, 12, 'Martes', '10:00', '11:00');
INSERT OR IGNORE INTO HorariosMaterias (IdHorario, IdMateria, DiaSemana, HoraInicio, HoraFin) VALUES (16, 12, 'Jueves', '10:00', '11:00');
INSERT OR IGNORE INTO HorariosMaterias (IdHorario, IdMateria, DiaSemana, HoraInicio, HoraFin) VALUES (17, 3, 'Martes', '09:00', '10:00');
INSERT OR IGNORE INTO HorariosMaterias (IdHorario, IdMateria, DiaSemana, HoraInicio, HoraFin) VALUES (18, 3, 'Jueves', '09:00', '10:00');

-- Facturas de prueba (deudas) para papacarlos (IdPadre = 1) mes actual 2025-10
-- Ana Pérez (IdHijo = 1) - Pensión Primaria 1 mes (S/ 150)
INSERT OR IGNORE INTO Facturas (
  IdFactura, IdPadre, IdHijo, NumeroFactura, FechaEmision, FechaVencimiento, Estado, Subtotal, Descuento, Total, Observaciones
) VALUES (
  1, 1, 1, 'FAC-2025-10-0001', '2025-10-05', '2025-10-30', 'Pendiente', 150.00, 0.00, 150.00, 'Pensión Primaria 1 mes - Octubre'
);
INSERT OR IGNORE INTO DetalleFactura (
  IdDetalle, IdFactura, IdConcepto, Cantidad, PrecioUnitario, Subtotal
) VALUES (
  1, 1, 3, 1, 150.00, 150.00
);

-- Luis Pérez (IdHijo = 2) - Pensión Primaria 1 mes (S/ 150)
INSERT OR IGNORE INTO Facturas (
  IdFactura, IdPadre, IdHijo, NumeroFactura, FechaEmision, FechaVencimiento, Estado, Subtotal, Descuento, Total, Observaciones
) VALUES (
  2, 1, 2, 'FAC-2025-10-0002', '2025-10-05', '2025-10-30', 'Pendiente', 150.00, 0.00, 150.00, 'Pensión Primaria 1 mes - Octubre'
);
INSERT OR IGNORE INTO DetalleFactura (
  IdDetalle, IdFactura, IdConcepto, Cantidad, PrecioUnitario, Subtotal
) VALUES (
  2, 2, 3, 1, 150.00, 150.00
);