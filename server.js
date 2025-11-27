require('dotenv').config(); // Carga variables de entorno
const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

// Inicializa la base de datos y captura errores de conexión tempranos
db.initializeDatabase();

// Middlewares
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
    secret: process.env.SESSION_SECRET || 'mi_clave_secreta_de_sesion',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Cambiar a true si usas HTTPS (Producción)
}));
app.set('view engine', 'html');
app.engine('html', require('ejs').renderFile);
app.use(express.static('views')); // Para servir archivos estáticos (CSS, JS, etc.)

// --- Middleware de Autenticación ---
const isAuthenticated = (req, res, next) => {
    if (req.session.userId) {
        return next();
    }
    res.redirect('/login');
};

const is2FAVerified = (req, res, next) => {
    if (req.session.twofaVerified) {
        return next();
    }
    // Si la sesión existe pero 2FA no está verificado, redirige a la verificación
    if (req.session.userId) {
        return res.redirect('/verify-2fa');
    }
    res.redirect('/login');
};

// --- RUTAS ---

app.get('/', (req, res) => {
    if (req.session.twofaVerified) {
        res.send(`<h1>Bienvenido, usuario ${req.session.username}!</h1><p>Has iniciado sesión con éxito y has verificado 2FA.</p><a href="/logout">Cerrar sesión</a>`);
    } else {
        res.redirect('/login');
    }
});

// GET: Formulario de Registro
app.get('/register', (req, res) => {
    res.render('register.html', { message: null });
});

// POST: Registrar Usuario y Configurar 2FA
app.post('/register', async (req, res) => {
    const { username, password } = req.body;
    try {
        const password_hash = await bcrypt.hash(password, 10);
        
        // 1. Generar el secreto 2FA
        const secret = speakeasy.generateSecret({
            name: `PC4-NodeLab:${username}`
        });

        // 2. Guardar el usuario y el secreto 2FA (Aún deshabilitado)
        const result = await db.query(
            "INSERT INTO users (username, password_hash, twofa_secret) VALUES ($1, $2, $3) RETURNING id",
            [username, password_hash, secret.base32]
        );

        // 3. Generar el QR y mostrar la página de configuración
        const otpauthUrl = secret.otpauth_url;
        const qrCodeData = await QRCode.toDataURL(otpauthUrl);
        
        // Guardamos el ID en sesión temporalmente para configurar 2FA
        req.session.tempUserId = result.rows[0].id;
        
        res.render('setup_2fa.html', { 
            qrCodeData: qrCodeData, 
            secret: secret.base32, 
            username: username 
        });

    } catch (error) {
        if (error.code === '23505') { // Código de error de duplicado
            return res.render('register.html', { message: 'El usuario ya existe.' });
        }
        console.error("Error en registro:", error);
        res.status(500).send("Error interno del servidor durante el registro.");
    }
});


// POST: Habilitar 2FA después de escanear el QR
app.post('/enable-2fa', async (req, res) => {
    const { token } = req.body;
    const userId = req.session.tempUserId;

    if (!userId) {
        return res.redirect('/register');
    }
    
    try {
        const userResult = await db.query(
            "SELECT twofa_secret FROM users WHERE id = $1", [userId]
        );
        const user = userResult.rows[0];

        const verified = speakeasy.totp.verify({
            secret: user.twofa_secret,
            encoding: 'base32',
            token: token
        });

        if (verified) {
            // Habilitar 2FA en la BD y limpiar sesión temporal
            await db.query(
                "UPDATE users SET is_2fa_enabled = TRUE WHERE id = $1", [userId]
            );
            
            req.session.tempUserId = null; // Limpiar ID temporal
            res.redirect('/login?message=2FA_enabled');
        } else {
            res.send("Token 2FA no válido. Inténtalo de nuevo.");
        }
    } catch (error) {
        console.error("Error al habilitar 2FA:", error);
        res.status(500).send("Error interno del servidor.");
    }
});


// GET: Formulario de Login
app.get('/login', (req, res) => {
    const message = req.query.message === '2FA_enabled' ? 'Registro exitoso! Por favor inicia sesión.' : null;
    res.render('login.html', { message: message });
});

// POST: Iniciar Sesión (Paso 1: Contraseña)
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const result = await db.query(
            "SELECT * FROM users WHERE username = $1", [username]
        );
        const user = result.rows[0];

        if (!user || !(await bcrypt.compare(password, user.password_hash))) {
            return res.render('login.html', { message: 'Credenciales incorrectas.' });
        }

        // Credenciales correctas. Configuramos la sesión.
        req.session.userId = user.id;
        req.session.username = user.username;
        req.session.twofaVerified = false; // Aún no ha verificado 2FA

        if (user.is_2fa_enabled) {
            // Si 2FA está activo, redirige al paso de verificación
            res.redirect('/verify-2fa');
        } else {
            // Si 2FA NO está activo, la verificación es implícita
            req.session.twofaVerified = true;
            res.redirect('/');
        }
    } catch (error) {
        console.error("Error en login:", error);
        res.status(500).send("Error interno del servidor durante el login.");
    }
});

// GET: Formulario de Verificación 2FA
app.get('/verify-2fa', isAuthenticated, (req, res) => {
    // Solo si la sesión está iniciada pero 2FA no verificado
    res.render('verify_2fa.html', { message: null });
});

// POST: Verificación 2FA (Paso 2)
app.post('/verify-2fa', isAuthenticated, async (req, res) => {
    const { token } = req.body;
    const userId = req.session.userId;

    try {
        const userResult = await db.query(
            "SELECT twofa_secret FROM users WHERE id = $1", [userId]
        );
        const user = userResult.rows[0];
        
        if (!user || !user.twofa_secret) {
            // Esto no debería pasar si la lógica de login es correcta
            return res.status(400).send("Error: Secreto 2FA no encontrado.");
        }

        const verified = speakeasy.totp.verify({
            secret: user.twofa_secret,
            encoding: 'base32',
            token: token
        });

        if (verified) {
            // 2FA verificado con éxito, actualizamos la sesión
            req.session.twofaVerified = true;
            res.redirect('/'); // Acceso al área restringida
        } else {
            res.render('verify_2fa.html', { message: 'Token 2FA no válido. Inténtalo de nuevo.' });
        }
    } catch (error) {
        console.error("Error en verificación 2FA:", error);
        res.status(500).send("Error interno del servidor.");
    }
});

// GET: Cerrar Sesión
app.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.error(err);
        }
        res.redirect('/login');
    });
});

app.listen(PORT, () => {
    console.log(`Servidor Node.js corriendo en el puerto ${PORT}`);
});