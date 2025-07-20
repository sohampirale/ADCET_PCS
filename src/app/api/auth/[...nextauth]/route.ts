import {PrismaAdapter} from "@auth/prisma-adapter"
import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import Google from "next-auth/providers/google"
import prisma from "@/lib/prisma"
import bcrypt from "bcrypt"

export const authOptions={
    adapter:PrismaAdapter(prisma),
    session:{
        strategy:"jwt"
    },
    secret:process.env.NEXTAUTH_SECRET,
    providers:[
        Credentials({
            name:"Credentials",
            credentials:{
                email:{ label:"Email",type:"text"},
                password:{ label:"Password",type:"password"}
            },
            async authorize(credentials){
                console.log('Inside authorize()');
                
                if(!credentials?.email || !credentials?.password){
                    console.log('email or password not provided');
                    return null
                }

                const user=await prisma.user.findUnique({
                    where:{
                        email:credentials.email
                    }
                })

                console.log('user found : ',user);
                
                if(!user){
                    console.log('user not found');
                    return null;
                } else if(!user.password){
                    console.log('User exists but password not found - OAuth signup done maybe');
                    return null;
                }

                // const correctPassword=await bcrypt.compare(credentials.password,user.password)
                const correctPassword=user.password===credentials.password
            
                if(!correctPassword){
                    console.log('Incorrect Password');
                    return null;
                }
                return user;
            }
        }),
        Google({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        })
    ],
    callbacks:{
        async jwt({token,user}){
            if(user){
                token.id=user.id;
                token.email=user.email;
                token.username=user.username || null
            }
            return token;
        },
        async session({token,session}){
            if(session.user){
                session.user.id=token.id;
                session.user.email=token.email;
                session.user.username = token.username;
            }
            return session;
        }
    }
}

const handler = NextAuth(authOptions);

export {handler as GET, handler as POST}