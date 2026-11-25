# Multi-stage Dockerfile for Cloud Deployment (Render, Railway, Fly.io, etc.)
# Stage 1: Build React Frontend
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# Stage 2: Build Spring Boot Backend with embedded static frontend
FROM gradle:8.14-jdk21-alpine AS backend-builder
WORKDIR /app/backend
COPY backend/build.gradle backend/settings.gradle ./
COPY backend/src ./src
# Copy production frontend build into Spring Boot static resources
COPY --from=frontend-builder /app/frontend/dist ./src/main/resources/static
RUN gradle build --no-daemon -x test

# Stage 3: Lightweight JRE Runtime
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=backend-builder /app/backend/build/libs/exam-timetable-system-1.0.0.jar app.jar

# Cloud providers (e.g., Render, Railway) dynamically inject $PORT
ENV PORT=8080
ENV SPRING_PROFILES_ACTIVE=local
EXPOSE 8080

ENTRYPOINT ["java", "-Djava.security.egd=file:/dev/./urandom", "-jar", "app.jar"]
