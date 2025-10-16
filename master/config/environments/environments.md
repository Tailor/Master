# Bookbag Environment Configuration Guide

This document explains all configuration fields in the environment files (`env.development.json`, `env.production.json`, etc.).

---

## Server Configuration

```json
"server": {
    "hostname": "0.0.0.0",
    "httpPort": 8080,
    "requestTimeout": 60000
}
```

### hostname
- **What it does**: Specifies which network interface(s) the server binds to
- **Common values**:
  - `"0.0.0.0"` - **RECOMMENDED** - Binds to all network interfaces (IPv4). This allows:
    - Access via `localhost` (127.0.0.1)
    - Access via your machine's local IP address (e.g., 192.168.1.100)
    - Access from other devices on your network (phones, tablets, other computers)
    - Required for Docker containers to accept external connections
  - `"localhost"` or `"127.0.0.1"` - Only accessible from the same machine (localhost only)
  - `"192.168.1.100"` - Binds only to a specific network interface

**Why we use `0.0.0.0`**:
- Provides maximum flexibility for development and production
- Allows testing from mobile devices and other computers on your network
- Required for server deployments where the exact IP may not be known in advance
- Works seamlessly with reverse proxies (Nginx, Apache) and load balancers

### httpPort
- **What it does**: The TCP port number the backend server listens on
- **Default**: `8080`
- **Usage**: Backend API is accessible at `http://[hostname]:[httpPort]`
- **Note**: Port numbers below 1024 require root/admin privileges

### requestTimeout
- **What it does**: Maximum time (in milliseconds) the server waits for a request to complete
- **Default**: `60000` (60 seconds)
- **Why 60 seconds**: LLM streaming responses can take time, especially with large contexts or slower models
- **Recommendation**: Increase for very large RAG document retrievals or slow models

---

## Error Pages

```json
"error": {
    "404": "/public/404.html",
    "500": "/public/500.html"
}
```

### 404
- **What it does**: Path to the HTML page shown when a route/resource is not found
- **Default**: `/public/404.html`
- **Customize**: Create your own branded 404 page

### 500
- **What it does**: Path to the HTML page shown for internal server errors
- **Default**: `/public/500.html`
- **Customize**: Create your own branded error page

---



---
## MySQL Configuration Example (Production)

For production deployments with MySQL, your context configuration looks like this:

```json
"demoContext": {
    "host": "127.0.0.1",
    "port": 3306,
    "user": "root",
    "password": "your_mysql_password",
    "database": "demo",
    "type": "mysql"
}
```


## Environment-Specific Files

- **env.development.json**: Local development with SQLite (zero config)
- **env.production.json**: Production deployment with MySQL (scalable)

---

## Security Best Practices

1. **Never commit secrets**: Use placeholder values in version control
2. **Rotate JWT secrets**: Periodically regenerate secrets for production
3. **Use strong passwords**: For MySQL, use 16+ character passwords
4. **Firewall rules**: In production, restrict MySQL to localhost or trusted IPs
5. **File permissions**: Ensure SQLite files and JWT secrets are not world-readable
6. **HTTPS in production**: Always use HTTPS (SSL/TLS) for production deployments
7. **Backup databases**: Regular backups of all context databases

---

## Troubleshooting

### Server won't start
- Check if port 8080 is already in use: `lsof -i :8080` (Unix) or `netstat -ano | findstr :8080` (Windows)
- Verify hostname is correct (use `0.0.0.0` for maximum compatibility)

### Can't access from other devices
- Ensure hostname is `0.0.0.0`, not `localhost`
- Check firewall rules allow incoming connections on port 8080
- Verify devices are on the same network

### Database connection errors
- For SQLite: Ensure file paths exist and are writable
- For MySQL: Verify credentials, ensure MySQL is running, and databases exist

---

## Additional Resources

- **CORS Configuration**: `config/initializers/cors.json` (auto-configured by deploy script)
