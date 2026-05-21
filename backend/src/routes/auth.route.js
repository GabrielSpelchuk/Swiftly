const express = require('express');
const authController = require('../controllers/auth.controller');
const { catchError } = require('../utils/catchError');

const authRoute = express.Router();

authRoute.post('/register', catchError(authController.registration));
authRoute.post('/login', catchError(authController.login));
authRoute.get('/activate/:activationToken', catchError(authController.activate));
authRoute.get('/refresh', catchError(authController.refresh));
authRoute.post('/logout', catchError(authController.logout));
authRoute.post('/forgot-password', catchError(authController.forgotPassword));
authRoute.post('/reset-password', catchError(authController.resetPassword));

module.exports = { authRoute };
