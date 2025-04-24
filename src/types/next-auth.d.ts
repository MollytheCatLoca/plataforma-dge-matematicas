import "next-auth";
import { UserRole, GradeLevel } from "@prisma/client";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      firstName: string;
      lastName: string;
      role: UserRole;
      image?: string;
      isActive: boolean;
      schoolId?: string;
      gradeLevel?: GradeLevel;
    };
  }

  interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: UserRole;
    isActive: boolean;
    schoolId?: string;
    gradeLevel?: GradeLevel;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: UserRole;
    isActive: boolean;
    schoolId?: string;
    gradeLevel?: GradeLevel;
  }
}