// src/lib/expenses/index.ts
import { prisma } from "../db/prisma";
import { quickBooks } from "../quickbooks";
import type {
  Prisma,
  Expense,
  ExpenseStatus,
  ExpenseCategory,
  User,
  ExpenseReceipt,
  Project,
} from "@prisma/client";

interface FileUpload {
  file: Buffer;
  fileName: string;
}

interface CreateExpenseDto {
  userId: string;
  projectId?: string;
  description: string;
  amount: number;
  date: Date;
  category: ExpenseCategory;
  notes?: string;
  receipt?: FileUpload;
}

interface ExpenseWithRelations extends Expense {
  receipt?: ExpenseReceipt;
  user: User;
  project?: Project;
}

interface ExpenseAnalytics {
  totalAmount: number;
  byCategory: Record<ExpenseCategory, number>;
  byProject: Record<string, number>;
}

class ExpenseManager {
  async createExpense(data: CreateExpenseDto): Promise<ExpenseWithRelations> {
    return await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const expense = await tx.expense.create({
        data: {
          userId: data.userId,
          projectId: data.projectId,
          description: data.description,
          amount: data.amount,
          date: data.date,
          category: data.category,
          notes: data.notes,
          status: "DRAFT",
        },
        include: {
          user: true,
          project: true,
        },
      });

      // For now, we'll skip file upload functionality
      // You can add it back once Microsoft Graph is set up

      return expense;
    });
  }

  async submitExpense(expenseId: string): Promise<ExpenseWithRelations> {
    return await prisma.expense.update({
      where: { id: expenseId },
      data: { status: "SUBMITTED" },
      include: {
        user: true,
        receipt: true,
        project: true,
      },
    });
  }

  async approveExpense(
    expenseId: string,
    approverId: string
  ): Promise<ExpenseWithRelations> {
    return await prisma.expense.update({
      where: { id: expenseId },
      data: {
        status: "APPROVED",
        approvedById: approverId,
        approvedAt: new Date(),
      },
      include: {
        user: true,
        receipt: true,
        project: true,
      },
    });
  }

  async rejectExpense(
    expenseId: string,
    approverId: string,
    notes?: string
  ): Promise<ExpenseWithRelations> {
    return await prisma.expense.update({
      where: { id: expenseId },
      data: {
        status: "REJECTED",
        approvedById: approverId,
        approvedAt: new Date(),
        notes: notes,
      },
      include: {
        user: true,
        receipt: true,
        project: true,
      },
    });
  }

  async getExpenseAnalytics(
    startDate: Date,
    endDate: Date
  ): Promise<ExpenseAnalytics> {
    const expenses = await prisma.expense.findMany({
      where: {
        date: {
          gte: startDate,
          lte: endDate,
        },
        status: "APPROVED",
      },
      include: {
        project: true,
      },
    });

    return {
      totalAmount: expenses.reduce((sum: number, exp) => sum + exp.amount, 0),
      byCategory: expenses.reduce(
        (acc: Record<ExpenseCategory, number>, exp) => {
          acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
          return acc;
        },
        {} as Record<ExpenseCategory, number>
      ),
      byProject: expenses.reduce((acc: Record<string, number>, exp) => {
        const projectName = exp.project?.name || "No Project";
        acc[projectName] = (acc[projectName] || 0) + exp.amount;
        return acc;
      }, {}),
    };
  }

  async getUserExpenses(
    userId: string,
    status?: ExpenseStatus
  ): Promise<ExpenseWithRelations[]> {
    return await prisma.expense.findMany({
      where: {
        userId,
        status: status,
      },
      include: {
        user: true,
        receipt: true,
        project: true,
      },
      orderBy: {
        date: "desc",
      },
    });
  }

  async getPendingApprovals(): Promise<ExpenseWithRelations[]> {
    return await prisma.expense.findMany({
      where: {
        status: "SUBMITTED",
      },
      include: {
        user: true,
        receipt: true,
        project: true,
      },
      orderBy: {
        date: "desc",
      },
    });
  }
}

export const expenseManager = new ExpenseManager();
