require('dotenv').config({ override: true });
const app = require('./backend/server');

const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0';

app.listen(PORT, HOST, () => {
  console.log(`YourChoice app running at http://${HOST}:${PORT}`);
});
