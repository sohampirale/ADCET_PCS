import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getServerSession } from "next-auth";
import ApiError from "./ApiError";
import { RESPONSE_CODES } from "@/constants";

export default async function checkUserLoggedInOrThrow(){
    const session = await getServerSession(authOptions);
    if(!session || !session.user || !session.user.id){
        throw new ApiError(400,"User not logged in",RESPONSE_CODES.NOT_LOGGED_IN,null);
    }

    return session.user;
}