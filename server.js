const path = require('path');
const dotenv = require('dotenv');

// Load environment variables from both backend/.env and root .env
dotenv.config({ path: path.resolve(__dirname, 'backend/.env'), override: true });
dotenv.config({ path: path.resolve(__dirname, '.env'), override: true });

// Import static product array from ./src/assets/products.js as requested
const staticProducts = require('./src/assets/products.js');

const app = require('./backend/server');

const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0';

if (require.main === module) {
  app.listen(PORT, HOST, () => {
    console.log(`YourChoice app running at http://${HOST}:${PORT}`);
  });
}

module.exports = app;
module.exports.staticProducts = staticProducts;
