import ApiResponse from "@/lib/ApiResponse";
import { createPortfolioSchema, prismaIdSchema } from "@/schemas";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "../app/api/auth/[...nextauth]/route";
import { addLikedByUserToEPortfolios, checkIsEPortfolioLikedByUser, createEPortfolio, getAllEPortfolios, getAllEPortfoliosOfUser, getAllEportfoliosWithFilter, getSingleEPortfolioWithId, getTop3MostLikedEPortfolios } from "../services/ePortfolio.services";
import ApiError from "@/lib/ApiError";
import handleError from "@/lib/handleError";
import prisma from "@/lib/prisma";
import { RESPONSE_CODES } from "@/constants";
import checkUserLoggedInOrThrow from "@/lib/checkUserLoggedInOrThrow";
import { createLikeForEPortfolio, deleteOneLikeOfEPortfolio, getLikeOfEportfolio } from "@/services/like.services";

export async function createPortfolio(req: NextRequest) {
    try {

        const session = await getServerSession(authOptions)

        if (!session || !session.user || !session.user.id) {
            return NextResponse.json(
                new ApiResponse(false, "User not logged in", "NOT_LOGGED_IN", null, null), {
                status: 400
            }
            )
        }

        const body = await req.json();
        body.ownerId = session.user.id;

        const parsed = createPortfolioSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json(
                new ApiResponse(false, "Invalid data format provided", "INVALID", null, null), {
                status: 400
            }
            )
        }

        const { title, link, ownerId } = parsed.data;

        const eportfolio = await createEPortfolio(title, link, ownerId);

        return NextResponse.json(
            new ApiResponse(true, "E-Portfolio created successfully", "DONE", eportfolio, null), {
            status: 201
        }
        )

    } catch (error) {
        if (error instanceof ApiError) {
            return NextResponse.json(
                new ApiResponse(false, error.message || "Something went wrong", error.code || "SERVER_ERROR", null, error.error), {
                status: error.status || 500
            }
            )
        }

        return NextResponse.json(
            new ApiResponse(true, "Failed to create the E-Portfolio", "SERVER_ERROR", null, null), {
            status: 500
        }
        )
    }
}

export async function getSingleEPortfolioWithIdController(req: NextRequest, { params }: { params: Promise<{ epId: string }> }) {
    try {
        const { epId: receievedEpId } = await params;

        const session = await getServerSession(authOptions)

        //no need to check if a user is logged in or not
        // if (!session || !session.user || !session.user.id) {
        //     throw new ApiError(401, "User not logged in", 'NOT_LOGGED_IN', null);
        // }

        const parsed = prismaIdSchema.safeParse(receievedEpId)

        if (!parsed.success) {
            throw new ApiError(400, "Invalid Id of E-Portfolio", "INVALID", null)
        }

        const epId = parsed.data;

        const eportfolio = await getSingleEPortfolioWithId(epId)

        if (!eportfolio) {
            throw new ApiError(404, "E-Portfolio not found", "NOT_FOUND", null)
        }

        const liked = await checkIsEPortfolioLikedByUser(epId, session?.user?.id!)

        const data = { ...eportfolio, likedByUser: liked ? true : false }

        return NextResponse.json(
            new ApiResponse(true, "Sucess", "DONE", data, null), {
            status: 200
        }
        )

    } catch (error) {
        return handleError(error)
    }
}

export async function getAllEPortfoliosController(req: NextRequest) {
    try {
        const searchParams=req.nextUrl.searchParams;
        
        const searchTerm=searchParams.get("searchTerm")?.trim() || ""

        const yearParam = searchParams.get("year")?.trim() 

        const year =yearParam && !isNaN(Number(yearParam)) ? Number(yearParam) : undefined
        
        let eportfolios;

        if(searchTerm  || year){
            eportfolios=await getAllEportfoliosWithFilter(searchTerm,year)
        } else {
            eportfolios = await getAllEPortfolios();
        }

        const session = await getServerSession(authOptions);

        eportfolios=addLikedByUserToEPortfolios(eportfolios,session?.user?.id)

        return NextResponse.json(
            new ApiResponse(true, "All E-Portfolio fetched successfully", "DONE", eportfolios, null,),{
                status:200
            }
        )

    } catch (error) {
        return handleError(error)
    }
}

export async function getTop3MostLikedEPortfoliosController(req: NextRequest) {
    try {
        let top3EPortfolios = await getTop3MostLikedEPortfolios();

        const session = await getServerSession(authOptions);

        top3EPortfolios=await addLikedByUserToEPortfolios(top3EPortfolios, session?.user?.id);

        return NextResponse.json(
            new ApiResponse(true, 'Top 3 most liked E-Portfolios fetched successfully', "DONE", top3EPortfolios, null), {
            status: 200
        }
        )
    } catch (error) {
        handleError(error);
    }
}

export async function getAllEPortfoliosOfUserController(req: NextRequest,{params}:{params:Promise<{userId:string}>}) {
    try {
        const { userId } = await params;

        let eportfolios = await getAllEPortfoliosOfUser(userId)

        const session = await getServerSession(authOptions);

        eportfolios=await addLikedByUserToEPortfolios(eportfolios, session?.user?.id)

        return NextResponse.json(
            new ApiResponse(true, "All E-Portfolios of the user fetched successfully", "DONE", eportfolios, null), {
            status: 200
        }
        )

    } catch (error) {
        handleError(error)
    }
}

export async function likeSingleEPortfolioController(req: NextRequest, context: { params: Promise<{ epId: string }> }) {
    try {

        const { epId: receivedEpId } = await context.params;

        const parsed = prismaIdSchema.safeParse(receivedEpId);

        if (!parsed.success) {
            throw new ApiError(400, "Invalid E-Portfolio id provided", RESPONSE_CODES.INVALID, null)
        }

        const epId = parsed.data;

        const {id:userId} = await checkUserLoggedInOrThrow();

        const epExists = await getSingleEPortfolioWithId(epId);

        if (!epExists) {
            throw new ApiError(404, "Requested E-Portfolio does not exists", RESPONSE_CODES.NOT_FOUND, null)
        }

        const likeExists = await getLikeOfEportfolio(epId,userId!)

        if (likeExists) {
            return NextResponse.json(
                new ApiResponse(false, "This E-portfolio is already liked by you", RESPONSE_CODES.INVALID, null, null), {
                    status: 409
                }
            )
        }

        await createLikeForEPortfolio(epId,userId!);

        return NextResponse.json(
            new ApiResponse(true, "E-Portfolio liked successfully", RESPONSE_CODES.DONE, null, null), {
                status: 201
            }
        )

    } catch (error) {
        return handleError(error)
    }
}

export async function unlikeSingleEPortfolioController(req:NextRequest,context:{params:Promise<{epId:string}>}){
    try {
      const {epId:receivedEpId} = await context.params;

      const parsed= prismaIdSchema.safeParse(receivedEpId);

      if(!parsed.success){
         throw new ApiError(400,"Invalid E-Portfolio id provided",RESPONSE_CODES.INVALID,null);
      }
      
      const epId = parsed.data;

      const {id:userId} = await checkUserLoggedInOrThrow();

      const epExists=await getSingleEPortfolioWithId(epId);

      if(!epExists){
         throw new ApiError(404,"E-Portfolio does not exists anymore",RESPONSE_CODES.NOT_FOUND,null)
      }

      const likeExists = await getLikeOfEportfolio(epId,userId);

      if(!likeExists){
         throw new ApiError(409,"This E-portfolio is not liked by you",RESPONSE_CODES.INVALID,null)
      }

      const deletedLike = await deleteOneLikeOfEPortfolio(epId,userId)

      return NextResponse.json(
         new ApiResponse(true,"E-portfolio unliked successfully",RESPONSE_CODES.DONE,null,null),{
            status:200
         }
      )

   } catch (error) {
      return handleError(error)
   }
}
