const app = require('./app');
const { initDB } = require('./db');

const PORT = process.env.PORT || 3000;

initDB()
  .then(() => {
    console.log('Database initialized');
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Failed to initialize database:', err);
    process.exit(1);
  });
