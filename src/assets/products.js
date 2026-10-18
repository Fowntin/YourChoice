// Product Catalog Bridge: Exports static product definitions from /src/products.js
const staticCatalog = require('../products');

const products = Array.isArray(staticCatalog) ? staticCatalog : (staticCatalog.products || []);

module.exports = products;
module.exports.products = products;
