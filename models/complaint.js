const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const complaintSchema = new Schema({
    name:String,
    email: String,
    complaint:String
  
});

module.exports = mongoose.model('Complaint',complaintSchema);