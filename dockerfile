FROM python:3.11-slim

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    gcc \
    g++ \
    libblas-dev \
    liblapack-dev \
    libopenblas-dev \
    python3-dev \
    libpq-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY . .

# Upgrade pip and install all dependencies with fixed versions
RUN pip install --upgrade pip
RUN pip install \
    Flask==3.0.3 \
    Flask-Cors==4.0.0 \
    gunicorn==22.0.0 \
    pandas==2.2.2 \
    scikit-learn==1.7.0 \
    requests==2.32.3 \
    numpy==2.2.6 \
    python-dotenv==1.0.0 \
    psycopg2-binary==2.9.9

EXPOSE 5000

CMD ["python", "app.py"]
