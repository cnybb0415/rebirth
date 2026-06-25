# Build stage
FROM eclipse-temurin:11-jdk AS build
WORKDIR /app

COPY . .
RUN chmod +x mvnw && ./mvnw -DskipTests clean package

# Runtime stage
FROM eclipse-temurin:11-jre
WORKDIR /app

COPY --from=build /app/target/music-chart-api-0.1.jar ./app.jar

# Render sets PORT (default 10000). Spring reads it from application.yml.
EXPOSE 10000

CMD ["sh", "-c", "java -jar app.jar"]
