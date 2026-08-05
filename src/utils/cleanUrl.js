export const cleanImageUrl = (url) => {
  if (!url || typeof url !== 'string') return url;
  // Match double prepended urls, e.g. http://localhost:5000https://drive.google.com...
  // or https://api.something.comhttps://drive.google.com...
  const match = url.match(/https?:\/\/.*?([a-zA-Z0-9-]+\.google\.com.*)/);
  if (match && match[1]) {
    return 'https://' + match[1];
  }
  return url;
};
