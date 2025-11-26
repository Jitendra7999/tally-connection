# Tally Connection Setup Guide

## Architecture

This application uses **client-side direct connection** to Tally Prime, which works both locally and when deployed on Vercel.

### Why Client-Side Connection?

When deployed on Vercel, serverless functions run in the cloud and **cannot access your local Tally server** (localhost or private IPs). The client-side approach allows your browser to directly connect to Tally on your local network.

## Prerequisites

### 1. Enable ODBC Server in Tally Prime

1. Open Tally Prime
2. Go to: **Gateway of Tally** → Press **F11** (Features)
3. Navigate to: **Connectivity** section
4. Enable: **Enable ODBC Server**
5. Note the port number (default is usually **9000**)
6. Press **Ctrl + A** to accept

### 2. Enable CORS in Tally Prime

For browser-based applications to connect to Tally, you need to enable CORS support:

#### Method 1: Using tally.ini Configuration

1. Close Tally Prime
2. Open `tally.ini` file (usually located at `C:\Program Files\Tally.ERP9\tally.ini` or where Tally is installed)
3. Add the following lines under `[Gateway]` section:

```ini
[Gateway]
EnableCORS = Yes
AllowedOrigins = *
```

4. Save and restart Tally Prime

#### Method 2: Using Gateway Configuration (Tally Prime)

1. In Tally, go to: **Gateway of Tally** → **F12** (Configure)
2. Look for CORS/Web settings
3. Enable CORS support
4. Set allowed origins to `*` or your specific domain

### 3. Firewall Configuration

Ensure your firewall allows connections on the Tally ODBC port:

**Windows Firewall:**
```bash
netsh advfirewall firewall add rule name="Tally ODBC" dir=in action=allow protocol=TCP localport=9000
```

## Connection Settings

### Local Testing
- **Tally IP:** `localhost` or `127.0.0.1`
- **Tally Port:** `9000` (or your configured port)

### Network Access (Other Devices)
- **Tally IP:** Your computer's local IP (e.g., `192.168.1.100`)
- **Tally Port:** `9000`

To find your local IP:
- **Windows:** `ipconfig` in Command Prompt
- **Linux/Mac:** `ifconfig` or `ip addr`

## Deployment on Vercel

### Important Notes

1. **CORS Must Be Enabled:** The browser needs to make cross-origin requests to your Tally server
2. **VPN/Network Access:** If accessing Tally from outside your network, use:
   - VPN connection to your office network
   - Tunnel services (ngrok, CloudFlare Tunnel) - **Not recommended for production**
   - Public IP with proper security (firewall rules)

### Environment Variables (Optional)

Create `.env.local` for default values:

```env
NEXT_PUBLIC_DEFAULT_TALLY_HOST=localhost
NEXT_PUBLIC_DEFAULT_TALLY_PORT=9000
```

## Troubleshooting

### Error: "Network Error" or CORS Error

**Solution:** Enable CORS in Tally (see step 2 above)

### Error: "Connection Refused"

**Causes:**
- Tally Prime is not running
- ODBC Server is not enabled
- Wrong port number
- Firewall blocking the connection

**Solutions:**
1. Verify Tally Prime is running
2. Check ODBC Server is enabled (F11 → Connectivity)
3. Verify port number matches
4. Check firewall rules

### Error: "Cannot resolve host"

**Causes:**
- Incorrect IP address
- Network connectivity issues

**Solutions:**
1. Use `localhost` for local testing
2. Verify IP address is correct
3. Ping the IP to test connectivity

### Error: "Timeout"

**Causes:**
- Tally server is slow to respond
- Network latency
- Firewall blocking connection

**Solutions:**
1. Check Tally is responsive
2. Verify network connection
3. Check firewall settings
4. Increase timeout in code if needed

## Security Considerations

### Production Deployment

⚠️ **Important Security Notes:**

1. **Never expose Tally directly to the internet** without proper security
2. Use **VPN** for remote access
3. Implement **authentication/authorization** in your application
4. Use **IP whitelisting** in firewall rules
5. Consider using a **reverse proxy** with security features

### Recommended Architecture for Production

```
[Internet] → [Vercel App] → [User Browser] → [VPN] → [Company Network] → [Tally Server]
```

Or use a secure tunnel:

```
[Internet] → [Vercel App] → [User Browser] → [CloudFlare Tunnel/ngrok] → [Tally Server]
```

## Testing Connection

1. Enter your Tally IP and Port in the application
2. Enter the Company Name (must match exactly as in Tally)
3. Click "Test Connection"
4. If successful, you'll see a green success message
5. If failed, error message will guide you to the solution

## Alternative: API Route (Not for Vercel Production)

The `/app/tally/api/route.ts` file is included but **won't work on Vercel** for external Tally servers. It's useful for:

- Local development testing
- Deployment on VPS/dedicated servers with network access to Tally
- Internal company servers with direct Tally access

## Support

For issues:
1. Check Tally ODBC Server is enabled
2. Verify CORS is enabled
3. Check firewall settings
4. Review browser console for detailed errors
5. Check Tally logs for connection attempts
