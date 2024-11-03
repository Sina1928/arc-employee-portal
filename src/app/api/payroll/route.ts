// src/app/api/payroll/route.ts
import { NextResponse } from "next/server";
import { prisma } from "../../../lib/db/prisma";
import { quickBooks } from "../../../lib/quickbooks";

// Define the type for TimeEntry
type TimeEntry = {
  type: "REGULAR" | "OVERTIME" | "VACATION" | "SICK_LEAVE";
  hours: number;
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, startDate, endDate } = body;

    // Get time entries for the period
    const timeEntries = await prisma.timeEntry.findMany({
      where: {
        userId,
        date: {
          gte: new Date(startDate),
          lte: new Date(endDate),
        },
      },
    });

    // Calculate hours and pay with proper typing
    const regularHours = timeEntries
      .filter((entry: TimeEntry) => entry.type === "REGULAR")
      .reduce((sum: number, entry: TimeEntry) => sum + entry.hours, 0);

    const overtimeHours = timeEntries
      .filter((entry: TimeEntry) => entry.type === "OVERTIME")
      .reduce((sum: number, entry: TimeEntry) => sum + entry.hours, 0);

    // Get user's QuickBooks employee ID
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { qbEmployeeId: true },
    });

    if (!user?.qbEmployeeId) {
      return NextResponse.json(
        { error: "User not linked with QuickBooks" },
        { status: 400 }
      );
    }

    // Create payroll record
    const payrollRecord = await prisma.payrollRecord.create({
      data: {
        userId,
        periodStart: new Date(startDate),
        periodEnd: new Date(endDate),
        regularHours,
        overtimeHours,
        grossPay: regularHours * 25 + overtimeHours * 37.5, // Example rates
        netPay: 0, // Will be calculated after QB processing
        status: "PENDING",
        qbEmployeeId: user.qbEmployeeId,
      },
    });

    // Send to QuickBooks
    const qbResponse = await quickBooks.createExpenseEntry({
      employeeRef: user.qbEmployeeId,
      amount: payrollRecord.grossPay,
      description: `Payroll ${startDate} to ${endDate}`,
      date: new Date(),
    });

    // Update payroll record with QB reference
    const updatedPayroll = await prisma.payrollRecord.update({
      where: { id: payrollRecord.id },
      data: {
        qbPaycheckId: qbResponse.Id,
        status: "PROCESSED",
      },
    });

    return NextResponse.json(updatedPayroll);
  } catch (error) {
    console.error("Payroll processing error:", error);
    return NextResponse.json(
      { error: "Failed to process payroll" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");

  if (!userId) {
    return NextResponse.json({ error: "User ID is required" }, { status: 400 });
  }

  try {
    const payrollRecords = await prisma.payrollRecord.findMany({
      where: { userId },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy: { periodEnd: "desc" },
    });

    return NextResponse.json(payrollRecords);
  } catch (error) {
    console.error("Error fetching payroll records:", error);
    return NextResponse.json(
      { error: "Failed to fetch payroll records" },
      { status: 500 }
    );
  }
}
