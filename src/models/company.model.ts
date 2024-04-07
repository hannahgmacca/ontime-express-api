import mongoose, { Model, ObjectId, Schema } from 'mongoose';

export interface ICompany {
  _id: ObjectId;
  companyName: String;
}

export type CompanyModel = Model<ICompany>;

export const companySchema: Schema = new Schema<ICompany, CompanyModel>({
  companyName: String,
});

const Company: CompanyModel = mongoose.model<ICompany, CompanyModel>(
  'Company',
  companySchema,
);

export default Company;
