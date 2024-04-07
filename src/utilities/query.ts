import { UserDomain } from '../models/domain/user-domain.model';

export const getTimeRecordQuery = (req: any, user: UserDomain): any => {
  const { employees, jobsites, startDate, endDate, isApproved } = req.query;
  if (!req.query) return {};

  const baseQuery: any = {};
  let query: any[] = [];

  if (startDate) {
    baseQuery.startTime = { $gte: new Date(startDate) };
  }

  if (endDate) {
    baseQuery.endTime = { $lte: new Date(endDate) };
  }

  if (employees) {
    query.push({ employee: { $in: employees.split(',') } });
  }

  if (jobsites) {
    query.push({ 'jobsite._id': { $in: jobsites.split(',') } });
  }

  if (isApproved) {
    baseQuery.isApproved = isApproved;
  }

  if (user.getIsAdmin()) {
    return { $and: query, ...baseQuery };
  }

  // Supervisor query
  if (user.getIsSupervisor()) {
    query.push({ 'jobsite._id': { $in: user.jobsites } });
  }

  // Employee query
  if (user.getIsEmployee()) {
    query.push({ employee: user._id });
  }

  // Apply $or condition
  const finalQuery = { $and: query, ...baseQuery };
  return finalQuery;
};
