const Reservation = require('../models/Reservation');

//get all reservations
exports.getReservations = async (req, res, next) => {
    let query;
    const userRole = req.user.role;
    if(userRole==='admin') {
        if(req.params.restaurantId) {
            //get all reserved for that restaurant
            query = Reservation.find({restaurant: req.params.restaurantId});
        } else {
            query = Reservation.find({});
        }
    } else {
        //get all reserved for that user
        query = Reservation.find({user: req.user.id});
        
    }

    try {
        const reservations = await query;
        res.status(200).json({
            success: true,
            count: reservations.length,
            data: reservations
        });
    } catch(err) {
        console.log(err.stack);
        res.status(500).json({
            success: false, 
            message: "Cannot find Reservation"
        });
    }
}