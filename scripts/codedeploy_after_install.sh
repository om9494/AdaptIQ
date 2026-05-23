#!/bin/bash
set -euo pipefail

cd /opt/adaptiq/current/backend

python3 -m venv venv
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt

cat > /etc/systemd/system/adaptiq-api.service <<'EOF'
[Unit]
Description=AdaptIQ Flask API
After=network.target

[Service]
Type=simple
User=ec2-user
Group=ec2-user
WorkingDirectory=/opt/adaptiq/current/backend
EnvironmentFile=/opt/adaptiq/shared/runtime.env
ExecStart=/opt/adaptiq/current/backend/venv/bin/gunicorn --workers 3 --bind 0.0.0.0:5000 wsgi:app
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
chown -R ec2-user:ec2-user /opt/adaptiq/current
