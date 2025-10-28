#!/bin/bash

echo "Starting production server with Gunicorn..."

cd /tmp/cc-agent/57621412/project/backend

export FLASK_ENV=production

pkill -f gunicorn

redis-cli ping > /dev/null 2>&1
if [ $? -ne 0 ]; then
    echo "Starting Redis..."
    redis-server --daemonize yes --port 6379
    sleep 2
fi

echo "Starting Gunicorn with $(python3 -c 'import multiprocessing; print(multiprocessing.cpu_count() * 2 + 1)') workers..."
gunicorn -c gunicorn_config.py app:app

echo "Production server started!"
echo "Access logs: /tmp/gunicorn_access.log"
echo "Error logs: /tmp/gunicorn_error.log"
