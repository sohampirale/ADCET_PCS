import {signIn,signOut} from "next-auth/react"

export async function credentialsLogin(email:string,password:string){
    const res=await signIn("credentials",{
        email,password,redirect:true,
        callbackUrl:"/"
    })
    return res;
}

export async function googleLogin(){
    const res= signIn("google",{
        callbackUrl:"/"
    })
    return res;
}

export async function logout(){
    await signOut({
        callbackUrl:"/signin"
    })
}
