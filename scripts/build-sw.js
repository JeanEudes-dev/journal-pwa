import { generateSW } from 'workbox-build';
import { resolve } from 'path';

const swDest = resolve('./dist/sw.js');

generateSW({
  globDirectory: 'dist',
  globPatterns: ['**/*.{html,js,css,png,svg,jpg,jpeg,gif,webp,woff,woff2,ttf,eot,ico,json}'],
  swDest,
  skipWaiting: true,
  clientsClaim: true,
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/fonts\.googleapis\.com\//,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'google-fonts-stylesheets',
      },
    },
    {
      urlPattern: /^https:\/\/fonts\.gstatic\.com\//,
      handler: 'CacheFirst',
      options: {
        cacheName: 'google-fonts-webfonts',
        expiration: {
          maxEntries: 30,
          maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
        },
      },
    },
    {
      urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
      handler: 'CacheFirst',
      options: {
        cacheName: 'images',
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
        },
      },
    },
    {
      urlPattern: /\.(?:js|css)$/,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'static-resources',
      },
    },
  ],
  mode: 'production',
})
  .then(({ count, size, warnings }) => {
    console.log(`Generated service worker with ${count} files, totaling ${size} bytes.`);
    if (warnings.length > 0) {
      console.warn('Warnings encountered while generating service worker:', warnings.join('\n'));
    }
  })
  .catch(error => {
    console.error('Error generating service worker:', error);
  });
