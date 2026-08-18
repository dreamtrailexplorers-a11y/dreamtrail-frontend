const fs = require('fs');
const file = 'c:/Users/Admin/Downloads/astha/dreamtrail/frontend/src/pages/Admin/ManagePackages.jsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(/const handlePointChange[\s\S]*?<h3 className=\{styles\.cardTitle\}>Itinerary<\/h3>/, 
`const handlePointChange = (i, ptIdx, value) => {
    const newData = [...data];
    newData[i].points[ptIdx] = value;
    onChange(newData);
  };
  const handleUploadItineraryImage = async (e, i) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const res = await uploadFile(file);
      const fullUrl = res.data.url.startsWith('http') ? res.data.url : \`\${import.meta.env.VITE_BACKEND_URL}\${res.data.url}\`;
      handleFieldChange(i, 'image', fullUrl);
    } catch { alert('Upload failed'); }
  };
  return (
    <div className={styles.card} style={{ marginBottom: '20px' }}>
      <h3 className={styles.cardTitle}>Itinerary</h3>`);

content = content.replace(/const handleChange = \(e\) => \{[\s\S]*?catch\(err\) \{\s*alert\('Upload failed'\);\s*\}\s*\};/,
`const handleChange = (e) => {
    const { name, value } = e.target;
    const newFormData = { ...formData, [name]: value };
    
    if (name === 'title') {
      newFormData.slug = generateSlug(value);
    }

    if (name === 'originalPrice' || name === 'discountedPrice') {
      const orig = Number(newFormData.originalPrice) || 0;
      const disc = Number(newFormData.discountedPrice) || 0;
      newFormData.saveAmount = (orig > disc && disc > 0) ? orig - disc : 0;
    }
    
    setFormData(newFormData);
  };
  
  const handleBasicChange = (e) => {
    const { name, value } = e.target;
    setBasicForm(prev => ({
      ...prev,
      [name]: value,
      ...(name === 'title' ? { slug: generateSlug(value) } : {})
    }));
  };

  useEffect(() => {
    fetchTrips();
    const fetchDestinations = async () => {
      try {
        const { data } = await getDestinations();
        setDestinations(data);
      } catch (err) {
        console.error('Failed to fetch destinations');
      }
    };
    fetchDestinations();
  }, [destName, refreshKey]);

  const handleUploadMainImage = async (e) => {
    const file = e.target.files[0];
    if(!file) return;
    try {
      const res = await uploadFile(file);
      const fullUrl = res.data.url.startsWith('http') ? res.data.url : \`\${import.meta.env.VITE_BACKEND_URL}\${res.data.url}\`;
      setFormData({ ...formData, image: fullUrl });
    } catch(err) {
      alert('Upload failed');
    }
  };`);

fs.writeFileSync(file, content);
console.log('Fixed file');
