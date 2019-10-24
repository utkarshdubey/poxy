const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//create Schema
const LinkSchema = new Schema({
    link : {
        type: String,
        required : true
    },
    new_link : {
        type : String,
        required : true
    },
    date : {
        type : Date,
        default : Date.now
    },
});

//connect schema to model
mongoose.model('links', LinkSchema);