import ApiResponse from "@/lib/ApiResponse";
import prisma from "@/lib/prisma";
import { signupSchema } from "@/schemas";
import { NextResponse } from "next/server";
import bcrypt from "bcrypt"
import giveRandom from "@/utils/giveRandom";
import { MENTOR_FEMALE, MENTOR_MALE, STUDENT_FEMALE, STUDENT_MALE } from "../../../../public/avatars";

/**Signup
 * 1.retrive email,username,password,role,name,URN
 * 2.fetch a user with or for (email,username) if found then people with those email or username already exists
 * 3.create a user with those fields
 * 4.if not create reject
 * 5.retunr successfull response
 */

export async function POST(req: Request) {
    const body = await req.json();

    const parsed = signupSchema.safeParse(body)
    if (!parsed.success) {
        return NextResponse.json(
            new ApiResponse(false, "Invalid data format", "INVALID", null, parsed.error.format()), {
            status: 400
        }
        )
    }

    const { URN, email, username, password, role, gender } = parsed.data;

    try {
        const existingUser = await prisma.user.findFirst({
            where: {
                OR: [
                    { email },
                    { URN },
                    { username }
                ]
            }
        })

        if (existingUser) {
            return NextResponse.json(
                new ApiResponse(false, "User with those credentials already exists", "EXISTS", null, null), {
                status: 409
            }
            )
        }

        let avatarUrl;

        if (gender == "Male") {
            if (role == "Student") {
                avatarUrl = giveRandom(STUDENT_MALE);
            } else {
                avatarUrl = giveRandom(MENTOR_MALE)
            }
        } else if (gender == 'Female') {
            if (role == "Student") {
                avatarUrl = giveRandom(STUDENT_FEMALE)
            } else {
                avatarUrl = giveRandom(MENTOR_FEMALE)
            }
        }

        const hashedPassword = await bcrypt.hash(password, 5);

        const user = await prisma.user.create({
            data: {
                URN,
                email,
                username,
                password: hashedPassword,
                name:username,
                role,
                gender,
                image: avatarUrl
    
            },
            select:{
                id:true,
                username:true,
                email:true,
                URN:true
            }
        })

        return NextResponse.json(
            new ApiResponse(true, "User created successfully", "DONE", user, null), {
                status: 201
            }
        )

    } catch (error) {

        return NextResponse.json(
            new ApiResponse(false, "Failed to create the user", "SERVER_ERROR", null, null), {
                status: 500
            }
        )

    }
}