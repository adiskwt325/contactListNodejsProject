const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ContactListSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    phoneNumber: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    }
});

module.exports = ContactList = mongoose.model('contactList', ContactListSchema);