import multiprocessing

bind = "0.0.0.0:5000"
workers = multiprocessing.cpu_count() * 2 + 1
worker_class = "sync"
worker_connections = 1000
timeout = 120
keepalive = 5

max_requests = 1000
max_requests_jitter = 50

accesslog = "/tmp/gunicorn_access.log"
errorlog = "/tmp/gunicorn_error.log"
loglevel = "info"

daemon = False
pidfile = "/tmp/gunicorn.pid"

preload_app = True
reload = False
