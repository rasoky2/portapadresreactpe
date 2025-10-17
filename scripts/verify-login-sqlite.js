/* eslint-disable no-console */
const path = require('node:path')
const fs = require('node:fs')
const sqlite3 = require('sqlite3').verbose()

function openDb(dbPath) {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(dbPath, (err) => {
      if (err) return reject(err)
      resolve(db)
    })
  })
}

function run(db, sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) return reject(err)
      resolve({ lastID: this.lastID, changes: this.changes })
    })
  })
}

function get(db, sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, function (err, row) {
      if (err) return reject(err)
      resolve(row)
    })
  })
}

async function main() {
  const dbPath = path.join(process.cwd(), 'database', 'portal_padres.db')
  if (!fs.existsSync(dbPath)) {
    console.error('DB no encontrada en', dbPath)
    process.exit(1)
  }

  const db = await openDb(dbPath)
  const unique = Date.now()
  const username = `formuser_${unique}`
  const password = `pw_${unique}`
  const roleId = 3 // Padre

  try {
    // Inserta usuario como lo hace el endpoint (texto plano)
    const insertSql = `
      INSERT INTO Usuarios (Usuario, Contraseña, IdRol, Nombre, Apellido, Email, Telefono)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `
    const res = await run(db, insertSql, [
      username,
      password,
      roleId,
      'Form',
      'User',
      `${username}@example.com`,
      '000-0000'
    ])
    console.log('Usuario creado lastID:', res.lastID)

    // Consulta igual que getUserByCredentials
    const row = await get(db, `
      SELECT u.*, r.NombreRol
      FROM Usuarios u
      JOIN Roles r ON u.IdRol = r.IdRol
      WHERE u.Usuario = ? AND u.Contraseña = ?
    `, [username, password])

    if (row && row.Usuario === username) {
      console.log('LOGIN_OK', { IdUsuario: row.IdUsuario, Usuario: row.Usuario, NombreRol: row.NombreRol })
    } else {
      console.error('LOGIN_FAIL')
      process.exitCode = 2
    }

    // Limpieza
    if (res.lastID) {
      await run(db, 'DELETE FROM Usuarios WHERE IdUsuario = ?', [res.lastID])
      console.log('Cleanup OK')
    }
  } catch (e) {
    console.error('ERROR', e?.message || e)
    process.exitCode = 1
  } finally {
    db.close()
  }
}

main()
