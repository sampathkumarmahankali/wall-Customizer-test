# API Keys Setup Guide

This guide will help you set up the API keys for all AI services used in the Wallora application.

## Create .env File

Create a `.env` file in the `backend` directory with the following content:

```env
# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Database Configuration
MYSQL_HOST=localhost
MYSQL_USER=root
MYSQL_PASSWORD=Sunny@123
MYSQL_DATABASE=wallora

# Server Configuration
PORT=4000

# AI Services API Keys

# Remove.bg API - Background Removal
# Get your API key from: https://www.remove.bg/api
REMOVE_BG_API_KEY=your-remove-bg-api-key-here

# Cloudinary - Image Processing
# Get your credentials from: https://cloudinary.com/console
CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret

# Replicate API - AI Models and Style Transfer
# Get your API token from: https://replicate.com/account/api-tokens
REPLICATE_API_TOKEN=your-replicate-api-token-here

# Hugging Face API - Additional AI Models
# Get your API key from: https://huggingface.co/settings/tokens
HUGGINGFACE_API_KEY=your-huggingface-api-key-here

# Debug Mode (optional)
DEBUG=false
```

## How to Get API Keys

### 1. Remove.bg API Key
- Visit: https://www.remove.bg/api
- Sign up for a free account
- Get your API key from the dashboard
- Replace `your-remove-bg-api-key-here` with your actual API key

### 2. Cloudinary Credentials
- Visit: https://cloudinary.com/console
- Sign up for a free account
- Get your Cloud Name, API Key, and API Secret from the dashboard
- Replace the placeholder values with your actual credentials

### 3. Replicate API Token
- Visit: https://replicate.com/account/api-tokens
- Sign up for an account
- Create a new API token
- Replace `your-replicate-api-token-here` with your actual token

### 4. Hugging Face API Key
- Visit: https://huggingface.co/settings/tokens
- Sign up for an account
- Create a new API token
- Replace `your-huggingface-api-key-here` with your actual API key

## Features Enabled by Each API

### Remove.bg API
- ✅ Background removal from images
- ✅ Automatic image processing
- ✅ High-quality results

### Cloudinary
- ✅ Image upload and storage
- ✅ Image transformations
- ✅ Cloud-based image processing

### Replicate API
- ✅ Style transfer effects
- ✅ AI-powered image enhancements
- ✅ Advanced image processing models

### Hugging Face API
- ✅ Additional AI models
- ✅ Text-to-image generation
- ✅ Advanced AI features

## Security Notes

1. **Never commit your .env file to version control**
2. **Keep your API keys secure and private**
3. **Use different keys for development and production**
4. **Monitor your API usage to avoid unexpected charges**

## Testing Your API Keys

After setting up your .env file, restart your backend server:

```bash
cd backend
npm run dev
```

The AI services will automatically be enabled based on which API keys you provide.

## Troubleshooting

### If services are not working:
1. Check that your .env file is in the correct location (`backend/.env`)
2. Verify that your API keys are correct
3. Ensure you have sufficient credits/quota for the services
4. Check the backend logs for any error messages

### Common Issues:
- **Remove.bg**: Free tier has limited requests per month
- **Cloudinary**: Free tier has storage and transformation limits
- **Replicate**: Pay-per-use model, monitor your usage
- **Hugging Face**: Free tier available with rate limits 