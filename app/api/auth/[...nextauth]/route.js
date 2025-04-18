import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { getDb } from '@/lib/mongodb';
import bcrypt from 'bcryptjs';

export const authOptions = {
    providers: [
        CredentialsProvider({
            name: 'Credentials',
            credentials: {
                email: {label: 'Email', type: 'email'},
                password: {label: 'password', type: 'password'}
            },

            async authorize(credentials){
                const db = await getDb()
                const user = await db.collection('users').findOne({email: credentials.email})

                if (user && bcrypt.compareSync(credentials.password, user.password)){
                    return {id: user._id.toString(), email: user.email}
                }
                return null
            }
        })
    ],
    pages: {
        signIn: '/auth/signin',
        signUp: '/auth/signup',
    },
    session: {
        strategy: 'jwt',
    },

    callbacks:{
        async jwt({token, user}){
            if (user){
                token.id = user.id
            }

            console.log('jwt callback', token)
            return token
        },

        async session({session, token}){
            if(token.id){
                session.user.id = token.id
            }
            console.log('session callback', session)
            return session
        }
    },
    secret: process.env.NEXTAUTH_SECRET,
}

const handler = NextAuth(authOptions)
export {handler as GET, handler as POST}