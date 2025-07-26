import { getAllUserSuggestionsController } from "@/controllers/user.controller";
import { NextRequest } from "next/server";

//Get all users recommendations for frontend purpose

export async function GET(req:NextRequest){
   return getAllUserSuggestionsController(req);
}