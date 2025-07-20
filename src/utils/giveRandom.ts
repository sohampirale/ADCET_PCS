export default function giveRandom(arr:string[]){
    const length=arr.length;
    if(length==0)return null;
    const index=Math.floor(Math.random()*(length))
    return arr[index];
}