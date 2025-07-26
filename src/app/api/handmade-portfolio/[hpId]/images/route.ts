import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { RESPONSE_CODES } from "@/constants";
import { deleteImagesFromHandmadePortfolioController } from "@/controllers/handmadePortfolio.controller";
import ApiError from "@/lib/ApiError";
import checkUserLoggedInOrThrow from "@/lib/checkUserLoggedInOrThrow";
import prisma from "@/lib/prisma";
import { addImagesInHandmadePortfolio } from "@/schemas";
import { getSingleHandmadePortfolioWithId } from "@/services/handmadePortfolio.services";
import { getServerSession } from "next-auth";
import { NextRequest } from "next/server";


/**Add images to handmade-porfolio at an index
 * 1.retirve hpId from params
 * 2.retrive images[] from req.body 
 * 3.validate hpId and images
 * 4.check if user is logged in
 * 5.fetch the handmadeportfolio
 * 6.check is session.user.id === handmadeportfolio.ownerId
 * 7.update the handmade portfolio
 * 8.return res
 */

export async function PUT(req:NextRequest,{params}:{params:Promise<{hpId:string}>}){
   try{
      const {hpId:receivedHpId} = await params;
      const body=await req.json();

      body.hpId=receivedHpId;

      const parsed= addImagesInHandmadePortfolio.safeParse(body);

      if(!parsed.success){
         throw new ApiError(400,"Invalid dat provided",RESPONSE_CODES.INVALID,null,parsed.error.flatten())
      }

      const {hpId,images} = parsed.data;

      const session = await getServerSession(authOptions);

      const {id:userId} = await checkUserLoggedInOrThrow();

      const handmadePortfolio = await getSingleHandmadePortfolioWithId(hpId);

      if(!handmadePortfolio){
         throw new ApiError(404,"Hnadmade-portfolio not found",RESPONSE_CODES.NOT_FOUND,null);
      }

      if(handmadePortfolio.ownerId!==userId){
         throw new ApiError(401,"You dont have permission to upload images to this handmade-portfolio",RESPONSE_CODES.UNAUTHORIZED)
      }

   }catch(error){
      return handleError(error);
   }
}

/**Delete images of handmade-portfolios
 * 1.retrive index arr from body
 * 2.if array empty reject
 * 3.check session if not reject
 * 4.fetch the handmadeportfolio
 * 5.check if user owns this handmadePortfolio
 * 6.remove images links at given indexes
 * 7.update the handmadeportfolio
 * 8.return response
 */

export async function DELETE(req:NextRequest,{params}:{params:Promise<{hpId:string}>}){
   return deleteImagesFromHandmadePortfolioController(req,{params})
}