# Deployment Guide - Vercel & Tally Connection

## Problem Solved

The original implementation tried to connect to Tally via serverless API routes, which **doesn't work on Vercel** because:

1. Vercel serverless functions run in the cloud
2. They cannot access `localhost` or private IPs (192.168.x.x)
3. Tally servers run on local/private networks

**Error:** `504 Gateway Timeout` when calling `/tally/api` on Vercel

## Solution: Client-Side Direct Connection

The application now uses **client-side direct connections** from the browser to Tally, which works both locally and on Vercel.

### How It Works

```
[Browser] → [Direct HTTP Request] → [Tally Server on Local Network]
```

Instead of:
```
[Browser] → [Vercel Function] ✗ [Tally on Localhost] (Cannot reach)
```

## Prerequisites for Vercel Deployment

### 1. Enable CORS in Tally Prime

**Critical:** Browsers require CORS headers to connect to Tally from web applications.

Edit `tally.ini` file:
```ini
[Gateway]
EnableCORS = Yes
AllowedOrigins = *
```

Restart Tally after making changes.

**Location of tally.ini:**
- Windows: `C:\Program Files\Tally.ERP9\tally.ini`
- Or where Tally is installed

### 2. Enable ODBC Server

1. Gateway of Tally → F11 (Features)
2. Navigate to Connectivity
3. Enable "ODBC Server"
4. Note the port (default: 9000)

### 3. Network Access

For users outside your local network to access Tally:

#### Option A: VPN (Recommended)
- Set up VPN to your office network
- Users connect via VPN
- Access Tally as if on local network

#### Option B: Secure Tunnel (Development/Testing Only)
- Use CloudFlare Tunnel or ngrok
- **Not recommended for production due to security concerns**

Example with ngrok:
```bash
ngrok http 9000
```

Then use the ngrok URL in your app.

#### Option C: Public IP (Not Recommended)
- Expose Tally server with public IP
- **Security risk - requires extensive hardening**
- Use firewall rules, authentication, etc.

## Deploying to Vercel

### Step 1: Push to Git

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin <your-repo-url>
git push -u origin main
```

### Step 2: Deploy on Vercel

1. Go to [vercel.com](https://vercel.com)
2. Import your Git repository
3. Framework Preset: **Next.js**
4. Click **Deploy**

### Step 3: Configure Your Deployment

No special environment variables needed for basic functionality.

Optional defaults (create `.env.local`):
```env
NEXT_PUBLIC_DEFAULT_TALLY_HOST=localhost
NEXT_PUBLIC_DEFAULT_TALLY_PORT=9000
```

## Usage After Deployment

### For Local Network Users

1. Open deployed Vercel URL
2. Enter Tally IP:
   - Use your computer's local IP (e.g., `192.168.1.100`)
   - **NOT** `localhost` (that refers to the user's own machine)
3. Enter Port: `9000`
4. Click "Test Connection"

### For Remote Users (with VPN)

1. Connect to company VPN
2. Open Vercel app
3. Enter Tally server's local IP within VPN
4. Enter Port: `9000`
5. Click "Test Connection"

## Troubleshooting

### CORS Error in Browser Console

```
Access to XMLHttpRequest at 'http://192.168.1.100:9000' from origin 'https://yourapp.vercel.app' 
has been blocked by CORS policy
```

**Solution:** Enable CORS in Tally (see Prerequisites #1)

### Network Error

**Possible Causes:**
1. Tally is not running
2. ODBC Server not enabled
3. Wrong IP address
4. Firewall blocking connection
5. Not on same network/VPN

**Solutions:**
1. Verify Tally is running
2. Check ODBC Server is enabled
3. Verify IP with `ipconfig` (Windows) or `ip addr` (Linux)
4. Add firewall rule for port 9000
5. Connect to VPN if accessing remotely

### Connection Timeout

**Causes:**
- Network latency
- Tally server slow to respond
- Firewall silently dropping packets

**Solutions:**
1. Check network connection
2. Verify Tally is responsive locally
3. Check firewall logs
4. Try from same network first

## Security Best Practices

### ✅ Do:
- Use VPN for remote access
- Implement authentication in your app
- Use IP whitelisting in firewall
- Monitor access logs
- Keep Tally and systems updated
- Use HTTPS (Vercel provides this automatically)

### ❌ Don't:
- Expose Tally directly to internet without security
- Use weak or no authentication
- Share Tally credentials in code
- Disable all security features for convenience
- Use HTTP for your web app (always use HTTPS)

## Architecture Overview

```
┌─────────────────┐
│   Vercel App    │
│  (Static HTML/  │
│   JS/CSS Only)  │
└────────┬────────┘
         │
    [Internet]
         │
┌────────▼────────┐
│  User Browser   │
│  (Runs JS Code) │
└────────┬────────┘
         │
   [VPN or Local]
   [Network]
         │
┌────────▼────────┐
│  Tally Server   │
│  (ODBC Enabled) │
│  (CORS Enabled) │
└─────────────────┘
```

## Files Modified

- **`app/page.tsx`**: Changed to direct Tally connection (removed API route call)
- **`app/tally/api/route.ts`**: Added documentation (not used on Vercel)
- **`TALLY_SETUP.md`**: Comprehensive Tally configuration guide
- **`DEPLOYMENT.md`**: This file

## Testing Locally Before Deploy

```bash
npm run dev
# Open http://localhost:3000
# Test connection with localhost:9000
```

## Getting Help

1. Check browser console for detailed errors
2. Review `TALLY_SETUP.md` for Tally configuration
3. Verify CORS is enabled
4. Test connection on local network first
5. Check Tally logs for connection attempts

## Summary

✅ **Solution:** Client-side direct connection  
✅ **Works on:** Vercel, any static hosting  
✅ **Requires:** CORS enabled in Tally  
✅ **Security:** VPN for remote access  
✅ **No more:** 504 Gateway Timeout errors  
