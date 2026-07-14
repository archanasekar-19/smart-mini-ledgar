import { Module } from '@nestjs/common';
import { DatabaseModule } from './db/database.module';
import { TransactionsModule } from './transactions/transactions.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [DatabaseModule, TransactionsModule, AuthModule],
})
export class AppModule {}
