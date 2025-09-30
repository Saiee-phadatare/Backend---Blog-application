const bcrypt = require('bcrypt');

const hash = async(password)=>{
    return bcrypt.hash(password, 10);
}

const compare = async(password, hashedPassword)=>{
    return bcrypt.compare(password, hashedPassword );
}

module.exports ={
    hash,
    compare
} 