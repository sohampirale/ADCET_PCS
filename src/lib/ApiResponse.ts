interface IApiResponse{
    success:boolean,
    message:string,
    code?:string,
    data?:unknown,
    error?:unknown
}

class ApiResponse implements IApiResponse{
    success:boolean
    message:string
    code?:string
    data?:unknown
    error?:unknown

    constructor(success:boolean,message:string,code:string,data:unknown,error:unknown){
        this.success=success;
        this.message=message;
        this.code=code
        if(data){
            this.data=data;
        }

        if(error){
            this.error=error;
        }
    }
}

export default ApiResponse