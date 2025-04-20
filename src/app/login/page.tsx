// src/app/login/page.tsx
import LoginForm from '@/components/LoginForm'; 

export default function LoginPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="p-8 bg-white rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-semibold text-center text-gray-800 mb-6">
          Iniciar Sesión
        </h2>
        <LoginForm />
      </div>
    </div>
  );
}