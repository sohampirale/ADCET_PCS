import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { getServerSession } from "next-auth"

export default async function MyData(){
    const session = await getServerSession(authOptions);
    console.log('session : ',session);
    
    return (
        <>
            <p>My Data</p>
            {session && JSON.stringify(session)}
        </>
    )
}