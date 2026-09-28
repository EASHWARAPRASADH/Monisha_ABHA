# ============================================================
# Stage 1: Build Java Spring Boot Application
# ============================================================
FROM maven:3.9.6-eclipse-temurin-21-alpine AS builder

WORKDIR /build
COPY pom.xml .
RUN mvn dependency:resolve -B

COPY src ./src
RUN mvn clean package -DskipTests

# ============================================================
# Stage 2: Runtime Image
# ============================================================
FROM eclipse-temurin:21-jre-alpine

WORKDIR /app
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

COPY --from=builder /build/target/*.jar app.jar
RUN chown -R appuser:appgroup /app

USER appuser

EXPOSE 8088

ENV SPRING_PROFILES_ACTIVE=prod \
    JAVA_OPTS="-Xms256m -Xmx512m -XX:+UseG1GC"

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
