import { getServerSession } from 'next-auth';
import { authOptions } from './api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function Home() {
  const session = await getServerSession(authOptions);

  if (session) {
    redirect('/dashboard'); // Redirect authenticated users to dashboard
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white via-gray-100 to-gray-200 p-6">
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-xl p-8 md:p-12 text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-800 mb-6 leading-tight">
          Welcome to <span className="text-blue-600">Expense Tracker</span>
        </h1>
        <p className="text-base md:text-lg text-gray-600 mb-10">
          Take control of your finances with our simple and intuitive expense tracking app. Log expenses, view summaries, and export your data with ease.
        </p>
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
          <Link href="/auth/signin">
            <button className="w-full sm:w-auto bg-blue-600 text-white px-6 py-3 rounded-xl text-base font-semibold shadow hover:bg-blue-700 transition-all duration-200">
              Sign In
            </button>
          </Link>
          <Link href="/auth/signup">
            <button className="w-full sm:w-auto bg-green-600 text-white px-6 py-3 rounded-xl text-base font-semibold shadow hover:bg-green-700 transition-all duration-200">
              Sign Up
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
