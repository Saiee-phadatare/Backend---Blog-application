const Joi = require('joi');

exports.signupSchema = Joi.object({
    name: Joi.string().min(5).max(60).required(),
    bio: Joi.string().min(6).max(100),
    email: Joi.string().min(6).max(60).required().email({
        tlds : {allow :['com', 'net']}
    }),
    gender: Joi.string().min(4).max(9),
    password:Joi.string().required().pattern(new RegExp("^[a-zA-Z0-9@]{6,}$"))
});    

exports.signinSchema = Joi.object({
    email: Joi.string().min(6).max(60).required().email({
        tlds : {allow :['com', 'net']}
    }),
    password:Joi.string().required().pattern(new RegExp("^[a-zA-Z0-9@]{6,}$"))
}); 
