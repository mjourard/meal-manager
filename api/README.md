# Meal Manager API

This is an API written using Java's Spring Boot to power the Meal Manager web app. 
It's never been launched to prod, but here's how I got it working in dev future Matt.

### Development

You'll need the correct java version. 
This is managed locally using sdkman. 

The commands for setting the java version are as follows:
```
sdk list java
sdk use java 11.0.19-amzn
sdk default java java 11.0.19-amzn
java -version
```

Once you've got that set, you'll need to set the environment variables of the .env file in the directory above:
`pushd ../env-files && set -a && source local.api.env && set +a && popd`

Finally, start the API with
`./mvnw spring-boot:run` 