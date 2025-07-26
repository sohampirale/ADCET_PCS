import { NextRequest } from "next/server";
import { singupController } from "@/controllers/user.controller";


/**Signup for both user and mentor
 * 1.retrive email,username,password,role,name,URN
 * 2.fetch a user with or for (email,username) if found then people with those email or username already exists
 * 3.create a user with those fields
 * 4.if not create reject
 * 5.returb successfull response
 */

export async function POST(req: NextRequest) {
   return singupController(req);
}
