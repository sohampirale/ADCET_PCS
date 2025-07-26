import prisma from "@/lib/prisma";

export async function getSingleImageOwner(public_id:string,ownerId:string){
    const imageOnwer = await prisma.imageOwner.findUnique({
        where:{
            ownerId_public_id:{
                public_id,
                ownerId
            }
        }
    })
    
    return imageOnwer
}

export async function createImageOwner(public_id:string,ownerId:string,){
    const imageOwner = await prisma.imageOwner.create({
        data:{
            ownerId,
            public_id
        }
    })
    return imageOwner;
}

export async function deleteSingleImageOwner(public_id:string,ownerId:string){
    const deletedImageOwner = await prisma.imageOwner.delete({
        where:{
            ownerId_public_id:{
                public_id,
                ownerId
            }
        }
    })
    return deletedImageOwner;
}