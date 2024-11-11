import app from './app.js';
import cloudinary from 'cloudinary';


// Cloudinary Configuration
cloudinary.v2.config({
    cloud_name: process.env.CLOUDINARY_CLIENT_NAME,
    api_key: process.env.CLOUDINARY_CLIENT_API,
    api_secret: process.env.CLOUDINARY_CLIENT_SECRET,
});

// Start the server
const port = process.env.PORT || 9000;  // Use 8000 as fallback

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
