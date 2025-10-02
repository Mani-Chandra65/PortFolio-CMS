const pdf = require('pdf-poppler');
const cloudinary = require('../config/cloudinary');
const fs = require('fs').promises;
const path = require('path');

const convertPdfToImages = async (pdfPath, outputDir = './temp') => {
  try {
    console.log('PDF conversion starting for:', pdfPath);
    
    // Ensure output directory exists
    await fs.mkdir(outputDir, { recursive: true });
    console.log('Output directory created:', outputDir);
    
    const options = {
      format: 'jpeg',
      out_dir: outputDir,
      out_prefix: 'page',
      page: null, // Convert all pages
      quality: 100
    };

    // Get PDF info first
    console.log('Getting PDF info...');
    const pdfInfo = await pdf.info(pdfPath);
    console.log('PDF info retrieved. Pages:', pdfInfo.pages);
    
    // Convert PDF to images
    console.log('Converting PDF to images...');
    await pdf.convert(pdfPath, options);
    console.log('PDF conversion completed');

    const imageUrls = [];
    
    // Upload each page image to Cloudinary
    console.log('Uploading images to Cloudinary...');
    for (let i = 1; i <= pdfInfo.pages; i++) {
      const imagePath = path.join(outputDir, `page-${i}.jpg`);
      console.log(`Uploading page ${i}...`);
      
      try {
        const result = await cloudinary.uploader.upload(imagePath, {
          folder: 'portfolio-cms/resume-images',
          quality: 'auto',
          format: 'jpg'
        });
        
        imageUrls.push(result.secure_url);
        console.log(`Page ${i} uploaded successfully`);
        
        // Clean up local file
        await fs.unlink(imagePath).catch(() => {});
      } catch (uploadError) {
        console.error(`Error uploading page ${i}:`, uploadError);
      }
    }

    console.log('All images uploaded. Total URLs:', imageUrls.length);
    return {
      imageUrls,
      pageCount: pdfInfo.pages
    };
  } catch (error) {
    console.error('PDF conversion error:', error);
    throw new Error('Failed to convert PDF to images');
  }
};

const deletePdfImages = async (imageUrls) => {
  try {
    const deletePromises = imageUrls.map(async (url) => {
      // Extract public_id from Cloudinary secure URL safely
      // Example: https://res.cloudinary.com/<cloud>/image/upload/v1727890000/portfolio-cms/resume-images/page-1.jpg
      try {
        const u = new URL(url);
        const parts = u.pathname.split('/');
        // Find the index of 'upload' and slice after it to keep folder structure + filename
        const uploadIdx = parts.findIndex(p => p === 'upload');
        const pathParts = parts.slice(uploadIdx + 1); // [ 'v12345', 'folder', 'subfolder', 'file.ext' ]
        // Drop version if present (starts with 'v' followed by digits)
        const withoutVersion = pathParts[0] && /^v\d+$/i.test(pathParts[0]) ? pathParts.slice(1) : pathParts;
        // Join back and strip extension
        const joined = withoutVersion.join('/');
        const publicId = joined.replace(/\.[^.]+$/, '');
        return cloudinary.uploader.destroy(publicId, { resource_type: 'image' });
      } catch (e) {
        console.error('Failed to parse Cloudinary URL for deletion:', url, e);
        return Promise.resolve();
      }
    });

    await Promise.all(deletePromises);
  } catch (error) {
    console.error('Error deleting PDF images:', error);
  }
};

module.exports = {
  convertPdfToImages,
  deletePdfImages
};