import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { redirect } from "next/dist/server/api-utils";

export default async function Dashboard(){

    const session = await getServerSession(authOptions)

    if(!session){
        redirect('/auth/signin')
    }

    return (
        <div className="container mx-auto p-4">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p>Welcome, {session.user.email}!</p>
          <form action="/api/auth/signout" method="POST">
            <button type="submit" className="mt-4 bg-red-500 text-white p-2 rounded">
              Sign Out
            </button>
          </form>
        </div>
      );

}
