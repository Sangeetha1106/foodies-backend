const db = require('../config/db');

// @desc    Submit a contact message
// @route   POST /api/contact
// @access  Public
const submitContactMessage = async (req, res) => {
    const { name, email, message } = req.body;

    console.log('Received contact message:', req.body);

    if (!name || !email || !message) {
        return res.status(400).json({ message: 'Please provide all fields' });
    }

    try {
        await db.query(
            "INSERT INTO contact_messages (name, email, message) VALUES ($1, $2, $3)",
            [name, email, message]
        );

        res.status(201).json({ message: "Message sent successfully" });
    } catch (error) {
        console.error('Error saving contact message:', error);
        res.status(500).json({ message: "Something went wrong!" });
    }
};

module.exports = {
    submitContactMessage,
};
