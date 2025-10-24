import { useState } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';
import Link from 'next/link';
import type { FormEvent } from 'react';
import { useAuth } from '@/context/AuthContext';

export default function LoginPage() {
  const [loginStep, setLoginStep] = useState<'credentials' | 'otp'>('credentials');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();
  const { login } = useAuth();

  const handleSendOtp = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok) {
        setLoginStep('otp');
      } else {
        setError(data.message || 'Failed to send OTP.');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    }
  };

  const handleVerifyOtp = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      });
      const data = await res.json();
      if (res.ok) {
        login(data.user);
        router.push('/products');
      } else {
        setError(data.message || 'OTP verification failed.');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <Image src="/edesign_logo.png" alt="Edesign Logo" width={100} height={100} className="mx-auto" />
          <h1 className="mt-4 text-3xl font-bold tracking-tight text-gray-900">
            {loginStep === 'credentials' ? 'Login to Your Account' : 'Enter Verification Code'}
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            {loginStep === 'credentials' ? 'Welcome back to Edesign.' : 'A code was sent to your WhatsApp.'}
          </p>
        </div>

        <div className="rounded-lg bg-white p-8 shadow-lg">
          {loginStep === 'credentials' ? (
            <form className="space-y-6" onSubmit={handleSendOtp}>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email address</label>
                <input id="email" name="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 block w-full appearance-none rounded-md border border-gray-300 text-gray-500 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500" />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                <input id="password" name="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1 block w-full appearance-none rounded-md border border-gray-300 text-gray-500 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500" />
              </div>
              {error && <p className="text-sm text-red-600">{error}</p>}
              <div>
                <button type="submit" className="flex w-full justify-center rounded-md bg-indigo-600 px-4 py-2 text-white">Send Code</button>
              </div>
            </form>
          ) : (
            <form className="space-y-6" onSubmit={handleVerifyOtp}>
              <div>
                <label htmlFor="otp" className="block text-sm font-medium text-gray-700">OTP Code</label>
                <input id="otp" name="otp" type="text" required value={otp} onChange={(e) => setOtp(e.target.value)} className="mt-1 block w-full appearance-none rounded-md border border-gray-300 text-gray-500 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500" />
              </div>
              {error && <p className="text-sm text-red-600">{error}</p>}
              <div>
                <button type="submit" className="flex w-full justify-center rounded-md bg-indigo-600 px-4 py-2 text-white">Verify & Login</button>
              </div>
            </form>
          )}
        </div>

        <p className="text-center text-sm text-gray-600">
          Don&apos;t have an account yet?{' '}
          <Link href="/register" legacyBehavior><a className="font-medium text-indigo-600 hover:text-indigo-500">Register here</a></Link>
        </p>
      </div>
    </main>
  );
}