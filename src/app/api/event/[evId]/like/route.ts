/**Like an Event
 * 1.fetch the session 
 * 2.check if the Event exists
 * 3.check if the like already exists
 * 4.Create the Like
 * 5.return
 */

export async function POST(req: NextRequest, context : { params: Promise<{ epId: string }> }) {
   return likeSingleEPortfolioController(req,context)
}

/**   Remove like of E-Portfolio
 * 0.validate epId
 * 1.fetch the user from session
 * 2.check if eportfolio exists
 * 3.check if like exists or not
 * 4.delete the like from db
 * 5.return
 */

export async function DELETE(req:NextRequest,context:{params:Promise<{epId:string}>}){
   return unlikeSingleEPortfolioController(req,context);
}