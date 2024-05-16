import { Types } from 'mongoose';
import { ICompany } from '../company.model';
import { IRole } from '../role.model';
import { IUser } from '../user.model';

export class UserDomain implements IUser {
  _id: Types.ObjectId;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  company: ICompany;
  roles: IRole[];
  jobsites: Types.ObjectId[];
  resetCode: string | null;

  constructor(user: IUser) {
    this._id = user._id;
    this.email = user.email;
    this.password = user.password;
    this.firstName = user.firstName;
    this.lastName = user.lastName;
    this.company = user.company;
    this.roles = user.roles;
    this.jobsites = user.jobsites;
    this.resetCode = user.resetCode;
  }

  getIsSupervisor(): boolean {
    return this.roles.some((role) => role.name === 'supervisor');
  }

  getIsEmployee(): boolean {
    return this.roles.some((role) => role.name === 'employee');
  }

  getIsAdmin(): boolean {
    return this.roles.some((role) => role.name === 'admin');
  }

  getSupervisorJobsitePermission(jobsiteId: Types.ObjectId): boolean {
    return this.getIsSupervisor() && this.jobsites.some((j) => j == jobsiteId);
  }

  getEmployeeUpdatePermission(createdByUserId: Types.ObjectId): boolean {
    return this.getIsEmployee() && this._id == createdByUserId;
  }

  getUserTimeRecordPermission(jobsiteId: Types.ObjectId, createdByUserId: Types.ObjectId) {
    return (
      this.getIsAdmin() ||
      this.getSupervisorJobsitePermission(jobsiteId) ||
      this.getEmployeeUpdatePermission(createdByUserId)
    );
  }

  getUserTimesheetPermission(createdByUserId: Types.ObjectId) {
    return this.getIsAdmin() || this.getEmployeeUpdatePermission(createdByUserId);
  }
}
