const mongoose = require('mongoose');
const RestaurantSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true,'Please add a name'],
        unique: true,
        trim:true,
        maxlength:[50,'Name can not be more than 50 characters']
    },
    address:{
        type: String,
        required: [true, 'Please add an address']
    },
    tel:{
        type: String
    },
    openTime:{
        type: Date,
        required: [true, 'Please add a open time']
    },
    closeTime:{
        type: Date,
        required: [true, 'Please add a close time']
    }
},{
    toJSON: {virtuals:true},
    toObject:{virtuals:true}
});

RestaurantSchema.virtual('reservations',{
    ref:'Reservation',
    localField: '_id',
    foreignField: 'restaurant',
    justOne: false
});

module.exports=mongoose.model('Restaurant',RestaurantSchema);