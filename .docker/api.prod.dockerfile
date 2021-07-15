# Expected build context directory is the root directory of this repo
FROM amazoncorretto:11
WORKDIR /api
COPY ./api ./
RUN mkdir -p ../env-files
COPY ./env-files ../env-files
RUN ./mvnw clean install package
RUN cp target/api.jar api.jar
RUN rm -rf ../env-files
EXPOSE 8080
CMD [ "java", "-jar", "./api.jar" ]