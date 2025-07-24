# AI Features Setup Guide

This guide will help you set up the AI-powered features for your Wallora wall customizer application.

## 🚀 Features Added

### 1. Background Removal
- Uses Remove.bg API to automatically remove backgrounds from images
- Perfect for creating transparent images for collages

### 2. Style Transfer
- Apply artistic filters using AI models via Replicate API
- Multiple styles: Vintage, Modern, Artistic, Cinematic, Watercolor, Sketch

### 3. Smart Layout Suggestions
- AI-generated layout suggestions based on image analysis
- Multiple layout types: Grid, Mosaic, Flow

### 4. Image Analysis
- Analyze images for optimal placement and sizing
- Extract dominant colors, brightness, contrast
- Provide placement recommendations

## 📋 Prerequisites

1. **Node.js** (v16 or higher)
2. **MySQL** database
3. **API Keys** for AI services (see below)

## 🔑 Required API Keys

### 1. Remove.bg API (Background Removal)
1. Go to [Remove.bg](https://www.remove.bg/api)
2. Sign up for a free account
3. Get your API key from the dashboard
4. Free tier: 50 images per month

### 2. Replicate API (Style Transfer)
1. Go to [Replicate](https://replicate.com/)
2. Sign up for an account
3. Get your API token from your account settings
4. Free tier: Limited usage, paid plans available

### 3. Hugging Face API (Optional - Enhanced Analysis)
1. Go to [Hugging Face](https://huggingface.co/)
2. Sign up for an account
3. Get your API key from your profile settings
4. Free tier: Limited usage

### 4. Cloudinary (Optional - Image Processing)
1. Go to [Cloudinary](https://cloudinary.com/)
2. Sign up for a free account
3. Get your cloud name, API key, and API secret
4. Free tier: 25GB storage, 25GB bandwidth

## ⚙️ Configuration

### 1. Create Environment File

Create a `.env` file in the `backend/server/` directory:

```bash
# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=wallora_db

# AI Services Configuration
REMOVE_BG_API_KEY=your_remove_bg_api_key
REPLICATE_API_TOKEN=your_replicate_token
HUGGINGFACE_API_KEY=your_huggingface_key

# Cloudinary (Optional)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Server Configuration
PORT=4000
NODE_ENV=development
```

### 2. Install Dependencies

Navigate to the backend directory and install the new dependencies:

```bash
cd backend/server
npm install
```

### 3. Start the Backend Server

```bash
npm run dev
```

### 4. Start the Frontend

In a new terminal, navigate to the frontend directory:

```bash
cd frontend
npm run dev
```

## 🎯 How to Use

### Background Removal
1. Upload an image to your wall
2. Select the image
3. Click "AI Tools" button
4. Go to "Background" tab
5. Click "Remove Background"
6. Wait for processing (usually 5-10 seconds)

### Style Transfer
1. Select an image on your wall
2. Open AI Tools
3. Go to "Style" tab
4. Choose a style (Vintage, Modern, etc.)
5. Click the style button
6. Wait for processing (may take 30-60 seconds)

### Layout Suggestions
1. Add multiple images to your wall
2. Open AI Tools
3. Go to "Layout" tab
4. Click "Generate Layout Suggestions"
5. Choose from suggested layouts
6. Click to apply the layout

### Image Analysis
1. Select an image
2. Open AI Tools
3. Scroll down to see Image Analysis
4. Click "Analyze Image"
5. View insights about colors, brightness, and placement

## 🔧 Troubleshooting

### Common Issues

1. **"API not configured" error**
   - Check that your API keys are correctly set in the `.env` file
   - Restart the backend server after adding API keys

2. **Background removal fails**
   - Ensure Remove.bg API key is valid
   - Check your monthly quota (free tier: 50 images)
   - Verify image format (JPEG, PNG supported)

3. **Style transfer takes too long**
   - This is normal for AI processing
   - Check your Replicate API quota
   - Try with smaller images for faster processing

4. **Layout suggestions not working**
   - Ensure you have at least 2 images on the wall
   - Check that images are properly loaded

### Debug Mode

To see detailed error messages, check the backend console logs:

```bash
# In backend/server directory
npm run dev
```

Look for error messages in the console output.

## 💡 Tips for Best Results

### Background Removal
- Use high-contrast images for best results
- Avoid complex backgrounds
- Images with clear subject separation work best

### Style Transfer
- Start with clear, well-lit images
- Different styles work better with different image types
- Vintage style works well with portraits
- Modern style is great for landscapes

### Layout Suggestions
- Use images with similar aspect ratios for grid layouts
- Mix different image sizes for more dynamic layouts
- Consider the wall background when choosing layouts

## 🔒 Security Notes

- Never commit your `.env` file to version control
- Keep your API keys secure
- Monitor your API usage to avoid unexpected charges
- Consider using environment variables in production

## 📈 Performance Optimization

### For Production
1. Implement image caching
2. Add rate limiting
3. Use CDN for processed images
4. Implement queue system for long-running tasks

### For Development
1. Use smaller images for testing
2. Monitor API usage
3. Implement proper error handling
4. Add loading states for better UX

## 🆘 Support

If you encounter issues:

1. Check the console logs for error messages
2. Verify API keys are correct
3. Test with a simple image first
4. Check API service status pages
5. Review the troubleshooting section above

## 🎉 Next Steps

Once you have the basic AI features working, consider:

1. **Advanced Style Transfer**: Add more artistic styles
2. **Batch Processing**: Process multiple images at once
3. **Custom Models**: Train your own AI models
4. **Real-time Processing**: Stream processing results
5. **Mobile Optimization**: Optimize for mobile devices

Happy creating with AI! 🚀 