/* eslint-disable @typescript-eslint/no-require-imports */
const path = require('node:path')
const { Database } = require('../dist/lib/database')

async function main() {
  // Ensure cwd is project root
  try {
    process.chdir(path.resolve(__dirname, '..'))
  } catch {}

  const db = new Database()
  const unique = Date.now()
  const username = `testuser_${unique}`
  const password = `pass_${unique}`

  try {
    const createRes = await db.createUser({
      usuario: username,
      contraseña: password,
      idRol: 3,
      nombre: 'Tester',
      apellido: 'Login',
      email: `${username}@example.com`,
      telefono: '000-0000'
    })

    console.log('Created user lastID:', createRes.lastID)

    const fetched = await db.getUserByCredentials(username, password)
    if (fetched && fetched.Usuario === username) {
      console.log('LOGIN_OK', { id: fetched.IdUsuario, usuario: fetched.Usuario, rol: fetched.NombreRol })
    } else {
      console.error('LOGIN_FAIL')
      process.exitCode = 2
    }

    // cleanup
    if (createRes.lastID) {
      await db.deleteUser(createRes.lastID)
      console.log('Cleanup OK')
    }
  } catch (e) {
    console.error('ERROR', e?.message || e)
    process.exitCode = 1
  }
}

main()
