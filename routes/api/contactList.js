const express = require('express');
const router = express.Router();
const {check, validationResult } = require('express-validator');

const ContactList = require('../../models/ContactList');
const Contacts = require('../../models/Contacts');

// @route   POST api/contactList
// @desc    Create or update user profile
// @access  Public
router.post('/',
[
    check('name', 'Name is Required').not().isEmpty(),
    check('email', 'Pease enter a valid email').isEmail(),
    check('phoneNumber', 'Please enter a valid Phone Number.').isLength({ min: 10 })
],
async (req,res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({ errors: errors.array() });
    }

    const {
        name,
        email,
        phoneNumber
    } = req.body;

    // Build contactList Object
    const contactListFields = {};
     if(name) contactListFields.name = name;
     if(email) contactListFields.email = email;
     if(phoneNumber) contactListFields.phoneNumber = phoneNumber;

    try {
        let contactList = await ContactList.findOne({ 
            $or: [
                {
                    email: email
                }
                // ,
                // {
                //     phoneNumber: phoneNumber
                // }
            ]
            });

        if(contactList){
            // Update
            contactList = await ContactList.findOneAndUpdate(
                { email: email },
                { $set: contactListFields},
                { new: true }
                );
            return res.status(400).send('User already exists details updated.');
        }

        contactList = new ContactList(contactListFields);

        await contactList.save();

        res.send(contactList);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }

    
});


// @route   GET api/contactList
// @desc    Get entire contactList
// @access  Public
router.get('/',
async (req,res) => {

    try {
        const contactList = await ContactList.find();
        
        let ContactListWithContacts = [];
        for (let i = 0;i<contactList.length;i++){
                const contacts = await Contacts.find({ contactOf: contactList[i]._id});
                const { _id, name, email, phoneNumber, date } = contactList[i];
                const newContactListoObj = { _id, name, email, phoneNumber, date, contacts };
                ContactListWithContacts.push(newContactListoObj);
            }
        
        res.json(ContactListWithContacts);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }

});

// @route   GET api/contactList/:id
// @desc    Get user by id
// @access  Public
router.get('/:id',
async (req,res) => {

    try {
        const contactList = await ContactList.findById(req.params.id);
        if(!contactList){
            return res.status(400).json({ msg: 'User Not found' });
        }
        
        const contacts = await Contacts.find({ contactOf: contactList._id});
        const { _id, name, email, phoneNumber, date } = contactList;
        const newContactListoObj = { _id, name, email, phoneNumber, date, contacts };
        
        res.json(newContactListoObj);
    } catch (err) {
        console.error(err);
        if(err.kind == 'ObjectId'){
            return res.status(400).json({ msg: 'User Not found' });
        }
        res.status(500).send('Server Error');
    }

});

// @route   GET api/contactList/filter/:contactType
// @desc    Get entire contactList filter contacts by contact type
// @access  Public
router.get('/filter/:contactType',
async (req,res) => {

    try {
        const contactList = await ContactList.find();
        
        let ContactListWithContacts = [];
        for (let i = 0;i<contactList.length;i++){
            let contacts;
            if(req.params.contactType === 'All'){
                contacts = await Contacts.find({ contactOf: contactList[i]._id });
            }else{
                contacts = await Contacts.find({ contactOf: contactList[i]._id, contactType: req.params.contactType });
            }
                
                const { _id, name, email, phoneNumber, date } = contactList[i];
                const newContactListoObj = { _id, name, email, phoneNumber, date, contacts };
                ContactListWithContacts.push(newContactListoObj);
            }
        
        res.json(ContactListWithContacts);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }

});

// @route   GET api/contactList/filter/:id/:contactType
// @desc    Get user by id and filter contacts by contact type
// @access  Public
router.get('/filter/:id/:contactType',
async (req,res) => {

    try {
        const contactList = await ContactList.findById(req.params.id);
        if(!contactList){
            return res.status(400).json({ msg: 'User Not found' });
        }
        
        let contacts;
        if(req.params.contactType === 'All'){
            contacts = await Contacts.find({ contactOf: contactList._id });
        }else{
            contacts = await Contacts.find({ contactOf: contactList._id, contactType: req.params.contactType });
        }

        const { _id, name, email, phoneNumber, date } = contactList;
        const newContactListoObj = { _id, name, email, phoneNumber, date, contacts };
        
        res.json(newContactListoObj);
    } catch (err) {
        console.error(err);
        if(err.kind == 'ObjectId'){
            return res.status(400).json({ msg: 'User Not found' });
        }
        res.status(500).send('Server Error');
    }

});

// @route   DELETE api/contactList/:id
// @desc    Delete user by id
// @access  Public

router.delete('/:id',
async (req,res) => {

    try {
        await Contacts.deleteMany({ contactOf: req.params.id });
        const contactList = await ContactList.findOneAndDelete({ _id: req.params.id });

        if(!contactList){
            return res.status(400).json({ msg: 'User Not found' });
        }

        res.json({ msg: 'User deleted' });
    } catch (err) {
        console.error(err.message);
        if(err.kind == 'ObjectId'){
            return res.status(400).json({ msg: 'User Not found' });
        }
        res.status(500).send('Server Error');
    }

});



// @route   POST api/contactList/contact/:id
// @desc    Add contact Bussiness or personal
// @access  Public          
router.post(
    '/contact/:id',
    [
        check('contactName', 'Name is required').not().isEmpty(),
        check('contactEmail', 'Please enter a valid email').isEmail(),
        check('contactPhone', 'Please enter a valid phone number').isLength({ min: 10 }),
        check('contactType', 'Contact Type is required').not().isEmpty(),
    ],
   async (req, res) => {
        const errors = validationResult(req);
        if(!errors.isEmpty()){
            return res.status(400).json({ errors: errors.array() });
        }

        const contactList = await ContactList.findById(req.params.id);
        if(!contactList){
            return res.status(400).json({ msg: 'User Not found' });
        }

        const {
            contactName,
            contactEmail,
            contactPhone,
            contactType
        } = req.body;


        // Build contacts object
        const contactsFields = {};
        contactsFields.contactOf = req.params.id;
        if (contactName) contactsFields.contactName = contactName;
        if (contactEmail) contactsFields.contactEmail = contactEmail;
        if (contactPhone) contactsFields.contactPhone = contactPhone;
        if (contactType) contactsFields.contactType = contactType;

       
        try {
            let contacts = await Contacts.findOne({ contactOf: req.params.id, contactEmail: contactEmail });

            if(contacts){
                // Update
                contacts = await Contacts.findOneAndUpdate(
                    { contactOf: req.params.id, contactEmail: contactEmail },
                    { $set: contactsFields },
                    { new: true }
                );

                return res.json({ msg: 'Contact updated.' });;
            }
            
            // Create
            contacts = new Contacts(contactsFields);

            await contacts.save();
            res.json(contacts);
            
        } catch (error) {
            console.error(error.message);
            res.status(500).send('Server Error');
        }

    }
);


// @route   DELETE api/contactList/contact/:contactId
// @desc    Delete contact by contactId
// @access  Public

router.delete('/contact/:contactId',
async (req,res) => {

    try {
        const contacts = await Contacts.findOneAndDelete({ _id: req.params.contactId });

        if(!contacts){
            return res.status(400).json({ msg: 'Contact Not found' });
        }

        res.json({ msg: 'Contact deleted' });
    } catch (err) {
        console.error(err.message);
        if(err.kind == 'ObjectId'){
            return res.status(400).json({ msg: 'Contact Not found' });
        }
        res.status(500).send('Server Error');
    }

});

   

module.exports = router;