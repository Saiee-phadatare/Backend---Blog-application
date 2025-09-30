const mongoose = require('mongoose');

const connectingDB = async ()=> {
    try{
        await mongoose.connect(process.env.MONGODBURI);
        console.log('Mongodb Connected');
    }catch(err){
        console.log(err);
    }
}

module.exports = connectingDB;