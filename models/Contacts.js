const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ContactsSchema = new Schema({
    contactOf: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'contactList'
    },
    contactName: {
        type: String,
        required: true
    },
    contactEmail: {
        type: String,
        required: true
    },
    contactPhone: {
        type: String,
        required: true
    },
    contactType: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    }
});

module.exports = Contacts = mongoose.model('contacts', ContactsSchema);