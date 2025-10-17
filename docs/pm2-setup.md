# PM2 Setup Guide for Master

This guide explains how to set up and run your Master application using PM2 (Process Manager 2).

## Prerequisites

- Node.js installed
- Master CLI installed globally (`npm install -g master`)
- PM2 installed globally (`npm install -g pm2`)

## Basic Usage

### Starting Your Master Server with PM2

To start your Master application with PM2, use the following command:

```bash
pm2 start master -- server
```

### Starting with a Custom Name

You can give your process a custom name for easier management:

```bash
pm2 start master --name "your-app-name" -- server
```

**Important:** The `--` syntax is crucial. Everything after `--` is passed as arguments to the `master` command. So `pm2 start master -- server` runs the equivalent of `master server` but managed by PM2.

## Managing Your Application

Once your application is running, you can use these PM2 commands:

### View Running Processes
```bash
pm2 list
```

### View Application Logs
```bash
pm2 logs your-app-name
```

### Stop Your Application
```bash
pm2 stop your-app-name
```

### Restart Your Application
```bash
pm2 restart your-app-name
```

### Delete Process from PM2
```bash
pm2 delete your-app-name
```

### Monitor Application
```bash
pm2 monit
```

## Auto-start on System Reboot

To make your application start automatically when the server reboots:

1. Generate the startup script:
```bash
pm2 startup
```

2. Follow the instructions provided by the command (you may need to run a command with sudo)

3. Save the current PM2 process list:
```bash
pm2 save
```

## Advanced Configuration (Optional)

You can create an `ecosystem.config.js` file in your project root for more advanced configuration:

```javascript
module.exports = {
  apps: [{
    name: 'your-app-name',
    script: 'master/server.js',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production'
    }
  }]
};
```

Then start with:
```bash
pm2 start ecosystem.config.js
```

## Troubleshooting

### Application Not Starting
- Verify `master` is installed globally: `which master`
- Check that you're in the correct directory with `server.js`
- View logs for errors: `pm2 logs your-app-name`

### Port Already in Use
- Check if another process is using the port: `pm2 list`
- Stop conflicting processes: `pm2 stop <process-name>`

## Example Workflow

Here's a typical workflow for deploying your Master application:

```bash
# Navigate to your project directory
cd /var/www/your-project

# Start the application with PM2
pm2 start master --name "my-app" -- server

# Verify it's running
pm2 list

# Check logs
pm2 logs my-app

# Set up auto-start
pm2 startup
pm2 save
```

## Additional Resources

- [PM2 Official Documentation](https://pm2.keymetrics.io/)
- [PM2 Quick Start Guide](https://pm2.keymetrics.io/docs/usage/quick-start/)
