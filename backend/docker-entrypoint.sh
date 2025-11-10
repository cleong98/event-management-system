#!/bin/sh
set -e

# Fix uploads directory permissions
mkdir -p /app/uploads
chown -R node:node /app/uploads
chmod -R 775 /app/uploads

# Switch to node user and run the command
exec su-exec node "$@"
