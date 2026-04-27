const { app, PORT } = require('./app');
const { connectDB } = require('./config/db');

// Main function to start the application
const startServer = async () => {
    try {
        // 1. Initialize Database Connection
        await connectDB();

        // 2. Start Express Server
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    } catch (error) {
        console.error("Critical Failure: Server could not start", error.message);
    }
};

startServer();
