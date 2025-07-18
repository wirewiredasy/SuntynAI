# Render Deployment Setup Guide for Suntyn AI

## Professional Production Setup

### 1. Environment Variables for Render

Set these environment variables in your Render dashboard:

```bash
# Session Security
SESSION_SECRET=your-ultra-secure-session-key-256-chars-minimum

# Database Configuration (Choose one)
DB_SOURCE=supabase

# Supabase Database (if using Supabase)
DATABASE_SUPABASE_URL=postgresql://postgres:Suntyn@#$134_@db.zypudpxacebcurnttfdi.supabase.co:5432/postgres

# Neon Database (if using Neon)
DATABASE_NEON_URL=postgresql://neondb_owner:npg_K0Li8FIagUEl@ep-silent-bar-a1jm7mrj-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require

# Flask Configuration
FLASK_ENV=production
PYTHONPATH=/opt/render/project/src
```

### 2. Build Command for Render

```bash
pip install -r requirements.txt
```

### 3. Start Command for Render

```bash
gunicorn --bind 0.0.0.0:$PORT --workers 4 --timeout 120 --preload main:app
```

### 4. Health Check Endpoint

Your app includes a health check endpoint at `/health` that monitors:
- Database connection status
- Application health
- Table creation status

### 5. Database Features

✅ **Professional Connection Pooling**
- Pool size: 10 connections
- Max overflow: 20 connections
- Connection recycling: 3600 seconds
- SSL required for production

✅ **Automatic Failover**
- Render DATABASE_URL (priority 1)
- Supabase connection (priority 2)
- Neon connection (priority 3)

✅ **Error Handling**
- Database connection testing
- Automatic retry logic
- Comprehensive logging
- Graceful degradation

### 6. Security Features

✅ **Production Ready**
- SSL/TLS enforcement
- Secure session management
- File upload validation
- SQL injection prevention
- XSS protection

### 7. Performance Optimizations

✅ **Caching & Speed**
- Connection pooling
- Static file optimization
- Gzip compression
- CDN-ready assets

### 8. Monitoring & Logging

✅ **Production Monitoring**
- Application logs
- Database health checks
- Error tracking
- Performance metrics

## Database Connection Test

Run this command to test your database connection:

```bash
python -c "from database_config import get_database_url; print('Database URL configured:', get_database_url()[:50] + '...')"
```

## Deploy to Render

1. **Connect Repository**: Link your GitHub repository to Render
2. **Set Environment Variables**: Add all the variables listed above
3. **Deploy**: Render will automatically build and deploy your app

## Post-Deployment Verification

After deployment, verify these endpoints:

- `https://your-app.onrender.com/` - Main application
- `https://your-app.onrender.com/health` - Health check
- `https://your-app.onrender.com/tool/qr-code-generator` - Sample tool

## Troubleshooting

### Database Connection Issues

1. Check environment variables in Render dashboard
2. Verify database URL format
3. Ensure database allows connections from Render IPs
4. Check logs for specific error messages

### Common Issues

- **SSL Certificate**: Ensure your database requires SSL
- **Connection Limits**: Monitor concurrent connections
- **Memory Usage**: Optimize for Render's memory limits
- **Startup Time**: Cold starts may take 10-15 seconds

## Support

For issues:
1. Check application logs in Render dashboard
2. Use the `/health` endpoint for diagnostics
3. Monitor database connection pool status
4. Review error logs for specific failures

Your application is now production-ready with lifetime database connectivity!