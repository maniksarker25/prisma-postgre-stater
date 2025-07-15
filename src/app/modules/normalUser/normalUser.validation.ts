import { z } from "zod";
const locationSchema = z.object({
  type: z.literal("Point"),
  coordinates: z.array(z.number()).length(2, "Coordinates must be [longitude, latitude]"),
});
const registerNormalUserValidationSchema = z.object({
  body: z.object({
    password: z
      .string({ required_error: "Password is required" })
      .min(6, { message: "Password must be at least 6 characters" }),
    confirmPassword: z
      .string({ required_error: "Confirm password is required" })
      .min(6, { message: "Password must be at least 6 characters" }),
    name: z.string({
      required_error: "Name is required",
      invalid_type_error: "Name must be a string",
    }),
    email: z.string().email("Invalid email format"),
    phone: z.string().optional(),
    location: locationSchema,
    address: z.string({ required_error: "Address is required" }),
    dateOfBirth: z.string({ required_error: "Date of birth is required" }),
  }),
});

const updateNormalUserValidationSchema = z.object({
  body: z.object({
    name: z
      .string({
        required_error: "Name is required",
        invalid_type_error: "Name must be a string",
      })
      .optional(),
    email: z.string().email("Invalid email format").optional(),
    phone: z.string().optional(),
    location: locationSchema.optional(),
    address: z.string().optional(),
    dateOfBirth: z.string({ required_error: "Date of birth is required" }).optional(),
  }),
});

const normalUserValidations = {
  registerNormalUserValidationSchema,
  updateNormalUserValidationSchema,
};

export default normalUserValidations;
