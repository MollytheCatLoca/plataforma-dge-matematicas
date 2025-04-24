import NextAuth from 'next-auth';

export default NextAuth({
  // ...providers, etc...
  callbacks: {
    async jwt({ token, user }) {
      // Al iniciar, si user existe, agrega rol del usuario
      if (user) {
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      // Adjunta rol almacenado en el token a la sesión
      session.user.role = token.role;
      return session;
    }
  },
  // ...existing code...
});