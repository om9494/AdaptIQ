#!/bin/bash
set -euo pipefail

mkdir -p /opt/adaptiq/current /opt/adaptiq/shared /opt/adaptiq/data/uploads
chown -R ec2-user:ec2-user /opt/adaptiq
systemctl stop adaptiq-api.service || true
