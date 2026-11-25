# Multi-stage Dockerfile for Spring Boot Backend
FROM gradle:8.14-jdk21-alpine AS build
WORKDIR /app
COPY build.gradle settings.gradle /app/
COPY src /app/src
RUN gradle build --no-daemon -x test

FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
VOLUME /tmp
COPY --from=build /app/build/libs/exam-timetable-system-1.0.0.jar app.jar
ENV SPRING_PROFILES_ACTIVE=mysql
ENV DB_HOST=mysql-db
ENV DB_PORT=3306
ENV DB_NAME=exam_timetable_db
ENV DB_USER=root
ENV DB_PASSWORD=rootpassword
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]

