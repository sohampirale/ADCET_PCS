import { deleteImagesOwner, registerImagesOwner } from "@/controllers/image.controller";
import { NextRequest } from "next/server";

//Delete any image uploaded to cloudinary from frontedn with the public_id
/**
 * 1.check if user logged in
 * 2.validate array of public_id's from body
 * 3.check if imageOwner row exists for every obj of images
 * 4.if exists then delete it from cloudinary
 */
export async function DELETE(req:NextRequest){
   return deleteImagesOwner(req)
}

//register which image uploaded by whom
/**
 * 1.check if user logged in
 * 2.validation on secure_url and public_id sent
 * 3.check if there is already one ImageOwner row with same ownerId and public_id 
 * 4.create the ImageOwner row
 */

export async function POST(req:NextRequest){
    return registerImagesOwner(req)
}