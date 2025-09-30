const express = require("express");
const { VerifyToken } = require('../Middlewares/verifyToken');
const { getai } = require("../Controllers/ai");

const route = express.Router();

route.post('/ai', VerifyToken, getai);

module.exports = route;