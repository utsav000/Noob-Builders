const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const opts = { toJSON: { virtuals: true } };
const ImageSchema = new Schema({
    url: String,
    filename: String
});

ImageSchema.virtual('thumbnail').get(function () {
    return this.url.replace('/upload', '/upload/w_300');
});


const complaintSchema = new Schema({
    name: String,
    email: String,
    complaint: String,
    images: [ImageSchema],

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
    },
    phone: String,
    category: String,
}, opts);

module.exports = mongoose.model('Complaint', complaintSchema);