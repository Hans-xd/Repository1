// server.js
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
// Para manejar sesiones
const session = require('express-session');
const axios = require('axios');
const app = express();
const PORT = 4000;

// Middleware
app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(express.json());
app.use(session({
  secret: 'APP_ACCESIBILIDAD',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 24 * 60 * 60 * 1000, httpOnly: true, secure: false }
}));

// Configura tu conexión MySQL
// Pool MySQL
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'accesibilidad_app',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});


// GET /api/reviews?userId=<id>&placeId=<placeId>
app.get('/api/reviews', async (req, res) => {
  const { userId, placeId } = req.query;
  try {
    let rows;
    if (userId) {
      [rows] = await pool.query(
        `SELECT
           rev.id,
           rev.placeId,
           rev.rating,
           rev.comment,
           rev.created_at,
           usu.nombreP   AS nameP,
           usu.apellidoP AS lastName,
           usu.photoUrl
         FROM reviews AS rev
         JOIN usuarios AS usu
           ON usu.idusuarios = rev.id_user
        WHERE rev.id_user = ?
        ORDER BY rev.created_at DESC`,
        [userId]
      );
    } else if (placeId) {
      [rows] = await pool.query(
        `SELECT
           rev.id,
           rev.placeId,
           rev.rating,
           rev.comment,
           rev.created_at,
           usu.nombreP   AS nameP,
           usu.apellidoP AS lastName,
           usu.photoUrl
         FROM reviews AS rev
         JOIN usuarios AS usu
           ON usu.idusuarios = rev.id_user
        WHERE rev.placeId = ?
        ORDER BY rev.created_at DESC`,
        [placeId]
      );
    } else {
      [rows] = await pool.query(
        `SELECT
           rev.id,
           rev.placeId,
           rev.rating,
           rev.comment,
           rev.created_at,
           usu.nombreP   AS nameP,
           usu.apellidoP AS lastName,
           usu.photoUrl
         FROM reviews AS rev
         JOIN usuarios AS usu
           ON usu.idusuarios = rev.id_user
        ORDER BY rev.created_at DESC`
      );
    }
    res.json(rows);
  } catch (err) {
    console.error('Error al leer reseñas:', err);
    res.status(500).json({ error: 'Error al leer reseñas' });
  }
});

// GET /api/reviews/nearby?lat=<lat>&lng=<lng>&radius=<metros>
app.get('/api/reviews/nearby', async (req, res) => {
  const { lat, lng, radius = 5000 } = req.query;
  if (!lat || !lng) {
    return res.status(400).json({ error: 'Faltan latitud o longitud' });
  }

  try {
    // 1) Nearby Search en Google Places
    const googleRes = await axios.get(
      'https://maps.googleapis.com/maps/api/place/nearbysearch/json',
      {
        params: {
          location: `${lat},${lng}`,
          radius,
          key: process.env.GOOGLE_PLACES_KEY,
        }
      }
    );

    // 2) Extraer los place_id únicos
    const placeIds = googleRes.data.results.map(p => p.place_id);
    if (placeIds.length === 0) {
      return res.json([]);
    }

    // 3) Traer reseñas de tu BD que coincidan con esos placeIds
    const [rows] = await pool.query(
      `SELECT id, nombreP, apellidoP, photoUrl, placeId, rating, comment, created_at
         FROM reviews rev
         LEFT JOIN usuarios usu ON usu.idusuarios = rev.id_user
        WHERE placeId IN (?)
        ORDER BY created_at DESC
        LIMIT 20`,
      [placeIds]
    );

    res.json(rows);
  } catch (err) {
    console.error('Nearby reviews error:', err);
    res.status(500).json({ error: 'Error al cargar reseñas cercanas' });
  }
});

// GET /api/recommendations?disability=<tipo>
app.get('/api/recommendations', async (req, res) => {
  const { disability } = req.query;
  if (!disability) {
    return res.status(400).json({ error: 'Falta parámetro disability' });
  }

  try {
    // Ejemplo: tabla 'places' con columna 'accessible_for' (enum o varchar)
    const [rows] = await pool.query(
      `SELECT id, name, description, photoUrl
         FROM places
        WHERE JSON_CONTAINS(accessible_for, ?)
        ORDER BY rating DESC
        LIMIT 10`,
      [ JSON.stringify([disability]) ]
    );

    res.json(rows);
  } catch (err) {
    console.error('Recommendations error:', err);
    res.status(500).json({ error: 'Error al cargar recomendaciones' });
  }
});

// POST /api/reviews
app.post('/api/reviews', async (req, res) => {
  const { placeId, rating, comment } = req.body;
  if (!placeId || !rating) {
    return res.status(400).json({ error: 'placeId y rating son requeridos' });
  }
  try {
    const [result] = await pool.query(
      'INSERT INTO reviews (placeId, rating, comment) VALUES (?, ?, ?)',
      [placeId, rating, comment || null]
    );
    res.status(201).json({ id: result.insertId, placeId, rating, comment });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al guardar reseña' });
  }
});

// POST /api/login
app.post('/api/login', async (req, res) => {

    const { username, password } = req.body;
     if (!username || !password) return res.status(400).json({ error: 'Faltan credenciales' });
  
     try {
       // Busca al usuario por 'user' en la BD
       const [rows] = await pool.query(
        'SELECT idusuarios, user, pass, nombreP, apellidoP, email FROM usuarios WHERE user = ?',
        [username]
       );
       const found = rows[0];
       if (!found) return res.status(401).json({ error: 'Usuario no encontrado' });
  
       // Verifica contraseña
       const bcrypt = require('bcrypt');
       const valid = await bcrypt.compare(password, found.pass);
       if (!valid) return res.status(401).json({ error: 'Contraseña incorrecta' });
  
       // Guarda en sesión
       req.session.user = {
         id: found.idusuarios,
         name: found.nombreP,
         lastName: found.apellidoP,
         email: found.email,
         photoUrl: found.photoUrl || null,


        username: found.user
       };
        res.json(req.session.user);
  
     } catch (err) {
       console.error(err);
       res.status(500).json({ error: 'Error en login' });
     }
  });

// POST /api/logout → destruye la sesión
app.post('/api/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.error('Logout error:', err);
      return res.status(500).json({ error: 'Error al cerrar sesión' });
    }
    // Limpia la cookie de sesión
    res.clearCookie('connect.sid');
    res.json({}); 
  });
});

// POST /api/register → crea un nuevo usuario
app.post('/api/register', async (req, res) => {
  console.log('[REGISTER] payload:', req.body);
  const { user, password, nombreP, apellidoP, apellidoS, email } = req.body;

  // Validación
  if (!user || !password || !nombreP || !apellidoP || !email) {
    return res.status(400).json({ error: 'Faltan campos obligatorios.' });
  }

  try {
    // Hash de contraseña
    const hashed = await bcrypt.hash(password, 10);

    // Inserción
    const [result] = await pool.query(
      `INSERT INTO usuarios
         (user, pass, nombreP, apellidoP, apellidoS, email, fecha_registro)
       VALUES (?, ?, ?, ?, ?, ?, NOW())`,
      [user, hashed, nombreP, apellidoP, apellidoS || null, email]
    );
    console.log('[REGISTER] insertId:', result.insertId); 
    res.status(201).json({ idusuarios: result.insertId });
  } catch (err) {
    console.error('[REGISTER] Error:', err);
    if (err.sqlMessage) console.error('[REGISTER] SQL Message:', err.sqlMessage);
    if (err.code === 'ER_DUP_ENTRY') {
      console.log('[REGISTER] Duplicate entry');
      return res.status(409).json({ error: 'Usuario o correo ya registrado.' });
    }
    console.log('[REGISTER] Unexpected error');
    res.status(500).json({ error: 'Error al crear usuario.' });
  }
});

// GET /api/me  -> para consultar quien está logueado
app.get('/api/me', (req, res) => {
  if (req.session.user) {
    res.json(req.session.user);
  } else {
    res.status(401).json({ error: 'No autenticado' });
  }
});

app.get('/api/places/autocomplete', async (req, res) => {
  try {
    const { input } = req.query;
    const googleRes = await axios.get(
      'https://maps.googleapis.com/maps/api/place/autocomplete/json',
      {
        params: {
          input,
          key: process.env.GOOGLE_PLACES_KEY,
          types: 'establishment|geocode',
          components: 'country:cl',
        }
      }
    );
    res.json(googleRes.data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Autocomplete error' });
  }
});

// PUT /api/profile/:id
app.put('/api/profile/:id', async (req, res) => {
  const { id } = req.params;
  const { name, email, lastName} = req.body;

  // 1) Validación básica
  if (!name || !email || !lastName) {
    return res.status(400).json({ error: 'Faltan datos para actualizar' });
  }

  // 2) Autorización: solo el usuario dueño de la sesión puede modificar su perfil
  if (!req.session.user || req.session.user.id !== Number(id)) {
    return res.status(403).json({ error: 'No autorizado' });
  }

  try {
    // 3) Actualiza la BD
    const [result] = await pool.query(
      `UPDATE usuarios
          SET nombreP = ?,
              apellidoP = ?,
              email    = ?
        WHERE idusuarios = ?`,
      [name, lastName, email, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // 4) Sincroniza la sesión con los datos nuevos
    req.session.user = {
      ...req.session.user,

      name,
      lastName,
      email
    };

    // 5) Devuelve el user actualizado (coincide con /api/me)
    res.json(req.session.user);
  } catch (err) {
    console.error('Error actualizando perfil:', err);
    res.status(500).json({ error: 'Error al actualizar perfil' });
  }
});

// GET /api/places → devuelve todos los lugares accesibles
app.get('/api/places', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        id, name, latitude AS lat, longitude AS lng,
        rampas, banos, estacionamiento, rating, google_place_id
      FROM places
      WHERE active = 1
    `);
    res.json(rows);
  } catch (err) {
    console.error('Error fetching places:', err);
    res.status(500).json({ error: 'Error al obtener lugares' });
  }
});



// Inicia el servidor
app.get('/', (req, res) => {
  res.send('API de Accesibilidad');
});


app.listen(PORT, () => {
  console.log(`API corriendo en http://localhost:${PORT}`);
});
