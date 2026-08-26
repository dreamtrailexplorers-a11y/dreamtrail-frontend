const fs = require('fs');
let code = fs.readFileSync('src/pages/Admin/ManagePackages.jsx', 'utf8');

// 1. Remove initiateUpload, finalizeUpload from imports
code = code.replace(', initiateUpload, finalizeUpload', '');

// 2. Replace handleUploadPDF
const newHandleUploadPDF = `  const handleUploadPDF = async (e) => {
    const file = e.target.files[0];
    if(!file) return;
    try {
      const res = await uploadFile(file);
      const fullUrl = res.data.url.startsWith('http') ? res.data.url : \`\${import.meta.env.VITE_BACKEND_URL}\${res.data.url}\`;
      setFormData({ ...formData, pdfUrl: fullUrl });
    } catch(err) {
      console.error(err);
      alert('PDF Upload failed: ' + err.message);
    }
  };`;

const startIdx = code.indexOf('  const handleUploadPDF = async (e) => {');
const endIdx = code.indexOf('  const handleUploadMapImage = async (e) => {');
if(startIdx !== -1 && endIdx !== -1) {
  code = code.substring(0, startIdx) + newHandleUploadPDF + '\n\n' + code.substring(endIdx);
  fs.writeFileSync('src/pages/Admin/ManagePackages.jsx', code);
  console.log('Fixed ManagePackages.jsx successfully!');
} else {
  console.log('Could not find functions');
}
