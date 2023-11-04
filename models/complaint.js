const mongoose = require('mongoose');
const Schema = mongoose.Schema;



const complaintSchema = new Schema({
    name: String,
    email: String,
    complaint: String,
    geometry: {
        type: {
            type: String,
            enum: ['Point'],
            required: true
        },

        coordinates: {
            type: [Number],
            required: true
        }
    }

});

module.exports = mongoose.model('Complaint', complaintSchema);