const mongoose = require('mongoose');

const ReservationSchema = new mongoose.Schema({
    reserveDate: {
        type: Date,
        required: true
    },
    user: {
        type: mongoose.Schema.ObjectId,
        required: true,
    },
    restaurant: {
        type: mongoose.Schema.ObjectId,
        required: true,
    }
});

module.exports = mongoose.model('Reservation', ReservationSchema);