const Restaurant = require('../models/Restaurant');
//const Reservation = require('../models/Reservation.js');
//@desc Get all Restaurants 
//@routeGET /api/v1/Restaurants
//@access Public
exports.getRestaurants = async (req,res,next)=>{
    let query;

    const reqQuery= {...req.query};

    const removeFields=['select','sort','page','limit'];

    removeFields.forEach(param=>delete reqQuery[param]);
    console.log(reqQuery);

    let queryStr = JSON.stringify(reqQuery);
    queryStr = queryStr.replace (/\b(gt|gte|lt|lte|in)\b/g, match=>`$${match}`);

    query = Restaurant.find(JSON.parse (queryStr)).populate('Reservations');

    if(req.query.select) 
    {
        const fields = req.query.select.split(',').join(' ');
        query = query.select(fields);
    }

    if(req.query.sort) 
    {
        const sortBy = req.query.sort.split(',').join(' ');
        query = query.sort(sortBy);
    } 
    else 
    {
        query = query.sort('-createdAt');
    }

    const page = parseInt(req.query.page,10) || 1;
    const limit = parseInt(req.query.limit,10) || 25;
    const startIndex = (page-1) * limit;
    const endIndex = page * limit;
    const total = await Restaurant.countDocuments();

    query = query.skip(startIndex).limit(limit);

    const pagination ={};

    if (endIndex < total) 
    {
        pagination.next={
            page:page+1,
            limit
        }
    }

    if (startIndex > 0) {
        pagination.prev={
            page:page-1,
            limit
        }
    }

    try{
        const Restaurants = await query;
        //const Restaurants = await Restaurant.find(req.query);
        console.log(req.query);

        res.status (200).json({success:true, count:Restaurants.length,pagination , data:Restaurants});
    } catch(err){
        res.status (400).json({success:false});
    }
    
};
//@desc Get sigle Restaurant
//@route GET/api/v1/Restaurants/:id
//@access Public 
exports.getRestaurant= async (req,res,next)=>{
    try{
        const Restaurant = await Restaurant.findById(req.params.id);

        if (!Restaurant) {
            return res.status (400).json({success:false});
        }

        res.status (200).json({success:true, data:Restaurant});
    } catch(err){
        res.status (400).json({success:false});
    }
    //res.status(200).json({success:true,msg:`Show Restaurant ${req.params.id}`});
};
//@desc Create new Restaurant 
//@route POST /api/v1/Restaurants
//@access Private
exports.createRestaurant = async(req,res,next)=>{
    const Restaurant = await Restaurant.create(req.body);
    res.status (201).json({
        success: true,
        data: Restaurant
    });

    //res.status(200).json({success:true, msg:'Create new Restaurants'});
};
//@desc Update Restaurant
//@route 
//@accessPrivate PUT /api/v1/Restaurants/:id
exports.updateRestaurant= async (req, res,next)=> {
    try{
        const Restaurant = await Restaurant.findByIdAndUpdate (req.params.id, req.body, {
            new: true,
            runValidators:true
        });

        if(!Restaurant){
            return res.status (400).json({success:false});
        }

        res.status (200).json({success:true, data: Restaurant});
    }catch (err){
        res.status (400).json({success:false});
    }
};
//@desc Delete Restaurant 
//@routeDELETE /api/v1/Restaurants/:id
//@access Private
exports.deleteRestaurant = async (req,res,next)=>{
    try {
        const Restaurant = await Restaurant.findById(req.params.id);

        if(!Restaurant)
        {
            return res.status (404).json({success:false, message:`Restaurant not found with id of ${req.params.id}`});
        }
        await Reservation.deleteMany({ Restaurant: req.params.id });
        await Restaurant.deleteOne({ _id: req.params.id });

        res.status (200).json({success:true, data: {}});
    } catch(err){
        res.status (400).json({success:false});
    }
    //res.status(200).json({success:true, msg:`Delete Restaurant ${req.params.id}`});
};
