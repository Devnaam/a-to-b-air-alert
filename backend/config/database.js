const knex = require('knex');
const logger = require('../utils/logger');

// Knex configuration
const knexConfig = {
  client: 'postgresql',
  connection: process.env.DATABASE_URL || {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 5432,
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_NAME || 'airalert_pro'
  },
  pool: {
    min: 2,
    max: 10,
    createTimeoutMillis: 3000,
    acquireTimeoutMillis: 30000,
    idleTimeoutMillis: 30000,
    reapIntervalMillis: 1000,
    createRetryIntervalMillis: 100,
    propagateCreateError: false
  },
  migrations: {
    tableName: 'knex_migrations',
    directory: './migrations'
  },
  seeds: {
    directory: './seeds'
  }
};

// Initialize database connection
const db = knex(knexConfig);

// Test database connection
const testConnection = async () => {
  try {
    await db.raw('SELECT 1+1 as result');
    logger.info('✅ Database connection established successfully');
  } catch (error) {
    logger.error('❌ Database connection failed:', error.message);
    if (process.env.NODE_ENV === 'development') {
      logger.info('💡 Make sure PostgreSQL is running and database exists');
    }
    // Don't exit in development to allow manual database setup
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
  }
};

// Initialize database
const initializeDatabase = async () => {
  try {
    // Test connection
    await testConnection();
    
    // Run pending migrations in production
    if (process.env.NODE_ENV === 'production') {
      await db.migrate.latest();
      logger.info('✅ Database migrations completed');
    }
  } catch (error) {
    logger.error('❌ Database initialization failed:', error);
  }
};

// Initialize when module is loaded
initializeDatabase();

// Graceful shutdown
process.on('SIGINT', async () => {
  logger.info('Closing database connection...');
  await db.destroy();
  logger.info('Database connection closed.');
});

module.exports = db;
