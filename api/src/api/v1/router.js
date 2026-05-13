const express = require('express');
const router = express.Router();
const authRoutes = require('./modules/auth/auth.routes');
const usersRoutes = require('./modules/users/users.routes');
const professionalRoutes = require('./modules/professional/professional.routes');
const servicesRoutes = require('./modules/services/services.routes');
const patientsRoutes = require('./modules/patients/patients.routes');
const appointmentsRoutes = require('./modules/appointments/appointments.routes');

router.use('/auth', authRoutes);
router.use('/users', usersRoutes);
router.use('/professionals', professionalRoutes);
router.use('/services', servicesRoutes);
router.use('/patients', patientsRoutes);
router.use('/appointments', appointmentsRoutes);

module.exports = router;
