import mongooseToSwagger from 'mongoose-to-swagger';
import User from '../../models/userModel.js';
import HotelBrand from '../../models/hotelBrandModel.js';
import Branch from '../../models/branchModel.js';
import Table from '../../models/tableModel.js';

const userSchema = mongooseToSwagger(User);
const hotelBrandSchema = mongooseToSwagger(HotelBrand);
const hotelBranchSchema = mongooseToSwagger(Branch);
// const tablesSchema = mongooseToSwagger(Table);

export { userSchema,hotelBrandSchema,hotelBranchSchema};
