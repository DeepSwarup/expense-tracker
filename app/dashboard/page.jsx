export const dynamic = 'force-dynamic'; // Ensure server-side rendering

import { getServerSession } from 'next-auth';
import { authOptions } from '../api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import DashboardContent from '@/components/DashboardContent';

export default async function Dashboard() {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      // Redirect to the sign-in page if no session is found
      return redirect('/auth/signin');
    }

    // Pass the user's email to DashboardContent once session is verified
    return <DashboardContent email={session.user.email} />;
  } catch (error) {
    console.error("Error fetching session:", error);
    return <p>Failed to load dashboard. Please try again later.</p>;
  }
}
