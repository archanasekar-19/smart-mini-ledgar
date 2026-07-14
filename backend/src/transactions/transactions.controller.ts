import { Controller, Get, Post, Delete, Param, Query, Body, UseGuards } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { CreateTransactionDto } from './transaction.entity';
import { AuthGuard } from '../auth/auth.guard';

@Controller('transactions')
@UseGuards(AuthGuard)
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post()
  async create(@Body() dto: CreateTransactionDto) {
    return await this.transactionsService.create(dto);
  }

  @Get()
  async findAll(
    @Query('type') type?: string,
    @Query('category') category?: string,
    @Query('search') search?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return await this.transactionsService.findAll({
      type,
      category,
      search,
      startDate,
      endDate,
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
    });
  }

  @Get('summary')
  async getSummary() {
    return await this.transactionsService.getSummary();
  }

  @Get('forecast')
  async getForecast() {
    return await this.transactionsService.getForecast();
  }

  @Post('send-notification')
  async sendNotification(@Body() body: { medium: string; recipient: string; message: string }) {
    return await this.transactionsService.sendNotification(body.medium, body.recipient, body.message);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return await this.transactionsService.remove(id);
  }
}
