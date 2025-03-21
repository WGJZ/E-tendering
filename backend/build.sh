#!/usr/bin/env bash
# exit on error
set -o errexit

pip install -r requirements.txt

python manage.py collectstatic --no-input

# Try a clean database approach for Render
# Create a new PostgreSQL database is better than migrating an existing one
echo "Attempting to migrate with fake initial..."
python manage.py migrate --fake-initial || python manage.py migrate 