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

const prismaIdSchema=z.string().cuid();

/**
 * 1.signup user
 * 2.createEPortfolio
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
    mentorId:prismaIdSchema.optional()
})

const createPortfolioSchema=z.object({
  title:z.string().max(50),
  link:z.string(),
  ownerId:z.string()
})

const createHandmadePortfolioSchema=z.object({
  title:z.string(),
  images:z.array(z.string()),
  ownerId:z.string(),
  mentorId:z.string().optional()
})

const addImagesInHandmadePortfolio=z.object({
  hpId:prismaIdSchema,
  images:z.array(z.string())
})

const updateEPortfolioDetails=z.object({
  epId:prismaIdSchema,
  link:z.string().optional(),
  title:z.string().max(100).optional()
}).refine((data) => data.link || data.title, {
  message: "At least one of 'link' or 'title' must be provided."
});

const creditItemSchema = z.object({
  id:z.string(),
  username:z.string()
})

const creditsSchema = z.record(z.string(),z.array(z.string()));

const createEventSchema=z.object({
  mentorId:prismaIdSchema,
  title:z.string().max(100),
  description:z.string(),
  images:z.array(z.string()).optional(),
  videos:z.array(z.string().url()).optional(),
  thumbnail:z.string().optional(),
  createdAt:z.preprocess(
    (val) => (typeof val === "string" || val instanceof Date ? new Date(val) : undefined),
    z.date()),
  credits:creditsSchema.optional()
})

const editEventCoordinatorsSchema = z.object({
  evId:prismaIdSchema,
  credits:creditsSchema
})

const editImagesOfEventSchema=z.object({
  evId:prismaIdSchema,
  images:z.array(z.string())
})

const editMetadataOfEventSchema=z.object({
  evId:prismaIdSchema,
  title:z.string().max(100).optional(),
  thumbnail:z.string().optional(),
  description:z.string().optional()
}).refine((data)=>(data.title || data.description || data.thumbnail),{
  message:"Atleast one is necessary(title,description,thumbnail"
})

const linkSchema = z.string().url({
  message: "Invalid URL. Make sure it starts with http:// or https://",
});


export const registerUploadedImagesSchema=z.object({
  images:z.array(z.string())
})

export const deleteImagesFromCloudinarySchema=z.object({
  images:z.array(z.string())
})


export {
  prismaIdSchema,
  signupSchema,
  createPortfolioSchema,
  createHandmadePortfolioSchema,
  addImagesInHandmadePortfolio,
  updateEPortfolioDetails,
  creditsSchema,
  editEventCoordinatorsSchema,
  createEventSchema,
  editImagesOfEventSchema,
  editMetadataOfEventSchema,
  linkSchema
}