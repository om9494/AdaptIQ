#!/bin/bash
set -euo pipefail

systemctl enable adaptiq-api.service
systemctl restart adaptiq-api.service
