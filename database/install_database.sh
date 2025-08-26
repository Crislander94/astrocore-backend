#!/bin/bash

# =====================================================
# SCRIPT DE INSTALACIÓN DE BASE DE DATOS
# Ecommerce AstroCore - PostgreSQL Setup
# Fecha: 25/08/2025
# =====================================================

set -e  # Salir si hay algún error

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para imprimir mensajes
print_message() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "${BLUE}================================${NC}"
    echo -e "${BLUE} $1${NC}"
    echo -e "${BLUE}================================${NC}"
}

# Variables de configuración
DB_NAME="ecommerce_astrocore"
DB_USER="postgres"
DB_PASSWORD="fhnvEkaKuAA36e905WdL"
DB_HOST="localhost"
DB_PORT="5432"

# Verificar si PostgreSQL está instalado
check_postgresql() {
    print_header "VERIFICANDO POSTGRESQL"
    
    if ! command -v psql &> /dev/null; then
        print_error "PostgreSQL no está instalado"
        print_message "Por favor instala PostgreSQL primero:"
        echo "  Ubuntu/Debian: sudo apt install postgresql postgresql-contrib"
        echo "  CentOS/RHEL: sudo yum install postgresql postgresql-server"
        echo "  macOS: brew install postgresql"
        echo "  Windows: Descargar desde https://www.postgresql.org/download/"
        exit 1
    fi
    
    print_message "PostgreSQL encontrado: $(psql --version)"
}

# Verificar si el servicio está corriendo
check_postgresql_service() {
    print_header "VERIFICANDO SERVICIO POSTGRESQL"
    
    if ! pg_isready -h $DB_HOST -p $DB_PORT &> /dev/null; then
        print_warning "PostgreSQL no está corriendo"
        print_message "Intentando iniciar el servicio..."
        
        # Intentar iniciar el servicio según el sistema
        if command -v systemctl &> /dev/null; then
            sudo systemctl start postgresql
        elif command -v service &> /dev/null; then
            sudo service postgresql start
        elif command -v brew &> /dev/null; then
            brew services start postgresql
        else
            print_error "No se pudo iniciar PostgreSQL automáticamente"
            print_message "Por favor inicia PostgreSQL manualmente"
            exit 1
        fi
        
        # Verificar nuevamente
        sleep 2
        if ! pg_isready -h $DB_HOST -p $DB_PORT &> /dev/null; then
            print_error "PostgreSQL sigue sin responder"
            exit 1
        fi
    fi
    
    print_message "PostgreSQL está corriendo correctamente"
}

# Crear base de datos y usuario
create_database() {
    print_header "CREANDO BASE DE DATOS Y USUARIO"
    
    # Verificar si la base de datos ya existe
    if psql -h $DB_HOST -p $DB_PORT -U postgres -lqt | cut -d \| -f 1 | grep -qw $DB_NAME; then
        print_warning "La base de datos '$DB_NAME' ya existe"
        read -p "¿Deseas eliminarla y recrearla? (y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            print_message "Eliminando base de datos existente..."
            psql -h $DB_HOST -p $DB_PORT -U postgres -c "DROP DATABASE IF EXISTS $DB_NAME;"
            psql -h $DB_HOST -p $DB_PORT -U postgres -c "DROP USER IF EXISTS $DB_USER;"
        else
            print_message "Manteniendo base de datos existente"
            return 0
        fi
    fi
    
    print_message "Creando base de datos '$DB_NAME'..."
    psql -h $DB_HOST -p $DB_PORT -U postgres -c "CREATE DATABASE $DB_NAME;"
    
    
    print_message "Otorgando permisos..."
    psql -h $DB_HOST -p $DB_PORT -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;"
    psql -h $DB_HOST -p $DB_PORT -U postgres -c "ALTER USER $DB_USER CREATEDB;"
}

# Ejecutar script SQL
execute_sql_script() {
    print_header "EJECUTANDO SCRIPT DE CREACIÓN"
    
    local sql_file="create_database.sql"
    
    if [ ! -f "$sql_file" ]; then
        print_error "Archivo SQL no encontrado: $sql_file"
        print_message "Asegúrate de ejecutar este script desde el directorio database/"
        exit 1
    fi
    
    print_message "Ejecutando script SQL..."
    PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f $sql_file
    
    if [ $? -eq 0 ]; then
        print_message "Script SQL ejecutado exitosamente"
    else
        print_error "Error al ejecutar el script SQL"
        exit 1
    fi
}

# Verificar instalación
verify_installation() {
    print_header "VERIFICANDO INSTALACIÓN"
    
    print_message "Verificando tablas creadas..."
    local table_count=$(PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';")
    
    if [ "$table_count" -gt 0 ]; then
        print_message "✅ $table_count tablas creadas correctamente"
        
        print_message "Tablas en la base de datos:"
        PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "\dt"
        
        print_message "Verificando datos iniciales..."
        local user_count=$(PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -t -c "SELECT COUNT(*) FROM users;")
        local product_count=$(PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -t -c "SELECT COUNT(*) FROM products;")
        
        print_message "✅ $user_count usuarios creados"
        print_message "✅ $product_count productos creados"
    else
        print_error "No se encontraron tablas en la base de datos"
        exit 1
    fi
}

# Crear archivo .env
create_env_file() {
    print_header "CREANDO ARCHIVO .ENV"
    
    local env_file="../.env"
    
    if [ -f "$env_file" ]; then
        print_warning "El archivo .env ya existe"
        read -p "¿Deseas sobrescribirlo? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            print_message "Manteniendo archivo .env existente"
            return 0
        fi
    fi
    
    print_message "Creando archivo .env..."
    cat > $env_file << EOF
# Database
DATABASE_URL="postgresql://$DB_USER:$DB_PASSWORD@$DB_HOST:$DB_PORT/$DB_NAME"

# JWT
JWT_SECRET="$(openssl rand -base64 32)"
JWT_EXPIRES_IN="7d"
JWT_REFRESH_SECRET="$(openssl rand -base64 32)"
JWT_REFRESH_EXPIRES_IN="30d"

# Server
PORT=3000
NODE_ENV="development"

# CORS
FRONTEND_URL="http://localhost:5173"
ALLOWED_ORIGINS="http://localhost:5173,http://localhost:3000"

# Email Configuration (configurar según tu proveedor)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
FROM_EMAIL="noreply@astrocore.com"
FROM_NAME="AstroCore"

# Payment Gateway - Datafast
DATAFAST_MID="your-merchant-id"
DATAFAST_ACQUIRER_ID="your-acquirer-id"
DATAFAST_SECRET_KEY="your-secret-key"
DATAFAST_ENVIRONMENT="sandbox"
DATAFAST_API_URL="https://ccapi-stg.datafast.com.ec"
DATAFAST_CALLBACK_URL="http://localhost:3000/api/payments/callback"
DATAFAST_SUCCESS_URL="http://localhost:5173/payment/success"
DATAFAST_FAILURE_URL="http://localhost:5173/payment/failure"

# File Upload
MAX_FILE_SIZE="5MB"
UPLOAD_PATH="./uploads"
ALLOWED_FILE_TYPES="image/jpeg,image/png,image/webp"

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Security
BCRYPT_ROUNDS=12
SESSION_SECRET="$(openssl rand -base64 32)"

# Logging
LOG_LEVEL="info"
LOG_FILE="logs/app.log"

# Cache (Redis - opcional)
# REDIS_URL="redis://localhost:6379"
CACHE_TTL=3600
EOF
    
    print_message "✅ Archivo .env creado exitosamente"
    print_warning "⚠️  Recuerda configurar las variables de email y Datafast"
}

# Mostrar información final
show_final_info() {
    print_header "INSTALACIÓN COMPLETADA"
    
    echo -e "${GREEN}✅ Base de datos instalada exitosamente${NC}"
    echo ""
    echo -e "${BLUE}Información de conexión:${NC}"
    echo "  Host: $DB_HOST"
    echo "  Puerto: $DB_PORT"
    echo "  Base de datos: $DB_NAME"
    echo "  Usuario: $DB_USER"
    echo "  Contraseña: $DB_PASSWORD"
    echo ""
    echo -e "${BLUE}Próximos pasos:${NC}"
    echo "  1. Configurar variables de email en .env"
    echo "  2. Configurar credenciales de Datafast en .env"
    echo "  3. Ejecutar: cd .. && npm install"
    echo "  4. Ejecutar: npm run dev"
    echo "  5. Visitar: http://localhost:3000/api/docs"
    echo ""
    echo -e "${YELLOW}Comandos útiles:${NC}"
    echo "  Conectar a la DB: psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME"
    echo "  Ver tablas: \\dt"
    echo "  Ver usuarios: SELECT * FROM users;"
    echo "  Ver productos: SELECT * FROM products;"
}

# Función principal
main() {
    print_header "INSTALACIÓN BASE DE DATOS ASTROCORE"
    
    check_postgresql
    check_postgresql_service
    create_database
    execute_sql_script
    verify_installation
    create_env_file
    show_final_info
    
    print_message "🎉 ¡Instalación completada exitosamente!"
}

# Verificar si se está ejecutando como script principal
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi
