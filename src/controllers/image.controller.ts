import { RESPONSE_CODES } from "@/constants";
import ApiError from "@/lib/ApiError";
import ApiResponse from "@/lib/ApiResponse";
import checkUserLoggedInOrThrow from "@/lib/checkUserLoggedInOrThrow";
import handleError from "@/lib/handleError";
import { deleteImagesFromCloudinarySchema, registerUploadedImagesSchema } from "@/schemas";
import { createImageOwner, deleteSingleImageOwner, getSingleImageOwner } from "@/services/image.services";
import { NextRequest, NextResponse } from "next/server";

export async function registerImagesOwner(req:NextRequest){
    try {
        const {id:ownerId} = await checkUserLoggedInOrThrow()

        const data = await req.json();

        const parsed = registerUploadedImagesSchema.safeParse(data);

        if(!parsed.success){
            throw new ApiError(400,"Invalid format of secure_url or public_id of images",RESPONSE_CODES.INVALID,parsed.error.flatten())
        }

        const {images}=parsed.data;

        for(let i=0;i<images.length;i++){
            try {
                const existingImageOnwer=await getSingleImageOwner(images[i],ownerId!)
                
                if(!existingImageOnwer){
                    await createImageOwner(images[i],ownerId!);
                }

            } catch (error) {}
        }

        return NextResponse.json(
             new ApiResponse(true,"All images registered successfully")
        )

    } catch (error) {
        return handleError(error)
    }
}

export async function deleteImagesOwner(req:NextRequest){
 try {
        const data = await req.json();

        const parsed=deleteImagesFromCloudinarySchema.safeParse(data)

        if(!parsed.success){
            throw new ApiError(400,"Invalid format of public_ids provided",RESPONSE_CODES.INVALID,parsed.error.flatten())
        }

        const {images} = parsed.data;

        const {id:userId} = await checkUserLoggedInOrThrow();

        for(let i=0;i<images.length;i++){
            const existingImageOwner = await getSingleImageOwner(images[i],userId!);
            if(existingImageOwner){
                await deleteSingleImageOwner(images[i],userId);
            }
        }
        
        return NextResponse.json(
            new ApiResponse(true,"Images deleted successfully",RESPONSE_CODES.DONE)
        )
    } catch (error) {
        return handleError(error)
    }
}