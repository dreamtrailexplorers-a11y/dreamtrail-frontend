export const getImageUrl = (url) => {
  if (!url) return '';
  if (typeof url !== 'string') return '';
  
  if (url.includes('drive.google.com/uc?export=view&id=')) {
    const id = url.split('id=')[1]?.split('&')[0];
    if (id) return `https://drive.google.com/thumbnail?id=${id}&sz=w1000`;
  }
  if (url.includes('drive.google.com/uc?id=')) {
    const id = url.split('id=')[1]?.split('&')[0];
    if (id) return `https://drive.google.com/thumbnail?id=${id}&sz=w1000`;
  }
  if (url.includes('drive.google.com/file/d/')) {
    const id = url.split('/d/')[1]?.split('/')[0];
    if (id) return `https://drive.google.com/thumbnail?id=${id}&sz=w1000`;
  }
  return url;
};
