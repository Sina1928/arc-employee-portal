import {
  PrismaClient,
  Role,
  ProjectStatus,
  ExpenseCategory,
} from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Clean existing data
  await prisma.$transaction([
    prisma.session.deleteMany(),
    prisma.account.deleteMany(),
    prisma.verificationToken.deleteMany(),
    prisma.expenseReceipt.deleteMany(),
    prisma.expense.deleteMany(),
    prisma.payrollRecord.deleteMany(),
    prisma.timeEntry.deleteMany(),
    prisma.document.deleteMany(),
    prisma.projectMember.deleteMany(),
    prisma.project.deleteMany(),
    prisma.overtimeBank.deleteMany(),
    prisma.user.deleteMany(),
    prisma.microsoftIntegration.deleteMany(),
  ]);

  // Create Microsoft integration
  const msIntegration = await prisma.microsoftIntegration.create({
    data: {
      tenantId: "demo-tenant-id",
      settings: {
        teamsEnabled: true,
        sharepointEnabled: true,
        defaultTeamId: "default-team-id",
      },
    },
  });

  // Create admin user
  const admin = await prisma.user.create({
    data: {
      email: "admin@company.com",
      microsoftId: "admin-ms-id",
      firstName: "Admin",
      lastName: "User",
      role: Role.ADMIN,
      position: "Administrator",
      hireDate: new Date(),
      phone: "555-0100",
      department: "Administration",
    },
  });

  // Create Azure AD account for admin
  await prisma.account.create({
    data: {
      userId: admin.id,
      type: "oauth",
      provider: "azure-ad",
      providerAccountId: "admin-ms-id",
      scope: "openid profile email",
      token_type: "Bearer",
      id_token: "mock-id-token",
    },
  });

  // Create manager
  const manager = await prisma.user.create({
    data: {
      email: "manager@company.com",
      microsoftId: "manager-ms-id",
      firstName: "Project",
      lastName: "Manager",
      role: Role.MANAGER,
      position: "Project Manager",
      hireDate: new Date(),
      phone: "555-0200",
      department: "Operations",
    },
  });

  // Create Azure AD account for manager
  await prisma.account.create({
    data: {
      userId: manager.id,
      type: "oauth",
      provider: "azure-ad",
      providerAccountId: "manager-ms-id",
      scope: "openid profile email",
      token_type: "Bearer",
      id_token: "mock-id-token",
    },
  });

  // Create employees
  const employees = await Promise.all(
    Array.from({ length: 3 }).map(async (_, index) => {
      const employee = await prisma.user.create({
        data: {
          email: `employee${index + 1}@company.com`,
          microsoftId: `employee-ms-id-${index + 1}`,
          firstName: `Employee`,
          lastName: `${index + 1}`,
          role: Role.EMPLOYEE,
          position: "Construction Worker",
          hireDate: new Date(),
          phone: `555-0${300 + index}`,
          department: "Construction",
        },
      });

      // Create Azure AD account for each employee
      await prisma.account.create({
        data: {
          userId: employee.id,
          type: "oauth",
          provider: "azure-ad",
          providerAccountId: `employee-ms-id-${index + 1}`,
          scope: "openid profile email",
          token_type: "Bearer",
          id_token: "mock-id-token",
        },
      });

      return employee;
    })
  );

  // Create project
  const project = await prisma.project.create({
    data: {
      name: "Demo Construction Project",
      description: "Initial demo project for testing",
      status: ProjectStatus.IN_PROGRESS,
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      budget: 100000,
      clientName: "Demo Client",
      creatorId: manager.id,
      teamsChannelId: "demo-channel-id",
      location: {
        lat: 40.7128,
        lng: -74.006,
      },
    },
  });

  // Create project members
  await prisma.projectMember.createMany({
    data: [
      {
        projectId: project.id,
        userId: manager.id,
        role: "manager",
      },
      ...employees.map((employee) => ({
        projectId: project.id,
        userId: employee.id,
        role: "worker",
      })),
    ],
  });

  // Create document
  const document = await prisma.document.create({
    data: {
      title: "Project Plan",
      description: "Initial project planning document",
      sharepointUrl: "https://sharepoint.com/doc1",
      projectId: project.id,
      uploadedById: manager.id,
      file_size: 1024 * 1024, // 1MB
      mimeType: "application/pdf",
      version: 1,
    },
  });

  // Create time entries
  await Promise.all(
    employees.map((employee) =>
      prisma.timeEntry.create({
        data: {
          userId: employee.id,
          projectId: project.id,
          date: new Date(),
          hours: 8,
          type: "REGULAR",
          description: "Regular work day",
          status: "PENDING",
          location: {
            lat: 40.7128,
            lng: -74.006,
          },
        },
      })
    )
  );

  // Create expense
  const expense = await prisma.expense.create({
    data: {
      userId: employees[0]!.id,
      projectId: project.id,
      description: "Construction materials",
      amount: 1500.0,
      date: new Date(),
      category: ExpenseCategory.MATERIALS,
      notes: "Emergency supplies needed",
      receipt: {
        create: {
          fileName: "receipt.pdf",
          fileUrl: "https://sharepoint.com/receipts/1",
        },
      },
    },
  });

  // Create payroll record
  const payroll = await prisma.payrollRecord.create({
    data: {
      userId: employees[0]!.id,
      periodStart: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // 2 weeks ago
      periodEnd: new Date(),
      regularHours: 80,
      overtimeHours: 5,
      grossPay: 2500.0,
      netPay: 1875.0,
      status: "PENDING",
    },
  });

  console.log({
    message: "Database seeded successfully!",
    data: {
      msIntegration: { id: msIntegration.id },
      admin: { id: admin.id, email: admin.email },
      manager: { id: manager.id, email: manager.email },
      employeesCount: employees.length,
      project: { id: project.id, name: project.name },
      document: { id: document.id, title: document.title },
      expense: expense ? { id: expense.id, amount: expense.amount } : null,
      payroll: { id: payroll.id, userId: payroll.userId },
    },
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

// import { PrismaClient } from "@prisma/client";
// // import { prisma } from "../src/lib/db/prisma";

// const prisma = new PrismaClient();

// // Define the enums manually to match your schema
// enum Role {
//   ADMIN = "ADMIN",
//   MANAGER = "MANAGER",
//   EMPLOYEE = "EMPLOYEE",
// }

// enum ProjectStatus {
//   PLANNED = "PLANNED",
//   IN_PROGRESS = "IN_PROGRESS",
//   ON_HOLD = "ON_HOLD",
//   COMPLETED = "COMPLETED",
// }

// enum ExpenseCategory {
//   MATERIALS = "MATERIALS",
//   EQUIPMENT = "EQUIPMENT",
//   VEHICLE = "VEHICLE",
//   TRAVEL = "TRAVEL",
//   MEALS = "MEALS",
//   SUPPLIES = "SUPPLIES",
//   OTHER = "OTHER",
// }

// interface SeedResult {
//   msIntegration: any;
//   admin: any;
//   manager: any;
//   employeesCount: number;
//   project: any;
//   document: any;
//   expense: any | null;
//   payroll: any;
// }

// async function main(): Promise<SeedResult> {
//   // Clean existing data
//   await prisma.$transaction([
//     prisma.expenseReceipt.deleteMany(),
//     prisma.expense.deleteMany(),
//     prisma.payrollRecord.deleteMany(),
//     prisma.timeEntry.deleteMany(),
//     prisma.document.deleteMany(),
//     prisma.projectMember.deleteMany(),
//     prisma.project.deleteMany(),
//     prisma.overtimeBank.deleteMany(),
//     prisma.user.deleteMany(),
//     prisma.microsoftIntegration.deleteMany(),
//   ]);

//   // Create Microsoft integration
//   const msIntegration = await prisma.microsoftIntegration.create({
//     data: {
//       tenantId: "demo-tenant-id",
//       settings: {
//         teamsEnabled: true,
//         sharepointEnabled: true,
//         defaultTeamId: "default-team-id",
//       },
//     },
//   });

//   // Create admin user
//   const admin = await prisma.user.create({
//     data: {
//       email: "admin@company.com",
//       microsoftId: "admin-ms-id",
//       firstName: "Admin",
//       lastName: "User",
//       role: Role.ADMIN,
//       position: "Administrator",
//       hireDate: new Date(),
//       phone: "555-0100",
//       department: "Administration",
//     },
//   });

//   // Create manager
//   const manager = await prisma.user.create({
//     data: {
//       email: "manager@company.com",
//       microsoftId: "manager-ms-id",
//       firstName: "Project",
//       lastName: "Manager",
//       role: Role.MANAGER,
//       position: "Project Manager",
//       hireDate: new Date(),
//       phone: "555-0200",
//       department: "Operations",
//     },
//   });

//   // Create employees
//   const employees = await Promise.all(
//     Array.from({ length: 3 }).map((_, index) =>
//       prisma.user.create({
//         data: {
//           email: `employee${index + 1}@company.com`,
//           microsoftId: `employee-ms-id-${index + 1}`,
//           firstName: `Employee`,
//           lastName: `${index + 1}`,
//           role: Role.EMPLOYEE,
//           position: "Construction Worker",
//           hireDate: new Date(),
//           phone: `555-0${300 + index}`,
//           department: "Construction",
//         },
//       })
//     )
//   );

//   // Create project
//   const project = await prisma.project.create({
//     data: {
//       name: "Demo Construction Project",
//       description: "Initial demo project for testing",
//       status: ProjectStatus.IN_PROGRESS,
//       startDate: new Date(),
//       endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
//       budget: 100000,
//       clientName: "Demo Client",
//       creatorId: manager.id,
//       teamsChannelId: "demo-channel-id",
//       location: {
//         lat: 40.7128,
//         lng: -74.006,
//       },
//     },
//   });

//   // Create project members
//   await prisma.projectMember.createMany({
//     data: [
//       {
//         projectId: project.id,
//         userId: manager.id,
//         role: "manager",
//       },
//       ...employees.map((employee: any) => ({
//         projectId: project.id,
//         userId: employee.id,
//         role: "worker",
//       })),
//     ],
//   });

//   // Create document
//   const document = await prisma.document.create({
//     data: {
//       title: "Project Plan",
//       description: "Initial project planning document",
//       sharepointUrl: "https://sharepoint.com/doc1",
//       projectId: project.id,
//       uploadedById: manager.id,
//       fileSize: 1024 * 1024,
//       mimeType: "application/pdf",
//       version: 1,
//     },
//   });

//   // Create expense with null check
//   const firstEmployee = employees[0];
//   let expense = null;

//   if (firstEmployee) {
//     expense = await prisma.expense.create({
//       data: {
//         userId: firstEmployee.id,
//         projectId: project.id,
//         description: "Construction materials",
//         amount: 1500.0,
//         date: new Date(),
//         category: ExpenseCategory.MATERIALS,
//         notes: "Emergency supplies needed",
//         receipt: {
//           create: {
//             fileName: "receipt.pdf",
//             fileUrl: "https://sharepoint.com/receipts/1",
//           },
//         },
//       },
//     });
//   }

//   // Create payroll record
//   const payroll = await prisma.payrollRecord.create({
//     data: {
//       userId: firstEmployee?.id ?? admin.id,
//       periodStart: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
//       periodEnd: new Date(),
//       regularHours: 80,
//       overtimeHours: 5,
//       grossPay: 2500.0,
//       netPay: 1875.0,
//       status: "PENDING", // Optional since it's the default
//     },
//   });

//   return {
//     msIntegration,
//     admin,
//     manager,
//     employeesCount: employees.length,
//     project,
//     document,
//     expense,
//     payroll,
//   };
// }

// main()
//   .catch((e) => {
//     console.error(e);
//     process.exit(1);
//   })
//   .finally(async () => {
//     await prisma.$disconnect();
//   });
