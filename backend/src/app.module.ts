import { Module } from '@nestjs/common';
import { DatabaseModule } from './db/database.module';
import { TransactionsModule } from './transactions/transactions.module';

@Module({
  imports: [DatabaseModule, TransactionsModule],
})
export class AppModule {}
