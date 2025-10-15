# Document Upload Fix Guide

## Issues Fixed:
1. **Port Mismatch**: Updated API service to use correct backend port (5001)
2. **CORS Configuration**: Added proper CORS settings for file uploads
3. **Error Handling**: Added better error messages and debugging
4. **Proxy Setup**: Added proxy configuration in package.json

## To Test the Fix:

### 1. Start Backend Server
```bash
cd backend
npm start
```
The server should start on port 5001 and show "MongoDB connected"

### 2. Start Frontend Server
```bash
cd frontend
npm start
```
The frontend should start on port 3000

### 3. Test Upload
1. Go to http://localhost:3000/documents
2. Try uploading a PDF, DOCX, or TXT file
3. Check browser console for any errors
4. Check backend console for upload logs

### 4. Test Backend Directly (Optional)
```bash
node test-upload.js
```

## Debugging Steps:

### If upload still fails:

1. **Check Backend Logs**: Look for console messages in the backend terminal
2. **Check Browser Network Tab**: Look for failed requests to `/api/documents/upload`
3. **Check CORS**: Ensure no CORS errors in browser console
4. **Test Backend Health**: Visit http://localhost:5001/api/health

### Common Issues:
- **MongoDB not running**: Start MongoDB service
- **Port conflicts**: Change ports in .env files
- **File size too large**: Max 10MB per file
- **Unsupported file type**: Only PDF, DOCX, TXT allowed

## Changes Made:

### Frontend (`frontend/src/pages/Documents.js`):
- Added proper API service usage
- Added error handling and debugging
- Added error display UI

### Frontend (`frontend/src/services/api.js`):
- Fixed API base URL to use port 5001

### Frontend (`frontend/package.json`):
- Added proxy configuration

### Backend (`backend/src/app.js`):
- Updated CORS configuration
- Added health check endpoint
- Added request logging

### Backend (`backend/src/controllers/documentController.js`):
- Added debug logging for uploads

The upload should now work properly. If you still encounter issues, check the console logs for specific error messages.