import { RESPONSE_CODES } from "@/constants";
import ApiError from "@/lib/ApiError";
import ApiResponse from "@/lib/ApiResponse";
import handleError from "@/lib/handleError";
import prisma from "@/lib/prisma";
import { signupSchema } from "@/schemas";
import { NextRequest, NextResponse } from "next/server";
import { MENTOR_FEMALE, MENTOR_MALE, STUDENT_FEMALE, STUDENT_MALE } from "../../public/avatars";
import giveRandom from "@/utils/giveRandom";
import bcrypt from "bcrypt"
import { checkUserExistsWithURN, checkUserExistsWithUsername } from "@/services/user.services";

export async function getAllUserSuggestionsController(req:NextRequest){
 const searchParams = req.nextUrl.searchParams
    const searchTerm = searchParams.get("searchTerm")?.trim() || ""

    try {

        const users=await prisma.user.findMany({
            where:{
                OR:[
                    {
                        username:{
                            contains:searchTerm,
                            mode:'insensitive'
                        }
                    },{
                        name:{
                            contains:searchTerm,
                            mode:'insensitive'
                        }
                    },{
                        email:{
                            contains:searchTerm,
                            mode:'insensitive'
                        }
                    },{
                        URN:{
                            contains:searchTerm,
                            mode:'insensitive'
                        }
                    },
                ]
            },
            select:{
                id:true,
                username:true,
                image:true
            }
        })

        return NextResponse.json(
            new ApiResponse(true,"Usernames fetched successfully",RESPONSE_CODES.DONE,users,null),{
                status:200
            }
        )

    } catch (error) {
        return handleError(error)
    }
}

export async function singupController(req:NextRequest){
     try {

        const body = await req.json();
        console.log('body : ',body);
        
        const parsed = signupSchema.safeParse(body)
        
        if (!parsed.success) {
            console.log(parsed.error);
    
            throw new ApiError(400,"Invalid data format provided",RESPONSE_CODES.INVALID,parsed.error.flatten())
        }

        const { URN, email, username, password, role, gender ,mentorId} = parsed.data;

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
            throw new ApiError(409,"User with those credentials already exists",RESPONSE_CODES.TAKEN,null)
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
                name: username,
                role,
                gender,
                image: avatarUrl,
                ...(mentorId && {mentorId})
            },
            select: {
                id: true,
                username: true,
                email: true,
                URN: true
            }
        })

        return NextResponse.json(
            new ApiResponse(true, "User created successfully", "DONE", user, null), {
                status: 201
            }
        )

    } catch (error) {
        return handleError(error);
    }
}

export async function checkUsernameURNAvailaibilityController(req:NextRequest){
    try {
        const { searchParams } = req.nextUrl;
        const username = searchParams.get('username');
        const URN = searchParams.get("URN");
        let usernameAvailable=false;
        let URNAvailable=false;

        if(username && ! await checkUserExistsWithUsername(username)){
            usernameAvailable=true
        }

        if(URN && !await checkUserExistsWithURN(URN)){
            URNAvailable=true;
        }

        console.log('usernameAvailaible : ',usernameAvailable);
        console.log('URNAvailaible : ',URNAvailable);

        
        return NextResponse.json(
            new ApiResponse(true,"Username and URN avalaibility check successfully",RESPONSE_CODES.DONE,{usernameAvailable,URNAvailable},null),{
                status:200
            }
        )

    } catch (error) {
        return handleError(error)
    }
}