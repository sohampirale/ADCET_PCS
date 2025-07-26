import "next-auth"
import { DefaultSession } from "next-auth";
import { JWT as DefaultJWT } from "next-auth/jwt";

declare module "next-auth"{
    interface User{
        id?:string;
        URN?:string;
        username?:string;
        email:string;
        password?:string;
        role?:string;
        gender?:string;

        image?:string;
        name?:string;
    }

    interface Session{
        user:{
            id?:string;
            URN?:string;
            username?:string;
            email:string;
            password?:string;
            role?:string;
            gender?:string;
            mentorId?:string;

            image?:string;
            name?:string;
        } & DefaultSession["user"]
    }
}

declare module "next-auth/jwt"{
    interface JWT extends DefaultJWT{
        id?:string;
        URN?:string;
        username?:string;
        email:string;
        password?:string;
        role?:string;
        gender?:string;

        image?:string;
        name?:string;
    }
}