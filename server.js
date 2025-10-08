import app from './app.js';
import { initializeDatabase } from './server/db/index.js';

console.log('starting server...')
const PORT = process.env.PORT || 3001;
initializeDatabase()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Failed to initialize database. Exiting.', error);
    process.exit(1);
  });