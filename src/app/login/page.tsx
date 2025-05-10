"use client";

import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function LoginForm() {
    const searchParams = useSearchParams();
    const signupSuccess = searchParams.get("signupSuccess");
    const [showMessage, setShowMessage] = useState(false);
    const router = useRouter();

    useEffect(() => {
        if (signupSuccess === "1") {
            setShowMessage(true);
        }
    }, [signupSuccess]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
            <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold">Bienvenue sur Ratbusiness</h2>
                    <button
                        onClick={() => router.push("/")}
                        className="text-gray-600 hover:text-primary transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                        </svg>
                    </button>
                </div>
                {showMessage && (
                    <div className="mb-4 text-green-600 bg-green-100 p-3 rounded text-center text-sm">
                        Un email de confirmation a été envoyé. Merci de vérifier votre boîte mail pour activer votre compte avant de vous connecter.
                    </div>
                )}
                <form className="space-y-4">
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                            Email
                        </label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            required
                            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm"
                        />
                    </div>
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                            Mot de passe
                        </label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            required
                            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm"
                        />
                    </div>
                    <div className="flex justify-between space-x-2">
                        <button
                            type="submit"
                            formAction={login}
                            className="w-1/2 py-2 px-4 bg-primary text-white font-semibold rounded-md hover:bg-primary-dark transition"
                        >
                            Se connecter
                        </button>
                        <button
                            type="button"
                            onClick={() => router.push("/signup")}
                            className="w-1/2 py-2 px-4 bg-gray-200 text-gray-800 font-semibold rounded-md hover:bg-gray-300 transition"
                        >
                            S&apos;inscrire
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

import { login } from './action';

export default function LoginPage() {
    return (
        <Suspense fallback={<div>Chargement...</div>}>
            <LoginForm />
        </Suspense>
    );
}