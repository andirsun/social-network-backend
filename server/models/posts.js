const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

import * as momentZone from 'moment-timezone';

let Schema = mongoose.Schema;


let postSchema = new Schema({
    time : {
        type : String,
        required:[true, "La fecha es necesaria"],
        default : momentZone().tz('America/Bogota').format("YYYY-MM-DD HH:mm")
    },
    idUser: {
        type: Number,
        required: [true, 'El id del usuario es necesario']
    },
    text: {
        type: String,
        required: [true, 'El nombre es necesario']
    },
    files: [String],
    status: {
        type: Boolean,
        default: true
    }
});



postSchema.plugin(uniqueValidator, { message: '{PATH} debe de ser único' });


module.exports = mongoose.model('posts', postSchema);