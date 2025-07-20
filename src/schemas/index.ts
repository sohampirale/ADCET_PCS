import {z} from "zod"

const usernameSchema=z.string().min(2).max(50);

const emailSchema=z
    .string()
    .trim()
    .toLowerCase()
    .email({ message: "Enter a valid email address" });

const passwordSchema = z.string()
  .min(8, "Password must be at least 8 characters")
  .refine((val) => /[a-z]/.test(val), {
    message: "Must include a lowercase letter",
  })
  .refine((val) => /[A-Z]/.test(val), {
    message: "Must include an uppercase letter",
  })
  .refine((val) => /\d/.test(val), {
    message: "Must include a number",
  })
  .refine((val) => /[!@#$%^&*(),.?":{}|<>]/.test(val), {
    message: "Must include a special character",
  });

/**
 * 1.signup user
 * 
 */

const URNSchema=z
    .string()
    .min(5)
    .max(15)

const cuidRegex = /^c[a-z0-9]{24}$/;

const signupSchema=z.object({
    URN:URNSchema,
    username:usernameSchema,
    email:emailSchema,
    password:passwordSchema,
    gender:z.enum(["Male","Female"]),
    role:z.enum(["Student","Mentor"]),
    mentorId:z.string().regex(cuidRegex, { message: "Invalid CUID format" }).optional()
})

export {
    signupSchema
}