#!/usr/bin/env node

/**
 * scripts/cache-bust.js
 * Automatically appends/updates version query strings to local asset references in HTML files
 * to prevent aggressive browser caching on static hosts like GitHub Pages.
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const VERSION = 'v' + new Date().toISOString().replace(/[-:T]/g, '').slice(0, 12);

// Target files to process
const htmlFiles = [
  'index.html',
  'checkout.html',
  'login.html',
  'register.html',
  'orders.html',
  'reset-password.html',
  'admin-dashboard.html',
  'admin-login.html'
];

let totalReplacements = 0;

htmlFiles.forEach(file => {
  const filePath = path.join(ROOT_DIR, file);
  if (!fs.existsSync(filePath)) return;

  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  // Cache-bust script tags (e.g., script.js, navbar.js)
  content = content.replace(/(<script\s+[^>]*src=")([^"]+\.js)(\?[^"]*)?(")/gi, (match, prefix, src, query, suffix) => {
    // Skip external CDNs (FontAwesome, Bootstrap, etc.)
    if (src.startsWith('http://') || src.startsWith('https://') || src.startsWith('//')) {
      return match;
    }
    return `${prefix}${src}?v=${VERSION}${suffix}`;
  });

  // Cache-bust link stylesheet tags (e.g., style.css, admin-style.css)
  content = content.replace(/(<link\s+[^>]*href=")([^"]+\.css)(\?[^"]*)?(")/gi, (match, prefix, href, query, suffix) => {
    // Skip external CDNs
    if (href.startsWith('http://') || href.startsWith('https://') || href.startsWith('//')) {
      return match;
    }
    return `${prefix}${href}?v=${VERSION}${suffix}`;
  });

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    totalReplacements++;
    console.log(`[cache-bust] Updated ${file} with version ?v=${VERSION}`);
  }
});

console.log(`[cache-bust] Completed cache-busting for ${totalReplacements} files (version: ${VERSION}).`);
