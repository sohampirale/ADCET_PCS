import Signin from "@/components/Signin/page";

export default function signinPage(){
  return (
    <Signin/>
  )
}

// 'use client'

// import { googleLogin, credentialsLogin } from "@/lib/login"
// import { useState } from "react"
// import { useRouter } from "next/navigation"

// export default function SigninPage() {
//   const [email, setEmail] = useState("")
//   const [password, setPassword] = useState("")
//   const [error, setError] = useState("")

//   const router = useRouter();

//   async function handleSubmit(e: React.FormEvent) {
//     e.preventDefault()
//     setError("")
//     try {
//       const res = await credentialsLogin(email, password)
//       console.log('res : ',res);
//       if(res.ok){
//         setTimeout(()=>{
//           router.push("/")
//         },5000)
//       }
//     } catch (error) {
//       console.log('signin error: ',error);
      
//       setError("Invalid email or password")
//     }

//   }

//   return (
//     <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-6">
//       <h1 className="text-2xl font-semibold">Sign In</h1>

//       <form onSubmit={handleSubmit} className="w-full max-w-sm flex flex-col gap-3">
//         <input
//           type="email"
//           placeholder="Email"
//           className="border p-2 rounded"
//           value={email}
//           onChange={e => setEmail(e.target.value)}
//           required
//         />
//         <input
//           type="password"
//           placeholder="Password"
//           className="border p-2 rounded"
//           value={password}
//           onChange={e => setPassword(e.target.value)}
//           required
//         />
//         {error && <p className="text-red-500 text-sm">{error}</p>}

//         <button type="submit" className="bg-black text-white py-2 rounded">
//           Login
//         </button>
//       </form>

//       <hr className="w-full max-w-sm my-4" />

//       <button
//         onClick={googleLogin}
//         className="bg-blue-500 text-white px-4 py-2 rounded"
//       >
//         Sign in with Google
//       </button>
//     </div>
//   )
// }
