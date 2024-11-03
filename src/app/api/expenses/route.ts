import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import type { ExpenseStatus, ExpenseCategory, Prisma } from "@prisma/client";

export interface ExpenseWithRelations
  extends Prisma.ExpenseGetPayload<{
    include: {
      user: true;
      project: true;
      receipt: true;
    };
  }> {}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, projectId, description, amount, category, notes } = body;

    const expense = await prisma.expense.create({
      data: {
        userId,
        projectId: projectId ?? null, // Use null coalescing
        description,
        amount,
        date: new Date(),
        category: category as ExpenseCategory,
        notes: notes ?? null,
        status: "DRAFT",
      },
      include: {
        user: true,
        project: true,
        receipt: true,
      },
    });

    return NextResponse.json(expense);
  } catch (error) {
    console.error("Create expense error:", error);
    return NextResponse.json(
      { error: "Failed to create expense" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const status = searchParams.get("status") as ExpenseStatus | null;

    const where: Prisma.ExpenseWhereInput = {};

    if (userId) {
      where.userId = userId;
    }

    if (status) {
      where.status = status;
    }

    const expenses = await prisma.expense.findMany({
      where,
      include: {
        user: true,
        project: true,
        receipt: true,
      },
    });

    return NextResponse.json(expenses);
  } catch (error) {
    console.error("Get expenses error:", error);
    return NextResponse.json(
      { error: "Failed to fetch expenses" },
      { status: 500 }
    );
  }
}
