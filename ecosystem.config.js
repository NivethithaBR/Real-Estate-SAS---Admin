module.exports = {
  apps: [
    {
      name: "Demo_Rams_partment_backend", // Name of the application
      script: "server.js", // Path to your compiled app.js file
      instances: "1", // Number of instances to run (1 for production)
      exec_mode: "cluster", // Run in cluster mode for better performance
      max_memory_restart: "300M", // Restart app if memory usage exceeds 300MB
      node_args: "--max_old_space_size=16000", // Set max old space size to 16GB
      // Logging (uncomment if needed)
      // log: "./log/combined.outerr0.log",
      // output: "./log/pm2/out.log",
      // error: "./log/pm2/error.log",
      // log_date_format: "YYYY-MM-DD HH:mm Z", // Timestamp for logs
      // log_type: "json",  // Log the data as JSON
      env_development: {
        NODE_ENV: "development", // Development environment
        PORT: 6081, // Port for development
        watch: true, // Watch files for changes in development
        watch_delay: 3000, // Delay for reloading
        ignore_watch: [
          "./node_modules",
          "./public",
          "./.DS_Store",
          "./package.json",
          "./yarn.lock",
          "./samples",
          ".git",
          "node_modules",
          "log",
          ".node-gyp",
          ".pm2",
          "xml_file/*",
        ],
      },
      env_production: {
        NODE_ENV: "production", // Production environment
        PORT: 6081, // Port for production
        exec_mode: "cluster", // Use cluster mode in production
      },
    },
  ],
  logrotate: {
    enabled: true,
    max_size: "10M", // Rotate log file when it exceeds 10MB
    retain: 5, // Keep only 5 log files
    filePath: "log/pm2", // Directory path for log files
    compress: true, // Compress rotated logs to save space
    workerInterval: 60, // Check for log rotation every 60 seconds
    rotateInterval: "0 0 * * *", // Rotate logs daily at midnight
    rotateModule: true, // Enable log rotation for all PM2 apps
    dateFormat: "YYYY-MM-DD_HH-mm-ss", // Date format for rotated log files
  },
};
