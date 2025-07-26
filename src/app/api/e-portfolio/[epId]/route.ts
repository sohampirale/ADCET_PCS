import { NextRequest, NextResponse } from "next/server";
import { getSingleEPortfolioWithIdController } from "@/controllers/ePortfolio.controller";
import handleError from "@/lib/handleError";
import { updateEPortfolioDetails } from "@/schemas";
import ApiError from "@/lib/ApiError";
import { RESPONSE_CODES } from "@/constants";
import prisma from "@/lib/prisma";
import { getSingleEPortfolioWithId, updateDetailsOfEPortfolio } from "@/services/ePortfolio.services";
import checkUserLoggedInOrThrow from "@/lib/checkUserLoggedInOrThrow";
import ApiResponse from "@/lib/ApiResponse";

/**Get info of a E portfolio
 * 1.retriove the epId from params
 * 2.run validation as well as filter it if needed
 * 3.things we want in that e portfolio
 *  -title,link,ownerName,ownerId,mentorName,mentorId,no of likes,i liked it?,createdAt,updatedAt,
 * 4.if no e portfolio found with that id reject 404
 * 5.return e portfolio
 */

export async function GET(req:NextRequest,{params}:{params:Promise<{epId:string}>}){
   return getSingleEPortfolioWithIdController(req,{params});
}

/** Update info of a e-portfolio - link title 
 * 1.retrive the link and title from body
 * 2.validate link and title
 * 3.check if user logged in
 * 4.check if eportfolio exists
 * 5.check if user is the owner
 * 6.update the eportfolio
 */

export async function PUT(req:NextRequest,{params}:{params:Promise<{epId:string}>}){

   try {
      const {epId:receivedEpId} = await params;

      let body = await req.json();
      body.epId=receivedEpId;

      const parsed = updateEPortfolioDetails.safeParse(body);

      if(!parsed.success){
         throw new ApiError(400,"Invalid data format provided",RESPONSE_CODES.INVALID,parsed.error.flatten())
      }

      let {epId,title,link}=parsed.data;

      const {id:userId} = await checkUserLoggedInOrThrow();

      const eportfolio=await getSingleEPortfolioWithId(epId);

      if(!eportfolio){
         throw new ApiError(404,"E-Portfolio not found",RESPONSE_CODES.NOT_FOUND,null)
      }else if(eportfolio.ownerId!==userId){
         throw new ApiError(401,"You dont have persmission to update information of this E-Portfolio",RESPONSE_CODES.UNAUTHORIZED,null)
      }

      const updatedEPortfolio=await updateDetailsOfEPortfolio(epId,{title,link})

      return NextResponse.json(
         new ApiResponse(true,"E-Portfolio details updated successfully",RESPONSE_CODES.DONE,updatedEPortfolio)
      )

   } catch (error) {
      return handleError(error);
   }
}