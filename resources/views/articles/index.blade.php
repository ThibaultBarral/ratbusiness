<x-app-layout>
    <x-slot name="header">
        <h2 class="font-semibold text-xl text-gray-800 leading-tight">
            {{ __('Liste des articles') }}
        </h2>
    </x-slot>

    <div class="py-12">
        <div class="mx-auto sm:px-6 lg:px-8">
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

                    <!-- Affichage des informations mensuelles -->
                    <div>
                        <!-- Affichage des bénéfices mensuels pour les articles 'vendu' -->
                        <h2>Bénéfice Mensuel pour les Articles Vendus</h2>
                        <ul>
                            @forelse($beneficeMensuelVendu as $mois => $benefice)
                                <li>Bénéfice pour le mois {{ strftime('%B', mktime(0, 0, 0, $mois, 1)) }} : {{ $benefice }}</li>
                            @empty
                                <li>Aucun bénéfice disponible pour le moment.</li>
                            @endforelse
                        </ul>

                        <!-- Affichage des chiffres d'affaires mensuels pour les articles 'vendu' -->
                        <h2>Chiffre d'Affaires Mensuel pour les Articles Vendus</h2>
                        <ul>
                            @forelse($chiffreAffaireMensuelVendu as $mois => $chiffreAffaire)
                                <li>Chiffre d'affaires pour le mois {{ strftime('%B', mktime(0, 0, 0, $mois, 1)) }} : {{ $chiffreAffaire }}</li>
                            @empty
                                <li>Aucun chiffre d'affaires disponible pour le moment.</li>
                            @endforelse
                        </ul>
                    </div>

                    <!-- Affichage des informations annuelles -->
                    <div>
                        <!-- Affichage des bénéfices annuels pour les articles 'vendu' -->
                        <h2>Bénéfice Annuel pour les Articles Vendus</h2>
                        <ul>
                            @forelse($beneficeAnnuelVendu as $annee => $benefice)
                                <li>Bénéfice pour l'année {{ $annee }} : {{ $benefice }}</li>
                            @empty
                                <li>Aucun bénéfice annuel disponible pour le moment.</li>
                            @endforelse
                        </ul>

                        <!-- Affichage des chiffres d'affaires annuels pour les articles 'vendu' -->
                        <h2>Chiffre d'Affaires Annuel pour les Articles Vendus</h2>
                        <ul>
                            @forelse($chiffreAffaireAnnuelVendu as $annee => $chiffreAffaire)
                                <li>Chiffre d'affaires pour l'année {{ $annee }} : {{ $chiffreAffaire }}</li>
                            @empty
                                <li>Aucun chiffre d'affaires annuel disponible pour le moment.</li>
                            @endforelse
                        </ul>
                    </div>

                    <!-- Affichage de la liste des articles -->
                    <table class="table-auto text-start">
                        <thead>
                            <tr>
                                <th>Nom</th>
                                <th>Marque</th>
                                <th>Taille</th>
                                <th>Prix d'achat</th>
                                <th>Date d'achat</th>
                                <th>Date de vente</th>
                                <th>Prix de vente</th>
                                <th>Plateforme d'achat</th>
                                <th>Plateforme de vente</th>
                                <th>État</th>
                                <th>Bénéfice</th>
                                <th>Marge (%)</th>
                                <th>Temps de vente (jours)</th>
                            </tr>
                        </thead>
                        <tbody>
                            @foreach($articles as $article)
                                <tr>
                                    <td>{{ $article->nom }}</td>
                                    <td>{{ $article->marque }}</td>
                                    <td>{{ $article->taille }}</td>
                                    <td>{{ $article->prix_achat }}</td>
                                    <td>{{ $article->date_achat }}</td>
                                    <td>{{ $article->date_vente }}</td>
                                    <td>{{ $article->prix_vente }}</td>
                                    <td>{{ $article->plateforme_achat }}</td>
                                    <td>{{ $article->plateforme_vente }}</td>
                                    <td>{{ $article->etat }}</td>
                                    <td>{{ $article->benefice }}</td>
                                    <td>{{ $article->margePercentage }}</td>
                                    <td>{{ $article->tempsVente }}</td>
                                </tr>
                            @endforeach
                        </tbody>
                    </table>
                    <a href="{{ route('articles.export') }}" class="p-2 bg-green mt-3 text-white rounded-md">Exporter en Excel</a>
                </div>
            </div>
        </div>
    </div>
</x-app-layout>
