import sys
import os

# Add backend to module path and start the backend REST API server
backend_dir = os.path.join(os.path.dirname(__file__), 'backend')
sys.path.insert(0, backend_dir)

from http.server import HTTPServer
from app_server import CuraMatchBackendHandler

if __name__ == '__main__':
    port = 8000
    print("=============================================================")
    print(" [CURAMATCH PRO] FULL STACK BACKEND & FRONTEND SERVER")
    print("=============================================================")
    print(f" Backend REST API: http://localhost:{port}/api/health")
    print(f" Frontend Web UI:  http://localhost:{port}/")
    print("=============================================================")
    
    server = HTTPServer(('0.0.0.0', port), CuraMatchBackendHandler)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nStopping server...")
