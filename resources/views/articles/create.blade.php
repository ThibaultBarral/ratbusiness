<x-app-layout>
    <x-slot name="header">
        <h2 class="font-semibold text-xl text-gray-800 leading-tight">
            {{ __('Créer un nouvel article') }}
        </h2>
    </x-slot>

    <div class="py-12">
        <div class="max-w-7xl mx-auto sm:px-6 lg:px-8">
            <div class="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                <div class="p-6 text-gray-900">
                    <!-- Formulaire de création d'article -->
                    <form method="post" action="{{ route('articles.store') }}">
                        @csrf

                        <div>
                            <!-- Ajoutez ici les champs du formulaire pour l'article, par exemple : -->
                            <div class="mb-4">
                                <label for="nom" class="text-sm font-medium text-gray-600">Nom :</label>
                                <input type="text" name="nom" id="nom" class="mt-1 p-2 border rounded-md w-full" required>
                            </div>

                            <div class="mb-4">
                                <label for="marque" class="text-sm font-medium text-gray-600">Marque :</label>
                                <input type="text" name="marque" id="marque" class="mt-1 p-2 border rounded-md w-full" required>
                            </div>

                            <!-- Ajoutez d'autres champs selon vos besoins -->

                            <button type="submit" class="p-2 bg-green-600 text-white rounded-md">Créer l'article</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>
</x-app-layout>
