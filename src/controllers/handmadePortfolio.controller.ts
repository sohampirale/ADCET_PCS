import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import ApiResponse from "@/lib/ApiResponse";
import { createHandmadePortfolioSchema, prismaIdSchema } from "@/schemas";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { addLikedByUserToHandmadePortfolios, checkIsHandmadePortfolioLikedByUser, createNewHandmadePortfolio, getAllHandmadePortfolios, getAllHandmadePortfoliosOfUser, getAllHandmadePortfoliosWithFilter, getSingleHandmadePortfolioWithId, getTop3MostLikedHandmadePortfolios } from "@/services/handmadePortfolio.services";
import ApiError from "@/lib/ApiError";
import handleError from "@/lib/handleError";
import { RESPONSE_CODES } from "@/constants";
import checkUserLoggedInOrThrow from "@/lib/checkUserLoggedInOrThrow";
import { createLikeForHandmadePortfolio, deleteOneLikeOfHandmadePortfolio, getLikeOfHandmadePortfolio } from "@/services/like.services";
import prisma from "@/lib/prisma";

export async function createHandmadePortfolio(req: NextRequest) {
    try {
        console.log('inside createHandmadePortfolio controller');

        const body = await req.json();

        const session = await getServerSession(authOptions);

        if (!session || !session.user || !session.user.id) {
            console.log('user not logged in');

            return NextResponse.json(
                new ApiResponse(false, "User not logged in", "NOT_LOGGED_IN", null, null),
                { status: 401 }
            );
        }

        body.ownerId = session.user.id;

        if (session.user.mentorId) {
            body.mentorId = session.user.mentorId;
        }
        console.log('body before parsing : ', body);

        const parsed = createHandmadePortfolioSchema.safeParse(body);

        if (!parsed.success) {
            console.log('Parsing failed : ', parsed.error);

            return NextResponse.json(
                new ApiResponse(false, "Invalid data provided", "INVALID", null, null), {
                status: 400
            }
            )
        }

        console.log('Parsing success');

        const { title, images, ownerId, mentorId } = parsed.data;

        const handmadePortfolio = await createNewHandmadePortfolio(title, images, ownerId, mentorId);
        console.log('H-portfolio created');

        return NextResponse.json(
            new ApiResponse(true, "Handmade Portfolio uploaded successfully", "DONE", handmadePortfolio, null), {
            status: 201
        }
        )

    } catch (error) {
        console.log('error at backend : ', error);

        return NextResponse.json(
            new ApiResponse(false, "Failed to upload the handmade portfolio", "SERVER_ERROR", null, null), {
            status: 500
        }
        )
    }
}

export async function getAllHandmadePortfoliosController(req: NextRequest) {
    try {
        const searchParams = req.nextUrl.searchParams;

        const searchTerm = searchParams.get("searchTerm")?.trim() || ""

        const yearParam = searchParams.get("year")?.trim()

        const year = yearParam && !isNaN(Number(yearParam)) ? Number(yearParam) : undefined

        let handmadePortfolios;

        if (searchTerm || year) {
            handmadePortfolios = await getAllHandmadePortfoliosWithFilter(searchTerm, year)
        } else {
            handmadePortfolios = await getAllHandmadePortfolios();
        }

        const session = await getServerSession(authOptions);

        handmadePortfolios = await addLikedByUserToHandmadePortfolios(handmadePortfolios, session?.user?.id);

        return NextResponse.json(
            new ApiResponse(true, "All Handmade-Portfolios fetched successfully", "DONE", handmadePortfolios, null,), {
            status: 200
        }
        )

    } catch (error) {
        return handleError(error)
    }
}

export async function getSingleHandmadePortfolioController(req: NextRequest, { params }: { params: Promise<{ hpId: string }> }) {
    try {
        const { hpId: receievedHpId } = await params;

        const session = await getServerSession(authOptions)

        // if (!session || !session.user || !session.user.id) {
        //     throw new ApiError(401, "User not logged in", 'NOT_LOGGED_IN', null);
        // }

        const parsed = prismaIdSchema.safeParse(receievedHpId)

        if (!parsed.success) {
            throw new ApiError(400, "Invalid Id of Handmade-Portfolio", "INVALID", null)
        }

        const hpId = parsed.data;

        const handmadePortfolio = await getSingleHandmadePortfolioWithId(hpId)

        if (!handmadePortfolio) {
            throw new ApiError(404, "Handmade-Portfolio not found", "NOT_FOUND", null)
        }

        const liked = await checkIsHandmadePortfolioLikedByUser(hpId, session?.user?.id!)

        const data = { ...handmadePortfolio, likedByUser: liked ? true : false }

        return NextResponse.json(
            new ApiResponse(true, "Sucess", "DONE", data, null), {
            status: 200
        }
        )

    } catch (error) {
        return handleError(error)
    }
}

export async function getTop3MostLikedHandmadePortfoliosController(req: NextRequest) {
    try {
        let top3EPortfolios = await getTop3MostLikedHandmadePortfolios();

        const session = await getServerSession(authOptions);

        top3EPortfolios = await addLikedByUserToHandmadePortfolios(top3EPortfolios, session?.user?.id!);

        return NextResponse.json(
            new ApiResponse(true, 'Top 3 most liked E-Portfolios fetched successfully', "DONE", top3EPortfolios, null), {
            status: 200
        }
        )
    } catch (error) {
        handleError(error);
    }
}

export async function likeSingleHandmadePortfolioController(req: NextRequest, context: { params: Promise<{ hpId: string }> }) {
    try {

        const { hpId: receivedHpId } = await context.params;

        const parsed = prismaIdSchema.safeParse(receivedHpId);

        if (!parsed.success) {
            throw new ApiError(400, "Invalid Handmade-Portfolio id provided", RESPONSE_CODES.INVALID, null)
        }

        const hpId = parsed.data;

        const {id:userId} = await checkUserLoggedInOrThrow();

        const hpExists = await getSingleHandmadePortfolioWithId(hpId);

        if (!hpExists) {
            throw new ApiError(404, "Requested Handmade-Portfolio does not exists", RESPONSE_CODES.NOT_FOUND, null)
        }

        const likeExists = await getLikeOfHandmadePortfolio(hpId,userId)

        if (likeExists) {
            return NextResponse.json(
                new ApiResponse(false, "This handmade portfolio is already liked by you", RESPONSE_CODES.INVALID, null, null), {
                    status: 409
                }
            )
        }

        await createLikeForHandmadePortfolio(hpId,userId);

        return NextResponse.json(
            new ApiResponse(true, "Handmade-Portfolio liked successfully", RESPONSE_CODES.DONE, null, null), {
                status: 201
            }
        )

    } catch (error) {
        return handleError(error)
    }
}

export async function unlikeSingleHandmadePortfolioController(req:NextRequest,context:{params:Promise<{hpId:string}>}){
    try {
      const {hpId:receivedHpId} = await context.params;

      const parsed= prismaIdSchema.safeParse(receivedHpId);

      if(!parsed.success){
         throw new ApiError(400,"Invalid E-Portfolio id provided",RESPONSE_CODES.INVALID,null);
      }
      
      const hpId = parsed.data;

      const {id:userId} = await checkUserLoggedInOrThrow();

      const epExists=await getSingleHandmadePortfolioWithId(hpId);

      if(!epExists){
         throw new ApiError(404,"Handmade-Portfolio does not exists anymore",RESPONSE_CODES.NOT_FOUND,null)
      }

      const likeExists = await getLikeOfHandmadePortfolio(hpId,userId);

      if(!likeExists){
         throw new ApiError(409,"This Handmade-portfolio is not liked by you",RESPONSE_CODES.INVALID,null)
      }

      const deletedLike = await deleteOneLikeOfHandmadePortfolio(hpId,userId)

      return NextResponse.json(
         new ApiResponse(true,"E-portfolio unliked successfully",RESPONSE_CODES.DONE,null,null),{
            status:200
         }
      )

   } catch (error) {
      return handleError(error)
   }
}

export async function deleteImagesFromHandmadePortfolioController(req:NextRequest,{params}:{params:Promise<{hpId:string}>}){

    try {

        const {hpId:receivedHpId} = await params;

        const parsed = prismaIdSchema.safeParse(receivedHpId);

        if(!parsed.success){
            throw new ApiError(400,"Invalid handmade-portfolio id provided",RESPONSE_CODES.INVALID,null)
        }

        const hpId=parsed.data;

        const {indexes} = await req.json();

        if(!Array.isArray(indexes) || indexes.length==0){
            throw new ApiError(400,"Invalid images data provided",RESPONSE_CODES.INVALID,null)
        }

        const {id:userId} = await checkUserLoggedInOrThrow()

        const handmadePortfolio=await getSingleHandmadePortfolioWithId(hpId);

        if(!handmadePortfolio){
            throw new ApiError(404,"Handmade-portfolio does not found",RESPONSE_CODES.NOT_FOUND,null)
        } else if(userId!==handmadePortfolio?.owner.id){
            throw new ApiError(401,"You dont have permission delete the images",RESPONSE_CODES.UNAUTHORIZED,null)
        }

        let images=handmadePortfolio.images;

        for(let i=0;i<indexes.length;i++){
            const index=indexes[i]
            if(index<images.length && index>=0){
                (images[index] as any)=null;
            }
        }

        images=images.filter((image)=>(image!==null))

        const updatedHandmadePortfolio=await prisma.handmadePortfolio.update({
            where: { id: hpId },
            data: { images }
        });

        return NextResponse.json(
            new ApiResponse(true,"Images deleted successfully",RESPONSE_CODES.DONE,updatedHandmadePortfolio,null),{
                status:204
            }
        )
        
    } catch (error) {
        return handleError(error)
    }
}

export async function getAllHandmadePortfoliosOfUserController(req: NextRequest,{params}:{params:Promise<{userId:string}>}) {
    try {
        const { userId } = await params;

        let handmadePortfolios = await getAllHandmadePortfoliosOfUser(userId)

        const session = await getServerSession(authOptions);

        handmadePortfolios=await addLikedByUserToHandmadePortfolios(handmadePortfolios, session?.user?.id!)

        return NextResponse.json(
            new ApiResponse(true, "All Handmade-Portfolios of the user fetched successfully", "DONE", handmadePortfolios, null), {
                status: 200
            }
        )

    } catch (error) {
        handleError(error)
    }
}