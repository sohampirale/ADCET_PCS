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
    pages: {
        signIn: "/signin"
    },
    providers:[
        Credentials({
            name:"Credentials",
            credentials:{
                identifier:{ label:"identifier",type:"text"},
                password:{ label:"Password",type:"password"}
            },
            async authorize(credentials){
                console.log('Inside authorize()');
                const identifier=credentials?.identifier;
                const password=credentials?.password

                if(!identifier || !password){
                    console.log('email/URN/username or password not provided');
                    return null
                }

                const user=await prisma.user.findFirst({
                    where:{
                        OR:[
                            {email:{equals:identifier,mode:'insensitive'}},
                            {username:{equals:identifier,mode:'insensitive'}},
                            {URN:{equals:identifier,mode:'insensitive'}}
                        ]
                    }
                })

                console.log('user found : ',user);
                
                if(!user){
                    console.log('user not found');
                    return null;
                } else if(!user.password){
                    console.log('Signup done via Google/Github, signup up again with those providers and set a passowrd in the "user" section');
                    return null;
                }

                const correctPassword=await bcrypt.compare(password,user.password)
                // const correctPassword=user.password===credentials.password
            
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
            async jwt({token,user,account}){
                
                if(account?.provider){
                    token.provider=account.provider;
                }
                
                if(user){
                    console.log('inside jwt user : ',user);
                    token.id=user.id;
                    token.username=user.username;
                    token.email=user.email;
                    token.mentorId=user.mentorId;
                    token.role=user.role;
                }
                return token;
            },
            async session({token,session}){

                if(session.user){
                    console.log('inside session() token : ',token);
                    session.user.provider=token.provider;
                    session.user.id=token.id;
                    session.user.username=token.username;
                    session.user.email=token.email;
                    session.user.name=token.name;
                    session.user.mentorId=token.mentorId;
                    session.user.role=token.role;
                }

                return session;
            }
    }
}

const handler = NextAuth(authOptions);

export {handler as GET, handler as POST}