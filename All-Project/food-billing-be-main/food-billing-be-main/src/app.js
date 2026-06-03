// src/app.js
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import connectDB from './config/database.js';
import errorHandler from './middlewares/errorMiddleware.js';
import { swaggerUi, specs } from './config/swagger.js';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import hotelsRoutes from './routes/hotelBrandRoutes.js';
import branchRoutes from './routes/branchRoutes.js';
import TableRoutes from './routes/tableRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import foodRoutes from './routes/foodRoute.js';
import rawMaterialStockRoutes from './routes/rawMaterialStockRoutes.js';
import monthlyReportRoutes from './routes/monthlyreportRoutes.js';
import invoiceRoutes from './routes/invoiceRoutes.js';
import StockConsumptionRouter from './routes/StockConsumptionRouter.js';
import expenseRouter from './routes/expenseRouter.js';
import suppliersRouter from './routes/suppliersRouter.js';
import waiterRouter from './routes/waiterRoutes.js';
import restaurantRouter from './routes/restaurantRouter.js';
import taxsettingsRoutes from './routes/taxsettingsRoutes.js';
import PrintersettingRoutes from './routes/PrintersettingRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js'
import dashboardRoutes from './routes/dashboardRoutes.js'
import notificationRoutes from "./routes/notificationRoutes.js";
import kitchenRoutes from "./routes/kitchenRoutes.js";
import bodyParser from 'body-parser'
const app = express();
app.use(bodyParser.json({ limit: '100mb' }));
app.use(bodyParser.urlencoded({ limit: '100mb', extended: true }));
// Connect to database
connectDB();

// Middleware
app.use(
  cors({
    origin: '*', // Adjust to your client's origin
    credentials: true,
  }),
);
app.use(helmet());
app.use(express.json());

// Swagger documentation
// app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));
// Serve Swagger UI
app.use('/api-docs', swaggerUi.serve);
app.get('/api-docs', swaggerUi.setup(specs));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/hotelBrands', hotelsRoutes);
app.use('/api/branches', branchRoutes);
app.use('/api/tables', TableRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/foods', foodRoutes);
app.use('/api/raw', rawMaterialStockRoutes);
app.use('/api/report', monthlyReportRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/stock', StockConsumptionRouter);
app.use('/api/expenses', expenseRouter);
app.use('/api/supplier', suppliersRouter);
app.use('/api/waiters', waiterRouter);
app.use('/api/info', restaurantRouter);
app.use('/api/tax', taxsettingsRoutes);
app.use('/api/printer', PrintersettingRoutes);

app.use('/api/categories', categoryRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/kitchen", kitchenRoutes);

app.get('/', (req, res) => {
  res.send('Welcome to the servers')
})
// app.listen(8000, function (err) {
//   if (err) console.log("Error in server setup")
//   console.log("Server listening on Port", 8000);
// })
// Error handling middleware
app.use(errorHandler);

export default app;
