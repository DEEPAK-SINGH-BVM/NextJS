// src/middlewares/validateMiddleware.js
import { ZodError } from 'zod';

const validate = (schema) => (req, res, next) => {
  try {
    schema.parse(req.body);
    next();
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({ message: error.errors.map(err => err.message).join(', ') });
    }
    next(error);
  }
};

export default validate;
