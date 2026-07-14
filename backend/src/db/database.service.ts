import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { Pool, Client } from 'pg';

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  private pool: Pool;
  private readonly logger = new Logger('DatabaseService');

  async onModuleInit() {
    await this.initializeDatabase();
  }

  private async initializeDatabase() {
    const host = process.env.DB_HOST || 'localhost';
    const port = parseInt(process.env.DB_PORT || '5432', 10);
    const user = process.env.DB_USER || 'postgres';
    const password = process.env.DB_PASSWORD || 'postgres';
    const databaseName = process.env.DB_DATABASE || 'smart_ledger';

    let dbExists = false;
    try {
      const client = new Client({ host, port, user, password, database: databaseName });
      await client.connect();
      await client.end();
      dbExists = true;
      this.logger.log(`Successfully connected to database: ${databaseName}`);
    } catch (error) {
      if (error.code === '3D000') {
        this.logger.warn(`Database '${databaseName}' does not exist. Attempting to create it...`);
      } else {
        this.logger.error(`Failed to connect to database server. Please check configuration.`);
        throw error;
      }
    }

    if (!dbExists) {
      try {
        const client = new Client({ host, port, user, password, database: 'postgres' });
        await client.connect();
        await client.query(`CREATE DATABASE "${databaseName}"`);
        await client.end();
        this.logger.log(`Created database: ${databaseName}`);
      } catch (err) {
        this.logger.error(`Failed to create database '${databaseName}': ${err.message}`);
        throw err;
      }
    }

    this.pool = new Pool({
      host,
      port,
      user,
      password,
      database: databaseName,
      max: 10,
    });

    await this.initializeSchema();
  }

  private async initializeSchema() {
    const createTransactionsTable = `
      CREATE TABLE IF NOT EXISTS transactions (
        id VARCHAR(36) PRIMARY KEY,
        description VARCHAR(255) NOT NULL,
        amount NUMERIC(12, 2) NOT NULL,
        type VARCHAR(10) NOT NULL CHECK (type IN ('income', 'expense')),
        category VARCHAR(50) NOT NULL,
        date TIMESTAMP WITH TIME ZONE NOT NULL,
        tags TEXT[] DEFAULT '{}',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;

    try {
      await this.query(createTransactionsTable);
      this.logger.log('Database transactions table checked/initialized successfully.');
    } catch (error) {
      this.logger.error('Failed to initialize database schema:', error.message);
      throw error;
    }
  }

  async query(text: string, params?: any[]) {
    return await this.pool.query(text, params);
  }

  async onModuleDestroy() {
    if (this.pool) {
      await this.pool.end();
      this.logger.log('Database pool closed.');
    }
  }
}
