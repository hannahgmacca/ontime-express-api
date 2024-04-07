import { ObjectId } from 'mongoose';
import { JobsiteModel } from '../models/jobsite.model';
import { RoleModel } from '../models/role.model';

export interface JwtPayload {
  _id: ObjectId;
  email: string;
  roles: RoleModel[];
  jobsites: JobsiteModel[];
}
