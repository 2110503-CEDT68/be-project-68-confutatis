const Reservation = require('../models/Reservation');
const Restaurant = require('../models/Restaurant');

//get all reservations
exports.getReservations = async (req, res, next) => {
    let query;

    if(req.user.role !== 'admin') {
        if(req.params.restaurantId) { // only allow if it has restaurant id, get user's reservations
            console.log(req.params.restaurantId);
            query = Reservation.find({user: req.user.id, restaurant: req.params.restaurantId}).populate({
                path: 'restaurant',
                select: 'name address tel'
            })
        } else {
            query = Reservation.find({user: req.user.id}).populate({
                path: 'restaurant',
                select: 'name address tel'
            })
        }
    } else {
        if(req.params.restaurantId) {
            console.log(req.params.restaurantId);
            query = Reservation.find({restaurant: req.params.restaurantId}).populate({
                path: 'restaurant',
                select: 'name address tel'
            });
        } else {
            query = Reservation.find({}).populate({
                path: 'restaurant',
                select: 'name address tel'
            });
        }
    }

    try {
        const reservations = await query;

        res.status(200).json({
            success: true,
            count: reservations.length,
            data: reservations
        })
    } catch(err) {
        console.log(err.stack);
        return res.status(500).json({
            success: false, 
            message: "Cannot find Reservation"
        });
    }
}

exports.getReservation = async (req, res, next) => {
    try {
        const reservation = await Reservation.findById(req.params.id).populate({
            path: 'restaurant',
            select: 'name address tel'
        });
        if(!reservation) {
            res.status(404).json({
                success: false,
                message: `No reservation with the id of ${req.params.id}`
            });
        }
        if(reservation.user.toString()!==req.user.id && req.user.role !== 'admin') {
            return res.status(401).json({
                success: false, 
                message: `User ${req.user.id} is not authorized to view this reservation`
            });
        }
        res.status(200).json({
            success: true,
            data: reservation
        })
    } catch(err) {
        console.log(err.stack);
        return res.status(500).json({
            success: true,
            message: 'Cannot find Reservation'
        });
    }
}

exports.addReservation = async (req, res, next) => {
    try {
        req.body.restaurant = req.params.restaurantId;

        const restaurant = await Restaurant.findById(req.params.restaurantId);
        if(!restaurant) {
            return res.status(404).json({
                success: false,
                message: `No restaurant with the id of ${req.params.restaurantId}`
            });
        }
        let reserveDateRaw = req.body.reserveDate;
        // format again because maybe xss sanitizer explode the data
        if (typeof reserveDateRaw === "string") {
            reserveDateRaw = reserveDateRaw.replace(
                /^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2})(\d{3})Z$/,
                "$1.$2Z"
            );
            req.body.reserveDate = reserveDateRaw;
        }
        const openTime = restaurant.openTime;
        const closeTime = restaurant.closeTime;
        const reservedTimeData = req.body.reserveDate;
        const reservedTime = reservedTimeData.slice(11, 16);
        console.log(reservedTimeData);
        // console.log(req.body);
        console.log(`Restarant time: ${openTime}-${closeTime}, your reserved ${reservedTime}`);
        if(reservedTime<openTime || reservedTime>closeTime) {
            return res.status(400).json({
                success: false, 
                message: `Restarant time: ${openTime}-${closeTime}, your reserved ${reservedTime}`
            });
        }

        req.body.user = req.user.id;
        const existedReservations = await Reservation.find({user: req.user.id});
        if(existedReservations.length>=3 && req.user.role !== 'admin') {
            return res.status(400).json({
                success: false,
                message: `The user with ID ${req.user.id} has already made 3 reservations` 
            })
        }
        

        const reservation = await Reservation.create(req.body);
        res.status(200).json({
            success: true,
            data: reservation
        });
    } catch(err) {
        console.log(err.stack);
        return res.status(500).json({
            success: false,
            message: 'Cannot create Reservation'
        });
    }
}

exports.updateReservation = async (req, res, next) => {
    try {
        let reservation = await Reservation.findById(req.params.id);
        if(!reservation) {
            return res.status(404).json({
                success: false,
                message: `No reservation with the id of ${req.params.id}`
            });
        }

        if(reservation.user.toString()!==req.user.id && req.user.role !== 'admin') {
            return res.status(401).json({
                success: false, 
                message: `User ${req.user.id} is not authorized to update this reservation`
            });
        }

        // format again because maybe xss sanitizer explode the data
        let reserveDateRaw = req.body.reserveDate;
        if (typeof reserveDateRaw === "string") {
            reserveDateRaw = reserveDateRaw.replace(
                /^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2})(\d{3})Z$/,
                "$1.$2Z"
            );
            req.body.reserveDate = reserveDateRaw;
        }

        reservation = await Reservation.findByIdAndUpdate(req.params.id, req.body, {
            new: true, 
            runValidators: true
        });

        res.status(200).json({
            success: true, 
            data: reservation
        });
    } catch(err) {
        console.log(err.stack);
        return res.status(500).json({
            success: false, 
            message: 'Cannot update Reservation'
        })
    }
}

exports.deleteReservation = async (req, res, next) => {
    try {
        const reservation = await Reservation.findById(req.params.id);
        if(!reservation) {
            return res.status(404).json({
                success: false, 
                message: `No reservation with the id of ${req.params.id}`
            });
        }

        if(reservation.user.toString()!==req.user.id && req.user.role !== 'admin') {
            return res.status(401).json({
                success: false, 
                message: `User ${req.user.id} is not authorized to delete this reservation`
            });
        }
        await reservation.deleteOne();
        res.status(200).json({
            success: true, 
            data: {}
        });
    } catch(err) {
        console.log(err.stack);
        return res.status(500).json({
            success: true,
            message: 'Cannot delete Reservation'
        });
    }
}