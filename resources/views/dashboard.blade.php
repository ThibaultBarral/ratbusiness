<x-app-layout>
    <x-slot name="header">
        <h2 class="font-semibold text-xl text-gray-800 leading-tight">
            {{ __('Dashboard') }}
        </h2>
    </x-slot>

    <div class="py-12">
        <div class=" mx-auto sm:px-6 lg:px-8">
            <div class="overflow-hidden shadow-sm sm:rounded-lg">
                <div class="p-6 text-gray-900">
                    <div>
                        <p>Bénéfice total : {{ $beneficeTotal }}</p>
                        <p>Chiffre d'affaires total : {{ $chiffreAffaireTotal }}</p>
                        <p>Bénéfice espéré : {{ $beneficeEspere }}</p>
                        <p>Bénéfice en attente : {{ $beneficeAttente }}</p>
                        <p>Marge moyenne totale : {{ $margeMoyenneTotale }}</p>
                        <p>Balance : {{ $balance }}</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</x-app-layout>