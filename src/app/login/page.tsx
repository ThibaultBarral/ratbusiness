"use client";

import { login } from './action';
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function LoginPage() {
    const searchParams = useSearchParams();
    const signupSuccess = searchParams.get("signupSuccess");
    const [showMessage, setShowMessage] = useState(false);

    useEffect(() => {
        if (signupSuccess === "1") {
            setShowMessage(true);
        }
    }, [signupSuccess]);

    const router = useRouter();

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
            <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md">
                <h2 className="text-2xl font-bold text-center mb-6">Bienvenue sur Ratbusiness</h2>
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
                            S'inscrire
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}