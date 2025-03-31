# Main application for the Spring Boot API
resource "fly_app" "api" {
  name = var.fly_app_name
  org  = var.fly_org
}

# PostgreSQL database
resource "fly_app" "postgres" {
  name = var.fly_db_name
  org  = var.fly_org
}

# RabbitMQ instance
resource "fly_app" "rabbitmq" {
  name = var.fly_rabbitmq_name
  org  = var.fly_org
}

# Volume for PostgreSQL data
resource "fly_volume" "postgres_data" {
  name   = "postgres_data"
  app    = fly_app.postgres.name
  size   = 10 # 10GB
  region = var.fly_region
}

# Volume for RabbitMQ data
resource "fly_volume" "rabbitmq_data" {
  name   = "rabbitmq_data"
  app    = fly_app.rabbitmq.name
  size   = 1 # 1GB
  region = var.fly_region
}

# PostgreSQL Machine
resource "fly_machine" "postgres" {
  app    = fly_app.postgres.name
  region = var.fly_region
  name   = "${var.fly_db_name}-vm"
  
  image  = "postgres:14-alpine"
  cpus   = 1
  memorymb = 512
  
  mounts = [{
    path   = "/var/lib/postgresql/data"
    volume = fly_volume.postgres_data.id
  }]

  services = [{
    internal_port = 5432
    protocol      = "tcp"
    ports         = [
      {
        port     = 5432
        handlers = ["pg_tls"]
      }
    ]
  }]

  env = {
    POSTGRES_PASSWORD = var.postgres_password
    POSTGRES_USER     = "mealmanager"
    POSTGRES_DB       = "mealmanager"
  }

  depends_on = [fly_volume.postgres_data]
}

# RabbitMQ Machine
resource "fly_machine" "rabbitmq" {
  app    = fly_app.rabbitmq.name
  region = var.fly_region
  name   = "${var.fly_rabbitmq_name}-vm"
  
  image  = "rabbitmq:3-management-alpine"
  cpus   = 1
  memorymb = 512
  
  mounts = [{
    path   = "/var/lib/rabbitmq"
    volume = fly_volume.rabbitmq_data.id
  }]

  services = [
    {
      internal_port = 5672
      protocol      = "tcp"
      ports         = [
        {
          port     = 5672
          handlers = ["tcp"]
        }
      ]
    },
    {
      internal_port = 15672
      protocol      = "tcp"
      ports         = [
        {
          port     = 15672
          handlers = ["http"]
        }
      ]
    }
  ]

  env = {
    RABBITMQ_DEFAULT_USER = "mealmanager"
    RABBITMQ_DEFAULT_PASS = var.postgres_password # Reusing the same password for simplicity
  }

  depends_on = [fly_volume.rabbitmq_data]
}

# API Machine
resource "fly_machine" "api" {
  app    = fly_app.api.name
  region = var.fly_region
  name   = "${var.fly_app_name}-vm"
  
  image  = var.fly_api_image
  cpus   = 1
  memorymb = 1024
  
  services = [{
    internal_port = 8080
    protocol      = "tcp"
    ports         = [
      {
        port     = 80
        handlers = ["http"]
      },
      {
        port     = 443
        handlers = ["tls", "http"]
      }
    ]
  }]

  env = {
    SPRING_PROFILES_ACTIVE = "prod"
    
    # Database connection
    SPRING_DATASOURCE_URL = "jdbc:postgresql://${fly_app.postgres.name}.internal:5432/mealmanager"
    SPRING_DATASOURCE_USERNAME = "mealmanager"
    SPRING_DATASOURCE_PASSWORD = var.postgres_password
    
    # RabbitMQ connection
    SPRING_RABBITMQ_HOST = "${fly_app.rabbitmq.name}.internal"
    SPRING_RABBITMQ_PORT = "5672"
    SPRING_RABBITMQ_USERNAME = "mealmanager"
    SPRING_RABBITMQ_PASSWORD = var.postgres_password
    
    # API URL for client
    API_BASE_URL = "https://${var.fly_app_name}.fly.dev"
  }

  # Ensure database and message broker are created first
  depends_on = [fly_machine.postgres, fly_machine.rabbitmq]
} 