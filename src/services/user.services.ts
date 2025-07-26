import prisma from "@/lib/prisma";

export async function checkIfUserExistsByUserId(userId:string){
    const user = await prisma.user.findUnique({
        where:{
            id:userId
        }
    })
    if(user)return true;
    else return false;    
}

export async function getAllMentors(){
    const mentors = await prisma.user.findMany({
        where:{
            role:'Mentor'
        },
        select:{
            id:true,
            name:true,
            username:true,
            image:true
        }
    })
    return mentors;
}

export async function checkUserExistsWithUsername(username:string){
    const user = await prisma.user.findUnique({
        where:{
            username
        },
        select:{
            id:true
        }
    })

    return user;
}

export async function checkUserExistsWithURN(URN:string){
    const user = await prisma.user.findUnique({
        where:{
            URN
        },
        select:{
            id:true
        }
    })
    
    return user;
}