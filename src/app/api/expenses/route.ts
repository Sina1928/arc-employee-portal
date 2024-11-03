// src/lib/expenses/index.ts
import { prisma } from "../db/prisma";
import { quickBooks } from "../quickbooks";
import { microsoftGraph } from "../microsoft";
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

      if (data.receipt) {
        const folderPath = `expenses/${expense.id}`;
        const fileUrl = await microsoftGraph.uploadFile(
          process.env.SHAREPOINT_SITE_ID!,
          folderPath,
          data.receipt.fileName,
          data.receipt.file
        );

        await tx.expenseReceipt.create({
          data: {
            expenseId: expense.id,
            fileName: data.receipt.fileName,
            fileUrl: fileUrl,
          },
        });
      }

      return expense;
    });
  }

  async approveExpense(
    expenseId: string,
    approverId: string
  ): Promise<ExpenseWithRelations> {
    return await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const expense = await tx.expense.findUnique({
        where: { id: expenseId },
        include: { user: true, receipt: true, project: true },
      });

      if (!expense) throw new Error("Expense not found");
      if (expense.status !== "SUBMITTED") {
        throw new Error("Expense is not in submitted status");
      }

      // Create expense in QuickBooks
      const qbExpense = await quickBooks.createExpenseEntry({
        employeeRef: expense.user.qbEmployeeId!,
        amount: expense.amount,
        description: expense.description,
        date: expense.date,
        receiptUrl: expense.receipt?.fileUrl,
      });

      return await tx.expense.update({
        where: { id: expenseId },
        data: {
          status: "APPROVED",
          approvedById: approverId,
          approvedAt: new Date(),
          qbExpenseId: qbExpense.Id,
        },
        include: {
          user: true,
          receipt: true,
          project: true,
        },
      });
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

  // ... rest of your methods with proper typing
}

export const expenseManager = new ExpenseManager();
