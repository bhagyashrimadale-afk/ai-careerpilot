FROM python:3.10-slim

WORKDIR /app

# Copy requirements and install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application source code
COPY . .

# Expose backend port
EXPOSE 5000

# Run gunicorn WSGI server for production
CMD ["gunicorn", "--bind", "0.0.0.0:5000", "run:app"]
