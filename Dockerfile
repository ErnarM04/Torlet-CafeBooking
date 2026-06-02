FROM python:3.13-slim AS backend

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

COPY backend/requirements/base.txt /app/requirements/base.txt
RUN pip install --no-cache-dir -r /app/requirements/base.txt

COPY backend /app

EXPOSE 8000


FROM node:22-alpine AS frontend

WORKDIR /app

COPY cafe_booking_frontend/package*.json /app/
RUN npm ci

COPY cafe_booking_frontend /app

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "5173"]


FROM node:22-alpine AS frontend-build

WORKDIR /app

ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

COPY cafe_booking_frontend/package*.json /app/
RUN npm ci

COPY cafe_booking_frontend /app
RUN npm run build


FROM nginx:1.27-alpine AS frontend-fly

COPY --from=frontend-build /app/dist /usr/share/nginx/html

EXPOSE 8080

CMD ["sh", "-c", "sed -i 's/listen       80;/listen       8080;/g' /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'"]
