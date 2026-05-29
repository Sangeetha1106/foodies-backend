require("dotenv").config();

const { app, PORT } = require('./app');

// Import db to trigger connection on startup
require('./config/db');

// Start Express Server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
