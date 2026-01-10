FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Cài system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements
COPY requirements.txt .

# Cài Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy source code
COPY app ./app

# Expose port
EXPOSE 8000

# Run FastAPI app
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
