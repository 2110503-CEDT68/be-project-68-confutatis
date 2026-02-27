const express = require("express");

const router = express.Router();

const {getReservations} = require('../controllers/reservation');

const {protect, authorize} = require('../middleware/auth');

router.route('/').get(protect, getReservations);

module.exports = router;