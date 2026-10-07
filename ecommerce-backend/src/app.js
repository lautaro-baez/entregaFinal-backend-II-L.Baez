import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import passport from 'passport';
import { connectDB } from './config/db.js';
import { initializePassport } from './config/passport.config.js';

import sessionsRouter from './routes/sessions.router.js';
import productsRouter from './routes/products.router.js';
import cartsRouter from './routes/carts.router.js';

const app = express();
const PORT = process.env.PORT || 8080;

// Middlewares globales
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Inicializar base de datos y Passport
connectDB();
initializePassport();
app.use(passport.initialize());

// Rutas de la aplicación
app.use('/api/sessions', sessionsRouter);
app.use('/api/products', productsRouter);
app.use('/api/carts', cartsRouter);

app.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});