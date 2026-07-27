import 'dotenv/config';
import app from './app.js';
import { connectDB } from './config/database.js';

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();

  const server = app.listen(PORT, () => {
    console.log(`IEEE SB API running on port ${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/api/v1/health`);
  });

  process.on('unhandledRejection', (error) => {
    console.error('Unhandled rejection:', error);
    server.close(() => process.exit(1));
  });

  process.on('uncaughtException', (error) => {
    console.error('Uncaught exception:', error);
    server.close(() => process.exit(1));
  });
};

startServer().catch((error) => {
  console.error('Server startup failed:', error);
  process.exit(1);
});
