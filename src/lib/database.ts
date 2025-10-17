import sqlite3 from 'sqlite3'
import { promisify } from 'util'
import path from 'path'
import fs from 'fs'

interface UserData {
  usuario: string
  contraseña: string
  idRol: number
  nombre?: string
  apellido?: string
  email?: string
  telefono?: string
}

interface StudentData {
  nombreHijo: string
  apellidoHijo: string
  fechaNacimiento: string
  edad: number
  idPadre?: number
  idGrado?: number
  idSeccion?: number
  codigoEstudiante?: string
  estado?: string
}

export class Database {
  private db: sqlite3.Database
  public run: (sql: string, params?: unknown[]) => Promise<sqlite3.RunResult>
  public get: (sql: string, params?: unknown[]) => Promise<unknown>
  public all: (sql: string, params?: unknown[]) => Promise<unknown[]>
  
  // Helper para obtener lastID/changes de operaciones de escritura
  public runWithInfo(sql: string, params: unknown[] = []): Promise<{ lastID: number; changes: number }> {
    return new Promise((resolve, reject) => {
      // Usamos function() para acceder a this.lastID del Statement
      this.db.run(sql, params as unknown[], function (this: sqlite3.RunResult, err: Error | null) {
        if (err) {
          reject(err)
          return
        }
        resolve({ lastID: (this as unknown as sqlite3.RunResult).lastID, changes: (this as unknown as sqlite3.RunResult).changes })
      })
    })
  }

  // ===== Settings (key/value) =====
  private async ensureSettingsTable() {
    const createSql = `
      CREATE TABLE IF NOT EXISTS Settings (
        Key TEXT PRIMARY KEY,
        Value TEXT
      )
    `
    await this.run(createSql)
  }

  async setSetting(key: string, value: string) {
    await this.ensureSettingsTable()
    const upsert = `INSERT INTO Settings (Key, Value) VALUES (?, ?) ON CONFLICT(Key) DO UPDATE SET Value=excluded.Value`
    await this.run(upsert, [key, value])
  }

  async getSetting(key: string): Promise<string | null> {
    await this.ensureSettingsTable()
    const row = (await this.get(`SELECT Value FROM Settings WHERE Key = ?`, [key])) as { Value?: string } | undefined
    return row && typeof row.Value === 'string' ? row.Value : null
  }

  constructor() {
    const dbPath = path.join(process.cwd(), 'database', 'portal_padres.db')
    const sqlPath = path.join(process.cwd(), 'database', 'schema.sql')
    
    // Si no existe la base de datos, compilarla desde schema.sql
    if (!fs.existsSync(dbPath)) {
      if (fs.existsSync(sqlPath)) {
        console.log('🔍 Base de datos no encontrada, compilando desde schema.sql...')
        this.compileDatabaseSync(dbPath, sqlPath)
      } else {
        console.error('❌ Ni la base de datos ni schema.sql existen')
        throw new Error('Base de datos no encontrada')
      }
    }
    
    this.db = new sqlite3.Database(dbPath)
    this.run = promisify(this.db.run.bind(this.db))
    this.get = promisify(this.db.get.bind(this.db))
    this.all = promisify(this.db.all.bind(this.db))
  }

  private compileDatabaseSync(dbPath: string, sqlPath: string) {
    const sqlContent = fs.readFileSync(sqlPath, 'utf8')
    const tempDb = new sqlite3.Database(dbPath)
    
    tempDb.exec(sqlContent, (err) => {
      if (err) {
        console.error('❌ Error compilando base de datos:', err.message)
        throw err
      }
      console.log('✅ Base de datos compilada exitosamente desde schema.sql')
      tempDb.close()
    })
  }

  async getUserByCredentials(username: string, password: string) {
    try {
      const query = `
        SELECT u.*, r.NombreRol 
        FROM Usuarios u 
        JOIN Roles r ON u.IdRol = r.IdRol 
        WHERE u.Usuario = ? AND u.Contraseña = ?
      `
      const user = await this.get(query, [username, password])
      return user
    } catch (error) {
      console.error('Error al buscar usuario:', error)
      return null
    }
  }

  async getUserById(id: number) {
    try {
      const query = `
        SELECT u.*, r.NombreRol 
        FROM Usuarios u 
        JOIN Roles r ON u.IdRol = r.IdRol 
        WHERE u.IdUsuario = ?
      `
      const user = await this.get(query, [id])
      return user
    } catch (error) {
      console.error('Error al buscar usuario por ID:', error)
      return null
    }
  }

  async isUsernameAvailable(username: string) {
    try {
      const query = 'SELECT IdUsuario FROM Usuarios WHERE Usuario = ?'
      const user = await this.get(query, [username])
      return !user
    } catch (error) {
      console.error('Error al verificar disponibilidad del nombre de usuario:', error)
      return false
    }
  }

  async getAllUsers() {
    try {
      const query = `
        SELECT u.*, r.NombreRol 
        FROM Usuarios u 
        JOIN Roles r ON u.IdRol = r.IdRol 
        ORDER BY u.IdUsuario
      `
      const users = await this.all(query)
      return users
    } catch (error) {
      console.error('Error al obtener usuarios:', error)
      return []
    }
  }

  async createUser(userData: UserData) {
    try {
      const query = `
        INSERT INTO Usuarios (Usuario, Contraseña, IdRol, Nombre, Apellido, Email, Telefono)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `
      const result = await this.runWithInfo(query, [
        userData.usuario,
        userData.contraseña,
        userData.idRol,
        userData.nombre || null,
        userData.apellido || null,
        userData.email || null,
        userData.telefono || null
      ])
      return result
    } catch (error) {
      console.error('Error al crear usuario:', error)
      throw error
    }
  }

  async updateUser(id: number, userData: UserData) {
    try {
      const query = `
        UPDATE Usuarios 
        SET Usuario = ?, Contraseña = ?, IdRol = ?, Nombre = ?, Apellido = ?, Email = ?, Telefono = ?
        WHERE IdUsuario = ?
      `
      const result = await this.run(query, [
        userData.usuario,
        userData.contraseña,
        userData.idRol,
        userData.nombre || null,
        userData.apellido || null,
        userData.email || null,
        userData.telefono || null,
        id
      ])
      return result
    } catch (error) {
      console.error('Error al actualizar usuario:', error)
      throw error
    }
  }

  async deleteUser(id: number) {
    try {
      const query = 'DELETE FROM Usuarios WHERE IdUsuario = ?'
      const result = await this.run(query, [id])
      return result
    } catch (error) {
      console.error('Error al eliminar usuario:', error)
      throw error
    }
  }

  // Métodos para alumnos
  async getAllAlumnos() {
    try {
      const query = `
        SELECT h.*, p.IdPadre, u.Usuario as PadreUsuario, 
               g.NombreGrado, s.NombreSeccion, n.NombreNivel
        FROM Hijos h
        JOIN Padres p ON h.IdPadre = p.IdPadre
        JOIN Usuarios u ON p.IdUsuario = u.IdUsuario
        LEFT JOIN Grados g ON h.IdGrado = g.IdGrado
        LEFT JOIN Secciones s ON h.IdSeccion = s.IdSeccion
        LEFT JOIN Niveles n ON g.IdNivel = n.IdNivel
        ORDER BY n.Orden, g.NumeroGrado, s.NombreSeccion, h.ApellidoHijo, h.NombreHijo
      `
      const alumnos = await this.all(query)
      return alumnos
    } catch (error) {
      console.error('Error al obtener alumnos:', error)
      return []
    }
  }

  // Métodos para docentes
  async getAllDocentes() {
    try {
      const query = `
        SELECT u.*, r.NombreRol
        FROM Usuarios u
        JOIN Roles r ON u.IdRol = r.IdRol
        WHERE u.IdRol = 2
        ORDER BY u.IdUsuario
      `
      const docentes = await this.all(query)
      return docentes
    } catch (error) {
      console.error('Error al obtener docentes:', error)
      return []
    }
  }

  // Métodos para padres
  async getAllPadres() {
    try {
      const query = `
        SELECT u.*, r.NombreRol
        FROM Usuarios u
        JOIN Roles r ON u.IdRol = r.IdRol
        WHERE u.IdRol = 3
        ORDER BY u.IdUsuario
      `
      const padres = await this.all(query)
      return padres
    } catch (error) {
      console.error('Error al obtener padres:', error)
      return []
    }
  }

  // Obtener estudiantes disponibles (sin padre asignado)
  async getAvailableStudents() {
    try {
      const query = `
        SELECT h.*
        FROM Hijos h
        WHERE h.IdPadre IS NULL
        ORDER BY h.NombreHijo
      `
      const estudiantes = await this.all(query)
      return estudiantes
    } catch (error) {
      console.error('Error al obtener estudiantes disponibles:', error)
      return []
    }
  }

  // Obtener estudiantes de un padre específico
  async getStudentsByParent(parentId: number) {
    try {
      const query = `
        SELECT 
          h.IdHijo,
          h.NombreHijo,
          h.ApellidoHijo,
          h.FechaNacimiento,
          h.Edad,
          h.CodigoEstudiante,
          h.Estado,
          g.NombreGrado,
          s.NombreSeccion,
          n.NombreNivel
        FROM Hijos h
        LEFT JOIN Grados g ON h.IdGrado = g.IdGrado
        LEFT JOIN Secciones s ON h.IdSeccion = s.IdSeccion
        LEFT JOIN Niveles n ON g.IdNivel = n.IdNivel
        WHERE h.IdPadre = ?
        ORDER BY h.NombreHijo
      `
      const estudiantes = await this.all(query, [parentId])
      return estudiantes
    } catch (error) {
      console.error('Error al obtener estudiantes del padre:', error)
      return []
    }
  }

  // Vincular estudiante con padre
  async linkStudentToParent(studentId: number, parentId: number) {
    try {
      const query = `
        UPDATE Hijos 
        SET IdPadre = ?
        WHERE IdHijo = ?
      `
      const result = await this.run(query, [parentId, studentId])
      return result
    } catch (error) {
      console.error('Error al vincular estudiante con padre:', error)
      throw error
    }
  }

  // Desvincular estudiante de padre
  async unlinkStudentFromParent(studentId: number) {
    try {
      const query = `
        UPDATE Hijos 
        SET IdPadre = NULL
        WHERE IdHijo = ?
      `
      const result = await this.run(query, [studentId])
      return result
    } catch (error) {
      console.error('Error al desvincular estudiante:', error)
      throw error
    }
  }

  // Crear estudiante
  async createStudent(studentData: StudentData) {
    try {
      console.log('Creando estudiante en base de datos con datos:', JSON.stringify(studentData, null, 2))
      
      const query = `
        INSERT INTO Hijos (NombreHijo, ApellidoHijo, FechaNacimiento, Edad, IdPadre, IdGrado, IdSeccion, CodigoEstudiante, Estado)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `
      
      const params = [
        studentData.nombreHijo,
        studentData.apellidoHijo,
        studentData.fechaNacimiento,
        studentData.edad,
        studentData.idPadre || null,
        studentData.idGrado || null,
        studentData.idSeccion || null,
        studentData.codigoEstudiante || null,
        studentData.estado || 'Activo'
      ]
      
      console.log('Ejecutando query con parámetros:', { query, params })
      
      const result = await this.runWithInfo(query, params)
      console.log('Resultado de la inserción:', result)
      
      return result
    } catch (error) {
      console.error('Error al crear estudiante en base de datos:', error)
      console.error('Datos que causaron el error:', JSON.stringify(studentData, null, 2))
      throw error
    }
  }

  // Obtener todos los grados
  async getAllGrados() {
    try {
      const query = `
        SELECT g.*, n.NombreNivel
        FROM Grados g
        JOIN Niveles n ON g.IdNivel = n.IdNivel
        ORDER BY n.Orden, g.NumeroGrado
      `
      const grados = await this.all(query)
      return grados
    } catch (error) {
      console.error('Error al obtener grados:', error)
      return []
    }
  }

  // Obtener secciones por grado
  async getSeccionesByGrado(gradoId: number) {
    try {
      const query = `
        SELECT s.*, g.NombreGrado
        FROM Secciones s
        JOIN Grados g ON s.IdGrado = g.IdGrado
        WHERE s.IdGrado = ?
        ORDER BY s.NombreSeccion
      `
      const secciones = await this.all(query, [gradoId])
      return secciones
    } catch (error) {
      console.error('Error al obtener secciones:', error)
      return []
    }
  }

  // Obtener todas las materias
  async getAllMaterias() {
    try {
      const query = `
        SELECT m.*, n.NombreNivel
        FROM Materias m
        JOIN Niveles n ON m.IdNivel = n.IdNivel
        ORDER BY n.Orden, m.NombreMateria
      `
      const materias = await this.all(query)
      return materias
    } catch (error) {
      console.error('Error al obtener materias:', error)
      return []
    }
  }

  // Obtener materias por grado
  async getMateriasByGrado(gradoId: number) {
    try {
      const query = `
        SELECT m.*, n.NombreNivel
        FROM Materias m
        JOIN Niveles n ON m.IdNivel = n.IdNivel
        JOIN Grados g ON n.IdNivel = g.IdNivel
        WHERE g.IdGrado = ?
        ORDER BY m.NombreMateria
      `
      const materias = await this.all(query, [gradoId])
      return materias
    } catch (error) {
      console.error('Error al obtener materias por grado:', error)
      return []
    }
  }

  // Obtener estudiantes por grado y sección
  async getStudentsByGradeAndSection(gradoId: number, seccionId: number) {
    try {
      const query = `
        SELECT h.*, p.NombrePadre, p.ApellidoPadre, u.Usuario as PadreUsuario,
               g.NombreGrado, s.NombreSeccion, n.NombreNivel
        FROM Hijos h
        JOIN Padres p ON h.IdPadre = p.IdPadre
        JOIN Usuarios u ON p.IdUsuario = u.IdUsuario
        LEFT JOIN Grados g ON h.IdGrado = g.IdGrado
        LEFT JOIN Secciones s ON h.IdSeccion = s.IdSeccion
        LEFT JOIN Niveles n ON g.IdNivel = n.IdNivel
        WHERE h.IdGrado = ? AND h.IdSeccion = ?
        ORDER BY h.ApellidoHijo, h.NombreHijo
      `
      const estudiantes = await this.all(query, [gradoId, seccionId])
      return estudiantes
    } catch (error) {
      console.error('Error al obtener estudiantes por grado y sección:', error)
      return []
    }
  }

  // Obtener notas de un estudiante con información de materias
  async getNotasByStudent(studentId: number) {
    try {
      const query = `
        SELECT n.*, m.NombreMateria, u.Nombre as DocenteNombre, u.Apellido as DocenteApellido
        FROM Notas n
        JOIN Materias m ON n.IdMateria = m.IdMateria
        JOIN Usuarios u ON n.IdUsuario = u.IdUsuario
        WHERE n.IdHijo = ?
        ORDER BY n.Fecha DESC, m.NombreMateria
      `
      const notas = await this.all(query, [studentId])
      return notas
    } catch (error) {
      console.error('Error al obtener notas del estudiante:', error)
      return []
    }
  }

  // Obtener estadísticas del dashboard actualizadas
  async getDashboardStats() {
    try {
      const totalUsers = await this.get('SELECT COUNT(*) as count FROM Usuarios') as { count: number }
      const totalStudents = await this.get('SELECT COUNT(*) as count FROM Hijos WHERE Estado = "Activo"') as { count: number }
      const totalTeachers = await this.get('SELECT COUNT(*) as count FROM Usuarios WHERE IdRol = 2') as { count: number }
      const totalParents = await this.get('SELECT COUNT(*) as count FROM Usuarios WHERE IdRol = 3') as { count: number }
      const totalGrados = await this.get('SELECT COUNT(*) as count FROM Grados') as { count: number }
      const totalMaterias = await this.get('SELECT COUNT(*) as count FROM Materias') as { count: number }

      return {
        totalUsers: totalUsers.count,
        totalStudents: totalStudents.count,
        totalTeachers: totalTeachers.count,
        totalParents: totalParents.count,
        totalGrados: totalGrados.count,
        totalMaterias: totalMaterias.count,
      }
    } catch (error) {
      console.error('Error al obtener estadísticas del dashboard:', error)
      return { 
        totalUsers: 0, 
        totalStudents: 0, 
        totalTeachers: 0, 
        totalParents: 0,
        totalGrados: 0,
        totalMaterias: 0
      }
    }
  }

  // Obtener asignaciones de un docente específico
  async getTeacherAssignments(teacherId: number) {
    try {
      const query = `
        SELECT 
          dmg.IdAsignacion,
          dmg.IdMateria,
          dmg.IdGrado,
          dmg.IdSeccion,
          m.NombreMateria,
          g.NombreGrado,
          s.NombreSeccion,
          n.NombreNivel
        FROM DocenteMateriaGrado dmg
        JOIN Materias m ON dmg.IdMateria = m.IdMateria
        JOIN Grados g ON dmg.IdGrado = g.IdGrado
        JOIN Secciones s ON dmg.IdSeccion = s.IdSeccion
        JOIN Niveles n ON g.IdNivel = n.IdNivel
        WHERE dmg.IdUsuario = ?
        ORDER BY n.Orden, g.NumeroGrado, s.NombreSeccion, m.NombreMateria
      `
      const assignments = await this.all(query, [teacherId])
      return assignments
    } catch (error) {
      console.error('Error al obtener asignaciones del docente:', error)
      return []
    }
  }

  // Cursos (materia-grado-sección) asignados a un docente, con nombres
  async getTeacherCourses(teacherId: number) {
    try {
      const rows = await this.all(
        `SELECT 
           dmg.IdMateria,
           m.NombreMateria,
           dmg.IdGrado,
           g.NombreGrado,
           dmg.IdSeccion,
           COALESCE(s.NombreSeccion, 'Todas') AS NombreSeccion
         FROM DocenteMateriaGrado dmg
         JOIN Materias m ON m.IdMateria = dmg.IdMateria
         JOIN Grados g ON g.IdGrado = dmg.IdGrado
         LEFT JOIN Secciones s ON s.IdSeccion = dmg.IdSeccion
         WHERE dmg.IdUsuario = ?
         ORDER BY g.IdGrado, s.NombreSeccion, m.NombreMateria`,
        [teacherId]
      ) as any[]
      // Eliminar duplicados (por si existen)
      const key = (r: any) => `${r.IdMateria}-${r.IdGrado}-${r.IdSeccion ?? 0}`
      const map = new Map<string, any>()
      rows.forEach(r => map.set(key(r), r))
      return Array.from(map.values())
    } catch (error) {
      console.error('Error al obtener cursos del docente:', error)
      return []
    }
  }

  // Estudiantes asignados a un docente según sus cursos (grado/sección)
  async getStudentsForTeacher(teacherId: number) {
    try {
      const query = `
        SELECT DISTINCT 
          h.IdHijo,
          h.IdGrado,
          h.IdSeccion,
          h.NombreHijo,
          h.ApellidoHijo,
          h.Edad,
          h.CodigoEstudiante,
          g.NombreGrado,
          s.NombreSeccion,
          n.NombreNivel,
          GROUP_CONCAT(DISTINCT m.NombreMateria) AS Materias
        FROM DocenteMateriaGrado dmg
        JOIN Hijos h ON h.IdGrado = dmg.IdGrado AND (dmg.IdSeccion IS NULL OR h.IdSeccion = dmg.IdSeccion)
        LEFT JOIN Grados g ON h.IdGrado = g.IdGrado
        LEFT JOIN Secciones s ON h.IdSeccion = s.IdSeccion
        LEFT JOIN Niveles n ON g.IdNivel = n.IdNivel
        LEFT JOIN Materias m ON m.IdMateria = dmg.IdMateria
        WHERE dmg.IdUsuario = ?
        GROUP BY h.IdHijo
        ORDER BY n.Orden, g.NumeroGrado, s.NombreSeccion, h.ApellidoHijo, h.NombreHijo
      `
      const rows = await this.all(query, [teacherId])
      return rows
    } catch (error) {
      console.error('Error al obtener estudiantes del docente:', error)
      return []
    }
  }

  // Padres de los alumnos matriculados en los cursos del docente
  async getParentsForTeacher(teacherId: number) {
    try {
      const query = `
        SELECT DISTINCT 
          h.IdHijo,
          h.NombreHijo,
          h.ApellidoHijo,
          g.NombreGrado,
          s.NombreSeccion,
          u.IdUsuario AS IdUsuarioPadre,
          u.Usuario,
          u.Nombre,
          u.Apellido,
          u.Email,
          u.Telefono,
          p.IdPadre,
          p.ApellidoPadre,
          p.DNI
        FROM DocenteMateriaGrado dmg
        JOIN Hijos h ON h.IdGrado = dmg.IdGrado AND (dmg.IdSeccion IS NULL OR h.IdSeccion = dmg.IdSeccion)
        LEFT JOIN Padres p ON h.IdPadre = p.IdPadre
        LEFT JOIN Usuarios u ON p.IdUsuario = u.IdUsuario
        LEFT JOIN Grados g ON h.IdGrado = g.IdGrado
        LEFT JOIN Secciones s ON h.IdSeccion = s.IdSeccion
        WHERE dmg.IdUsuario = ? AND h.IdPadre IS NOT NULL
        ORDER BY h.ApellidoHijo, h.NombreHijo
      `
      const rows = await this.all(query, [teacherId])
      return rows
    } catch (error) {
      console.error('Error al obtener padres del docente:', error)
      return []
    }
  }

  // Horario del docente basado en sus materias y horarios de materia
  async getTeacherSchedule(teacherId: number) {
    try {
      const query = `
        SELECT 
          hm.DiaSemana,
          hm.HoraInicio,
          hm.HoraFin,
          m.NombreMateria,
          g.NombreGrado,
          COALESCE(s.NombreSeccion, 'Todas') AS NombreSeccion,
          n.NombreNivel
        FROM DocenteMateriaGrado dmg
        JOIN Materias m ON m.IdMateria = dmg.IdMateria
        LEFT JOIN Grados g ON g.IdGrado = dmg.IdGrado
        LEFT JOIN Secciones s ON s.IdSeccion = dmg.IdSeccion
        LEFT JOIN Niveles n ON g.IdNivel = n.IdNivel
        JOIN HorariosMaterias hm ON hm.IdMateria = dmg.IdMateria
        WHERE dmg.IdUsuario = ?
        ORDER BY 
          CASE hm.DiaSemana
            WHEN 'Lunes' THEN 1
            WHEN 'Martes' THEN 2
            WHEN 'Miércoles' THEN 3
            WHEN 'Jueves' THEN 4
            WHEN 'Viernes' THEN 5
            WHEN 'Sábado' THEN 6
            WHEN 'Domingo' THEN 7
          END,
          hm.HoraInicio,
          g.NumeroGrado,
          s.NombreSeccion,
          m.NombreMateria
      `
      const rows = await this.all(query, [teacherId])
      return rows
    } catch (error) {
      console.error('Error al obtener horario del docente:', error)
      return []
    }
  }

  // Obtener horarios de una materia específica
  async getSubjectSchedules(subjectId: number) {
    try {
      const query = `
        SELECT 
          IdHorario,
          DiaSemana,
          HoraInicio,
          HoraFin
        FROM HorariosMaterias
        WHERE IdMateria = ?
        ORDER BY 
          CASE DiaSemana
            WHEN 'Lunes' THEN 1
            WHEN 'Martes' THEN 2
            WHEN 'Miércoles' THEN 3
            WHEN 'Jueves' THEN 4
            WHEN 'Viernes' THEN 5
            WHEN 'Sábado' THEN 6
            WHEN 'Domingo' THEN 7
          END,
          HoraInicio
      `
      const schedules = await this.all(query, [subjectId])
      return schedules
    } catch (error) {
      console.error('Error al obtener horarios de la materia:', error)
      return []
    }
  }

  // Crear horario para una materia
  async createSubjectSchedule(scheduleData: {
    idMateria: number
    diaSemana: string
    horaInicio: string
    horaFin: string
  }) {
    try {
      const query = `
        INSERT INTO HorariosMaterias (IdMateria, DiaSemana, HoraInicio, HoraFin)
        VALUES (?, ?, ?, ?)
      `
      const result = await this.runWithInfo(query, [
        scheduleData.idMateria,
        scheduleData.diaSemana,
        scheduleData.horaInicio,
        scheduleData.horaFin
      ])
      return result
    } catch (error) {
      console.error('Error al crear horario de materia:', error)
      throw error
    }
  }

  // Actualizar horario de una materia
  async updateSubjectSchedule(scheduleId: number, scheduleData: {
    diaSemana: string
    horaInicio: string
    horaFin: string
  }) {
    try {
      const query = `
        UPDATE HorariosMaterias 
        SET DiaSemana = ?, HoraInicio = ?, HoraFin = ?
        WHERE IdHorario = ?
      `
      const result = await this.run(query, [
        scheduleData.diaSemana,
        scheduleData.horaInicio,
        scheduleData.horaFin,
        scheduleId
      ])
      return result
    } catch (error) {
      console.error('Error al actualizar horario de materia:', error)
      throw error
    }
  }

  // Eliminar horario de una materia
  async deleteSubjectSchedule(scheduleId: number) {
    try {
      const query = `DELETE FROM HorariosMaterias WHERE IdHorario = ?`
      const result = await this.run(query, [scheduleId])
      return result
    } catch (error) {
      console.error('Error al eliminar horario de materia:', error)
      throw error
    }
  }

  // Eliminar todos los horarios de una materia
  async deleteAllSubjectSchedules(subjectId: number) {
    try {
      const query = `DELETE FROM HorariosMaterias WHERE IdMateria = ?`
      const result = await this.run(query, [subjectId])
      return result
    } catch (error) {
      console.error('Error al eliminar horarios de la materia:', error)
      throw error
    }
  }

  // Calendario - Eventos
  async getAllEvents() {
    try {
      const events = await this.all(
        'SELECT * FROM Calendario ORDER BY Fecha DESC'
      )
      return events
    } catch (error) {
      console.error('Error al obtener eventos:', error)
      return []
    }
  }

  async createEvent(eventData: { fecha: string; descripcion: string; tipo?: string }) {
    try {
      const result = await this.runWithInfo(
        'INSERT INTO Calendario (Fecha, Descripcion, Tipo) VALUES (?, ?, ?)',
        [eventData.fecha, eventData.descripcion, eventData.tipo || 'Actividad']
      )
      return result
    } catch (error) {
      console.error('Error al crear evento:', error)
      throw error
    }
  }

  async updateEvent(eventId: number, eventData: { fecha: string; descripcion: string; tipo?: string }) {
    try {
      const result = await this.runWithInfo(
        'UPDATE Calendario SET Fecha = ?, Descripcion = ?, Tipo = ? WHERE IdEvento = ?',
        [eventData.fecha, eventData.descripcion, eventData.tipo || 'Actividad', eventId]
      )
      return result
    } catch (error) {
      console.error('Error al actualizar evento:', error)
      throw error
    }
  }

  async deleteEvent(eventId: number) {
    try {
      const result = await this.runWithInfo('DELETE FROM Calendario WHERE IdEvento = ?', [eventId])
      return result
    } catch (error) {
      console.error('Error al eliminar evento:', error)
      throw error
    }
  }

  // Notas - Administración
  async getAllNotas() {
    try {
      const query = `
        SELECT 
          n.IdNota,
          n.IdHijo,
          n.IdMateria,
          n.IdUsuario,
          n.Bimestre,
          h.IdGrado,
          h.IdSeccion,
          h.NombreHijo || ' ' || h.ApellidoHijo AS NombreHijo,
          m.NombreMateria AS Materia,
          u.Nombre AS DocenteNombre,
          u.Apellido AS DocenteApellido,
          n.Unidad,
          n.Criterio,
          n.Nota,
          n.Fecha,
          (
            SELECT COUNT(*) FROM Hijos hx 
            WHERE hx.IdGrado = h.IdGrado AND hx.IdSeccion = h.IdSeccion
          ) AS TotalMatriculados,
          (
            SELECT ROUND(AVG(n2.Nota), 1)
            FROM Notas n2 
            JOIN Hijos h2 ON h2.IdHijo = n2.IdHijo
            WHERE n2.IdMateria = n.IdMateria 
              AND h2.IdGrado = h.IdGrado 
              AND h2.IdSeccion = h.IdSeccion
              AND n2.Bimestre = n.Bimestre
          ) AS PromedioCurso
        FROM Notas n
        JOIN Hijos h ON n.IdHijo = h.IdHijo
        JOIN Materias m ON n.IdMateria = m.IdMateria
        JOIN Usuarios u ON n.IdUsuario = u.IdUsuario
        ORDER BY n.Fecha DESC, n.Bimestre DESC, m.NombreMateria
      `
      const notas = await this.all(query)
      return notas
    } catch (error) {
      console.error('Error al obtener notas:', error)
      return []
    }
  }

  // Asistencia - Obtener lista con estado para curso/fecha
  async getAttendanceForCourse(gradoId: number, seccionId: number, fecha: string) {
    try {
      const query = `
        SELECT h.IdHijo, h.NombreHijo, h.ApellidoHijo,
               COALESCE((SELECT Asistio FROM Asistencia a WHERE a.IdHijo = h.IdHijo AND a.Fecha = ?), NULL) as Asistio
        FROM Hijos h
        WHERE h.IdGrado = ? AND h.IdSeccion = ?
        ORDER BY h.ApellidoHijo, h.NombreHijo
      `
      const rows = await this.all(query, [fecha, gradoId, seccionId])
      return rows
    } catch (error) {
      console.error('Error al obtener asistencia:', error)
      return []
    }
  }

  // Asistencia - Guardar en lote para curso/fecha
  async saveAttendanceBatch(gradoId: number, seccionId: number, fecha: string, records: { idHijo: number; asistio: boolean }[]) {
    try {
      // Eliminar registros existentes de ese grupo/fecha
      await this.run(
        `DELETE FROM Asistencia WHERE Fecha = ? AND IdHijo IN (SELECT IdHijo FROM Hijos WHERE IdGrado = ? AND IdSeccion = ?)`,
        [fecha, gradoId, seccionId]
      )
      // Insertar todos
      const stmt = `INSERT INTO Asistencia (IdHijo, Fecha, Asistio) VALUES (?, ?, ?)`
      for (const r of records) {
        await this.run(stmt, [r.idHijo, fecha, r.asistio ? 1 : 0])
      }
      return { success: true }
    } catch (error) {
      console.error('Error al guardar asistencia:', error)
      throw error
    }
  }

  async createNota(nota: {
    idHijo: number
    idMateria: number
    idUsuario: number
    bimestre: number
    unidad?: string
    criterio?: string
    nota: number
    peso?: number
    tipoNota?: string
    fecha: string
  }) {
    try {
      const result = await this.runWithInfo(
        `INSERT INTO Notas (IdHijo, IdMateria, IdUsuario, Bimestre, Unidad, Criterio, Nota, Peso, TipoNota, Fecha)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, COALESCE(?, DATE('now')))`,
        [
          nota.idHijo,
          nota.idMateria,
          nota.idUsuario,
          nota.bimestre,
          nota.unidad || null,
          nota.criterio || null,
          nota.nota,
          nota.peso ?? 1.0,
          nota.tipoNota || 'Parcial',
          nota.fecha || null
        ]
      )
      return result
    } catch (error) {
      console.error('Error al crear nota:', error)
      throw error
    }
  }

  async updateNota(idNota: number, nota: {
    idHijo: number
    idMateria: number
    idUsuario: number
    bimestre: number
    unidad?: string
    criterio?: string
    nota: number
    peso?: number
    tipoNota?: string
    fecha: string
  }) {
    try {
      const result = await this.runWithInfo(
        `UPDATE Notas 
         SET IdHijo = ?, IdMateria = ?, IdUsuario = ?, Bimestre = ?, Unidad = ?, Criterio = ?, Nota = ?, Peso = ?, TipoNota = ?, Fecha = COALESCE(?, DATE('now'))
         WHERE IdNota = ?`,
        [
          nota.idHijo,
          nota.idMateria,
          nota.idUsuario,
          nota.bimestre,
          nota.unidad || null,
          nota.criterio || null,
          nota.nota,
          nota.peso ?? 1.0,
          nota.tipoNota || 'Parcial',
          nota.fecha || null,
          idNota
        ]
      )
      return result
    } catch (error) {
      console.error('Error al actualizar nota:', error)
      throw error
    }
  }

  async deleteNota(idNota: number) {
    try {
      const result = await this.runWithInfo('DELETE FROM Notas WHERE IdNota = ?', [idNota])
      return result
    } catch (error) {
      console.error('Error al eliminar nota:', error)
      throw error
    }
  }

  async getAssignedTeacherForCourse(materiaId: number, gradoId: number, seccionId: number) {
    try {
      const row = await this.get(
        `SELECT IdUsuario FROM DocenteMateriaGrado WHERE IdMateria = ? AND IdGrado = ? AND (IdSeccion = ? OR IdSeccion IS NULL) LIMIT 1`,
        [materiaId, gradoId, seccionId]
      ) as { IdUsuario?: number } | undefined
      return row && (row as any).IdUsuario ? (row as any).IdUsuario as number : null
    } catch (error) {
      console.error('Error al obtener docente asignado:', error)
      return null
    }
  }

  async getCourseNotes(materiaId: number, gradoId: number, seccionId: number, bimestre: number) {
    try {
      const query = `
        SELECT 
          h.IdHijo,
          h.NombreHijo,
          h.ApellidoHijo
        FROM Hijos h
        WHERE h.IdGrado = ? AND h.IdSeccion = ?
        ORDER BY h.ApellidoHijo, h.NombreHijo
      `
      const students = await this.all(query, [gradoId, seccionId]) as any[]
      // Cargar notas por alumno
      const notas = await this.all(
        `SELECT IdHijo, IdNota, Nota FROM Notas WHERE IdMateria = ? AND Bimestre = ?`,
        [materiaId, bimestre]
      ) as any[]
      const map = new Map<number, { IdNota: number; Nota: number }>()
      notas.forEach(n => map.set((n as any).IdHijo, { IdNota: (n as any).IdNota, Nota: (n as any).Nota }))
      return students.map(s => ({
        IdHijo: (s as any).IdHijo,
        NombreHijo: (s as any).NombreHijo,
        ApellidoHijo: (s as any).ApellidoHijo,
        IdNota: map.get((s as any).IdHijo)?.IdNota || 0,
        Nota: map.get((s as any).IdHijo)?.Nota ?? null
      }))
    } catch (error) {
      console.error('Error al obtener notas del curso:', error)
      return []
    }
  }

  async upsertCourseNotes(params: { materiaId: number; gradoId: number; seccionId: number; bimestre: number; fecha: string; idUsuario?: number; notas: { idHijo: number; nota: number | null }[] }) {
    const teacherId = params.idUsuario || await this.getAssignedTeacherForCourse(params.materiaId, params.gradoId, params.seccionId)
    if (!teacherId) throw new Error('No hay docente asignado al curso')
    for (const item of params.notas) {
      if (item.nota == null) continue
      const existing = await this.get(
        `SELECT IdNota FROM Notas WHERE IdHijo = ? AND IdMateria = ? AND Bimestre = ?`,
        [item.idHijo, params.materiaId, params.bimestre]
      ) as { IdNota?: number } | undefined
      if (existing && (existing as any).IdNota) {
        await this.updateNota((existing as any).IdNota as number, {
          idHijo: item.idHijo,
          idMateria: params.materiaId,
          idUsuario: teacherId,
          bimestre: params.bimestre,
          nota: item.nota,
          fecha: params.fecha,
          unidad: undefined,
          criterio: undefined,
          peso: 1.0,
          tipoNota: 'Bimestral'
        })
      } else {
        await this.createNota({
          idHijo: item.idHijo,
          idMateria: params.materiaId,
          idUsuario: teacherId,
          bimestre: params.bimestre,
          nota: item.nota,
          fecha: params.fecha,
          unidad: undefined,
          criterio: undefined,
          peso: 1.0,
          tipoNota: 'Bimestral'
        })
      }
    }
    return { success: true }
  }

  async getAllParents() {
    try {
      const query = `
        SELECT 
          p.IdPadre,
          p.NombrePadre,
          p.ApellidoPadre,
          u.Usuario,
          u.Email,
          u.Telefono
        FROM Padres p
        INNER JOIN Usuarios u ON p.IdUsuario = u.IdUsuario
        ORDER BY p.NombrePadre, p.ApellidoPadre
      `
      const parents = await this.all(query)
      return parents
    } catch (error) {
      // Error al obtener padres
      throw error
    }
  }

  // Métodos públicos para asistencia
  async getAllAttendance() {
    try {
      const query = `
        SELECT a.*, h.NombreHijo
        FROM Asistencia a
        JOIN Hijos h ON a.IdHijo = h.IdHijo
        ORDER BY a.Fecha DESC
      `
      // Usar el método privado all internamente
      const attendance = await this.all(query)
      return attendance
    } catch (error) {
      console.error('Error al obtener asistencia:', error)
      throw error
    }
  }

  async createAttendance(attendanceData: { idHijo: number; fecha: string; asistio: boolean }) {
    try {
      const query = `
        INSERT INTO Asistencia (IdHijo, Fecha, Asistio)
        VALUES (?, ?, ?)
      `
      const result = await this.runWithInfo(query, [
        attendanceData.idHijo,
        attendanceData.fecha,
        attendanceData.asistio ? 1 : 0
      ])
      return result
    } catch (error) {
      console.error('Error al crear asistencia:', error)
      throw error
    }
  }

  // Métodos para sistema de pagos
  async getAllConceptosPago() {
    try {
      const query = `
        SELECT cp.*, n.NombreNivel, g.NombreGrado
        FROM ConceptosPago cp
        LEFT JOIN Niveles n ON cp.IdNivel = n.IdNivel
        LEFT JOIN Grados g ON cp.IdGrado = g.IdGrado
        WHERE cp.Activo = 1
        ORDER BY cp.TipoConcepto, cp.IdNivel, cp.DuracionMeses, cp.IdGrado
      `
      const conceptos = await this.all(query)
      return conceptos
    } catch (error) {
      console.error('Error al obtener conceptos de pago:', error)
      throw error
    }
  }

  async getConceptosPagoByNivel(nivelId: number) {
    try {
      const query = `
        SELECT cp.*, n.NombreNivel, g.NombreGrado
        FROM ConceptosPago cp
        LEFT JOIN Niveles n ON cp.IdNivel = n.IdNivel
        LEFT JOIN Grados g ON cp.IdGrado = g.IdGrado
        WHERE cp.Activo = 1 AND (cp.IdNivel = ? OR cp.IdNivel IS NULL)
        ORDER BY cp.TipoConcepto, cp.DuracionMeses, cp.IdGrado
      `
      const conceptos = await this.all(query, [nivelId])
      return conceptos
    } catch (error) {
      console.error('Error al obtener conceptos por nivel:', error)
      throw error
    }
  }

  async getPendingPayments(params: { year: number; month: number; idNivel?: number | null; idGrado?: number | null }) {
    try {
      const { year, month, idNivel, idGrado } = params
      const ym = `${year}-${String(month).padStart(2, '0')}`
      const conditions: string[] = []
      const values: unknown[] = []
      if (idNivel) {
        conditions.push('n.IdNivel = ?')
        values.push(idNivel)
      }
      if (idGrado) {
        conditions.push('g.IdGrado = ?')
        values.push(idGrado)
      }

      const whereExtra = conditions.length ? `AND ${conditions.join(' AND ')}` : ''

      const query = `
        SELECT 
          p.IdPadre,
          p.NombrePadre,
          p.ApellidoPadre,
          p.Telefono,
          p.DNI,
          h.IdHijo,
          h.NombreHijo,
          h.ApellidoHijo,
          g.IdGrado,
          g.NombreGrado,
          n.IdNivel,
          n.NombreNivel
        FROM Hijos h
        LEFT JOIN Padres p ON h.IdPadre = p.IdPadre
        LEFT JOIN Grados g ON h.IdGrado = g.IdGrado
        LEFT JOIN Niveles n ON g.IdNivel = n.IdNivel
        WHERE h.Estado = 'Activo'
          ${whereExtra}
          AND NOT EXISTS (
            SELECT 1 FROM Facturas f
            WHERE f.IdHijo = h.IdHijo
              AND f.Estado = 'Pagada'
              AND strftime('%Y-%m', f.FechaEmision) = ?
          )
        ORDER BY n.IdNivel NULLS LAST, g.IdGrado, h.ApellidoHijo, h.NombreHijo
      `
      const result = await this.all(query, [...values, ym])
      return result
    } catch (error) {
      console.error('Error al obtener pendientes de pago:', error)
      throw error
    }
  }

  async createFactura(facturaData: {
    idPadre: number
    idHijo: number
    numeroFactura: string
    fechaEmision: string
    fechaVencimiento: string
    subtotal: number
    descuento?: number
    total: number
    observaciones?: string
  }) {
    try {
      const query = `
        INSERT INTO Facturas (IdPadre, IdHijo, NumeroFactura, FechaEmision, FechaVencimiento, Subtotal, Descuento, Total, Observaciones)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `
      const result = await this.runWithInfo(query, [
        facturaData.idPadre,
        facturaData.idHijo,
        facturaData.numeroFactura,
        facturaData.fechaEmision,
        facturaData.fechaVencimiento,
        facturaData.subtotal,
        facturaData.descuento || 0,
        facturaData.total,
        facturaData.observaciones || null
      ])
      return result
    } catch (error) {
      console.error('Error al crear factura:', error)
      throw error
    }
  }

  async createDetalleFactura(detalleData: {
    idFactura: number
    idConcepto: number
    cantidad: number
    precioUnitario: number
    subtotal: number
  }) {
    try {
      const query = `
        INSERT INTO DetalleFactura (IdFactura, IdConcepto, Cantidad, PrecioUnitario, Subtotal)
        VALUES (?, ?, ?, ?, ?)
      `
      const result = await this.runWithInfo(query, [
        detalleData.idFactura,
        detalleData.idConcepto,
        detalleData.cantidad,
        detalleData.precioUnitario,
        detalleData.subtotal
      ])
      return result
    } catch (error) {
      console.error('Error al crear detalle de factura:', error)
      throw error
    }
  }

  async getFacturasByParent(parentId: number) {
    try {
      const query = `
        SELECT f.*, h.NombreHijo, h.ApellidoHijo, p.NombrePadre, p.ApellidoPadre
        FROM Facturas f
        JOIN Hijos h ON f.IdHijo = h.IdHijo
        JOIN Padres p ON f.IdPadre = p.IdPadre
        WHERE f.IdPadre = ?
        ORDER BY f.FechaEmision DESC
      `
      const facturas = await this.all(query, [parentId])
      return facturas
    } catch (error) {
      console.error('Error al obtener facturas del padre:', error)
      throw error
    }
  }

  async getAllFacturas() {
    try {
      const query = `
        SELECT f.*, h.NombreHijo, h.ApellidoHijo, p.NombrePadre, p.ApellidoPadre
        FROM Facturas f
        JOIN Hijos h ON f.IdHijo = h.IdHijo
        JOIN Padres p ON f.IdPadre = p.IdPadre
        ORDER BY f.FechaEmision DESC
      `
      const facturas = await this.all(query)
      return facturas
    } catch (error) {
      console.error('Error al obtener todas las facturas:', error)
      throw error
    }
  }

  async getDetalleFactura(facturaId: number) {
    try {
      const query = `
        SELECT df.*, cp.NombreConcepto, cp.Descripcion
        FROM DetalleFactura df
        JOIN ConceptosPago cp ON df.IdConcepto = cp.IdConcepto
        WHERE df.IdFactura = ?
        ORDER BY df.IdDetalle
      `
      const detalles = await this.all(query, [facturaId])
      return detalles
    } catch (error) {
      console.error('Error al obtener detalle de factura:', error)
      throw error
    }
  }

  async createPago(pagoData: {
    idFactura: number
    fechaPago: string
    monto: number
    metodoPago: string
    referencia?: string
    observaciones?: string
  }) {
    try {
      const query = `
        INSERT INTO Pagos (IdFactura, FechaPago, Monto, MetodoPago, Referencia, Observaciones)
        VALUES (?, ?, ?, ?, ?, ?)
      `
      const result = await this.runWithInfo(query, [
        pagoData.idFactura,
        pagoData.fechaPago,
        pagoData.monto,
        pagoData.metodoPago,
        pagoData.referencia || null,
        pagoData.observaciones || null
      ])
      return result
    } catch (error) {
      console.error('Error al crear pago:', error)
      throw error
    }
  }

  async updateFacturaEstado(facturaId: number, estado: string) {
    try {
      const query = `
        UPDATE Facturas 
        SET Estado = ?
        WHERE IdFactura = ?
      `
      const result = await this.run(query, [estado, facturaId])
      return result
    } catch (error) {
      console.error('Error al actualizar estado de factura:', error)
      throw error
    }
  }

  async getPagosByFactura(facturaId: number) {
    try {
      const query = `
        SELECT p.*
        FROM Pagos p
        WHERE p.IdFactura = ?
        ORDER BY p.FechaPago DESC
      `
      const pagos = await this.all(query, [facturaId])
      return pagos
    } catch (error) {
      console.error('Error al obtener pagos de factura:', error)
      throw error
    }
  }

  async generateFacturaMatricula(studentId: number, parentId: number, nivelId: number) {
    try {
      // Obtener concepto de matrícula según el nivel
      const conceptoQuery = `
        SELECT * FROM ConceptosPago 
        WHERE TipoConcepto = 'Matricula' AND IdNivel = ? AND Activo = 1
      `
      const concepto = await this.get(conceptoQuery, [nivelId])
      
      if (!concepto) {
        throw new Error('No se encontró concepto de matrícula para el nivel')
      }

      // Generar número de factura
      const numeroFactura = `MAT-${new Date().getFullYear()}-${String(studentId).padStart(4, '0')}`
      
      // Fechas
      const fechaEmision = new Date().toISOString().split('T')[0]
      const fechaVencimiento = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

      // Crear factura
      const facturaResult = await this.createFactura({
        idPadre: parentId,
        idHijo: studentId,
        numeroFactura,
        fechaEmision,
        fechaVencimiento,
        subtotal: concepto.Monto,
        total: concepto.Monto,
        observaciones: `Matrícula ${concepto.NombreConcepto}`
      })

      // Crear detalle
      await this.createDetalleFactura({
        idFactura: facturaResult.lastID,
        idConcepto: concepto.IdConcepto,
        cantidad: 1,
        precioUnitario: concepto.Monto,
        subtotal: concepto.Monto
      })

      return facturaResult
    } catch (error) {
      console.error('Error al generar factura de matrícula:', error)
      throw error
    }
  }

  close() {
    this.db.close()
  }
}
