#!/bin/sh

echo "Waiting for database to be ready..."
until node -e "const { Sequelize } = require('sequelize'); const s = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, { host: process.env.DB_HOST, port: process.env.DB_PORT, dialect: 'mysql', logging: false }); s.authenticate().then(() => process.exit(0)).catch(() => process.exit(1))"; do
  echo "Database not ready yet, sleeping 3 seconds..."
  sleep 3
done

echo "Database is ready! Running migrations..."
npm run db:migrate

# Seed database if requested
if [ "$RUN_SEEDS" = "true" ]; then
  echo "Running database seeders..."
  npm run db:seed
fi

echo "Starting backend server..."
npm run start
