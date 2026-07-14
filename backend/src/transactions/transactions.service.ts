import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../db/database.service';
import { Transaction, CreateTransactionDto } from './transaction.entity';
import { randomUUID } from 'crypto';

@Injectable()
export class TransactionsService {
  private readonly logger = new Logger('TransactionsService');

  constructor(
    private readonly db: DatabaseService,
  ) {}

  async create(dto: CreateTransactionDto): Promise<Transaction> {
    const id = randomUUID();
    const date = dto.date ? new Date(dto.date) : new Date();
    const tags = dto.tags || [];
    
    // Insert query
    await this.db.query(
      `INSERT INTO transactions (id, description, amount, type, category, date, tags)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [id, dto.description, dto.amount, dto.type, dto.category, date, tags]
    );

    const transaction: Transaction = {
      id,
      description: dto.description,
      amount: dto.amount,
      type: dto.type,
      category: dto.category,
      date,
      tags,
      createdAt: new Date(),
    };

    const recipient = process.env.TWILIO_TEST_RECIPIENT_NUMBER || process.env.TWILIO_PHONE_NUMBER || '+15392861144';
    const msg = `$martLedger Alert: Added ${transaction.type} of $${transaction.amount.toFixed(2)} for "${transaction.description}" in Category: ${transaction.category}.`;
    this.sendNotification('sms', recipient, msg).catch(err => {
      this.logger.error(`Failed to send auto create SMS: ${err.message}`);
    });

    return transaction;
  }

  async findAll(filters: {
    type?: string;
    category?: string;
    search?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }) {
    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const offset = (page - 1) * limit;

    let baseQuery = 'FROM transactions WHERE 1=1';
    const params: any[] = [];

    if (filters.type) {
      params.push(filters.type);
      baseQuery += ` AND type = $${params.length}`;
    }

    if (filters.category) {
      params.push(filters.category);
      baseQuery += ` AND category = $${params.length}`;
    }

    if (filters.search) {
      params.push(`%${filters.search}%`);
      baseQuery += ` AND (description ILIKE $${params.length} OR category ILIKE $${params.length})`;
    }

    if (filters.startDate) {
      params.push(new Date(filters.startDate));
      baseQuery += ` AND date >= $${params.length}`;
    }

    if (filters.endDate) {
      params.push(new Date(filters.endDate));
      baseQuery += ` AND date <= $${params.length}`;
    }

    // Get Total Count
    const countRes = await this.db.query(`SELECT COUNT(*)::int as total ${baseQuery}`, params);
    const total = countRes.rows[0].total;

    // Get Paginated Rows
    const selectParams = [...params, limit, offset];
    const dataQuery = `SELECT * ${baseQuery} ORDER BY date DESC, created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    const dataRes = await this.db.query(dataQuery, selectParams);

    const transactions: Transaction[] = dataRes.rows.map(row => ({
      id: row.id,
      description: row.description,
      amount: parseFloat(row.amount),
      type: row.type,
      category: row.category,
      date: row.date,
      tags: row.tags,
      createdAt: row.created_at,
    }));

    return {
      transactions,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      }
    };
  }

  async remove(id: string): Promise<{ success: boolean }> {
    const checkRes = await this.db.query('SELECT * FROM transactions WHERE id = $1', [id]);
    if (checkRes.rowCount === 0) {
      throw new NotFoundException(`Transaction with ID '${id}' not found`);
    }
    const row = checkRes.rows[0];
    const type = row.type;
    const amount = parseFloat(row.amount);
    const desc = row.description;

    const res = await this.db.query('DELETE FROM transactions WHERE id = $1', [id]);
    if (res.rowCount === 0) {
      throw new NotFoundException(`Transaction with ID '${id}' not found`);
    }

    const recipient = process.env.TWILIO_TEST_RECIPIENT_NUMBER || process.env.TWILIO_PHONE_NUMBER || '+15392861144';
    const msg = `$martLedger Alert: Deleted ${type} of $${amount.toFixed(2)} for "${desc}".`;
    this.sendNotification('sms', recipient, msg).catch(err => {
      this.logger.error(`Failed to send auto delete SMS: ${err.message}`);
    });

    return { success: true };
  }

  async getSummary() {
    // 1. Total Income
    const incomeRes = await this.db.query(
      `SELECT COALESCE(SUM(amount), 0)::float as total FROM transactions WHERE type = 'income'`
    );
    const totalIncome = incomeRes.rows[0].total;

    // 2. Total Expenses
    const expenseRes = await this.db.query(
      `SELECT COALESCE(SUM(amount), 0)::float as total FROM transactions WHERE type = 'expense'`
    );
    const totalExpenses = expenseRes.rows[0].total;

    // 3. Balance
    const netBalance = totalIncome - totalExpenses;

    // 4. Category-wise Expense breakdown
    const categoryExpenseRes = await this.db.query(
      `SELECT category, SUM(amount)::float as amount 
       FROM transactions 
       WHERE type = 'expense' 
       GROUP BY category 
       ORDER BY amount DESC`
    );
    const expensesByCategory = categoryExpenseRes.rows;

    // 5. Category-wise Income breakdown
    const categoryIncomeRes = await this.db.query(
      `SELECT category, SUM(amount)::float as amount 
       FROM transactions 
       WHERE type = 'income' 
       GROUP BY category 
       ORDER BY amount DESC`
    );
    const incomeByCategory = categoryIncomeRes.rows;

    // 6. Daily Balance History (to build the cumulative chart)
    const dailyRes = await this.db.query(
      `SELECT date_trunc('day', date) as day, 
              SUM(CASE WHEN type = 'income' THEN amount ELSE -amount END)::float as net_change 
       FROM transactions 
       GROUP BY day 
       ORDER BY day ASC`
    );
    
    let runningBalance = 0;
    const balanceHistory = dailyRes.rows.map(row => {
      runningBalance += row.net_change;
      return {
        date: row.day.toISOString().split('T')[0],
        netChange: row.net_change,
        balance: runningBalance,
      };
    });

    return {
      totalIncome,
      totalExpenses,
      netBalance,
      expensesByCategory,
      incomeByCategory,
      balanceHistory,
    };
  }

  async getForecast() {
    const summary = await this.getSummary();
    const history = summary.balanceHistory;

    // If there are less than 2 data points, we can't establish a regression slope
    if (history.length < 2) {
      const currentBalance = summary.netBalance;
      const forecast: any[] = [];
      const today = new Date();
      for (let i = 1; i <= 7; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + i);
        forecast.push({
          date: date.toISOString().split('T')[0],
          predictedBalance: currentBalance,
          confidence: 'low',
        });
      }
      return {
        slope: 0,
        intercept: currentBalance,
        forecast,
      };
    }

    // Perform Linear Regression (y = mx + c)
    // x = day index (0, 1, 2, ..., N-1)
    // y = running balance on that day
    const n = history.length;
    let sumX = 0;
    let sumY = 0;
    let sumXY = 0;
    let sumX2 = 0;

    for (let i = 0; i < n; i++) {
      const x = i;
      const y = history[i].balance;
      sumX += x;
      sumY += y;
      sumXY += x * y;
      sumX2 += x * x;
    }

    const denominator = n * sumX2 - sumX * sumX;
    let slope = 0;
    let intercept = 0;

    if (denominator !== 0) {
      slope = (n * sumXY - sumX * sumY) / denominator;
      intercept = (sumY - slope * sumX) / n;
    } else {
      // Fallback
      slope = 0;
      intercept = history[n - 1].balance;
    }

    // Generate forecast for next 7 days starting from the last date in history
    const lastDateObj = new Date(history[n - 1].date);
    const forecast: any[] = [];

    for (let i = 1; i <= 7; i++) {
      const nextDate = new Date(lastDateObj);
      nextDate.setDate(lastDateObj.getDate() + i);
      
      // Calculate predicted balance
      // We extend the day index: x_predicted = (n - 1) + i
      const xPredicted = (n - 1) + i;
      const predictedBalance = Math.max(0, parseFloat((slope * xPredicted + intercept).toFixed(2)));

      forecast.push({
        date: nextDate.toISOString().split('T')[0],
        predictedBalance,
        confidence: n > 10 ? 'high' : 'medium', // higher confidence with more history
      });
    }

    return {
      slope,
      intercept,
      forecast,
    };
  }

  async sendNotification(medium: string, recipient: string, message: string) {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const twilioPhone = process.env.TWILIO_PHONE_NUMBER;

    if (medium === 'sms') {
      if (!accountSid || !authToken || !twilioPhone) {
        this.logger.error('Twilio credentials are not configured in .env file.');
        return { success: false, message: 'Twilio credentials are not configured in backend .env' };
      }

      try {
        const authString = Buffer.from(`${accountSid}:${authToken}`).toString('base64');
        const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;

        const bodyParams = new URLSearchParams();
        bodyParams.append('From', twilioPhone);
        bodyParams.append('To', recipient);
        bodyParams.append('Body', message);

        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Authorization': `Basic ${authString}`,
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          body: bodyParams.toString()
        });

        const data: any = await response.json();
        
        if (response.ok) {
          this.logger.log(`[TWILIO SMS] Message sent to ${recipient}. SID: ${data.sid}`);
          return { success: true, message: `SMS sent successfully via Twilio! SID: ${data.sid.substring(0, 8)}...` };
        } else {
          this.logger.error(`[TWILIO SMS] Failed to send: ${data.message} (Error Code: ${data.code})`);
          return { success: false, message: `Twilio Error: ${data.message}` };
        }
      } catch (err) {
        this.logger.error(`[TWILIO SMS] Network error connecting to Twilio: ${err.message}`);
        return { success: false, message: `Network error connecting to Twilio: ${err.message}` };
      }
    }

    // Fallback for other mock mediums
    this.logger.log(`[MOCK NOTIFICATION] Dispatched via ${medium.toUpperCase()} to ${recipient}: "${message}"`);
    return { success: true, message: `Notification dispatched successfully via ${medium}.` };
  }
}
