const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');

dotenv.config();
//files 
const connectingDB = require('./Utils/connection');
const userRoute = require('./routes/userRoutes');
const postRoute = require('./routes/postRoutes');
const airoute = require('./routes/aiRoute');

const app = express();
let PORT = process.env.PORT

//Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

//DB connection
connectingDB();

//routes
app.use('/auth', userRoute);
app.use('/post', postRoute);
app.use('/',airoute);


app.listen(PORT, ()=> console.log(`Server running on port ${PORT}`));
