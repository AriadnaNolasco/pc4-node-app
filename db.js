const { Pool } = require('pg');

const pool = new Pool({
    user: process.env.DATABASE_USER,
    host: process.env.DATABASE_HOST,
    database: process.env.DATABASE_NAME || 'postgres', // Usa 'postgres' o el nombre que le diste a la BD
    password: process.env.DATABASE_PASSWORD,
    port: process.env.DATABASE_PORT || 5432,
    // Configuración para usar SSL (recomendado para RDS, pero puede dar problemas en Docker si no se configura bien)
    // ssl: {
    //     rejectUnauthorized: false
    // }
});

// Función para inicializar la tabla de usuarios si no existe
const initializeDatabase = async () => {
    try {
        const query = `
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                username VARCHAR(50) UNIQUE NOT NULL,
                password_hash VARCHAR(100) NOT NULL,
                twofa_secret VARCHAR(100) NULL,
                is_2fa_enabled BOOLEAN DEFAULT FALSE
            );
        `;
        await pool.query(query);
        console.log("Tabla 'users' verificada o creada con éxito.");
    } catch (error) {
        console.error("Error al inicializar la base de datos:", error.message);
    }
};

module.exports = {
    query: (text, params) => pool.query(text, params),
    initializeDatabase,
    pool,
};