export interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  date: Date;
  tags: string[];
  createdAt: Date;
}

export class CreateTransactionDto {
  description: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  date?: string; // ISO String
  tags?: string[];
}
