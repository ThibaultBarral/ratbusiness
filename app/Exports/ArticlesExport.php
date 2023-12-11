<?php

namespace App\Exports;

use App\Models\Article;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;

class ArticlesExport implements FromCollection, WithHeadings
{
    public function collection()
    {
        // Récupérer les articles de l'utilisateur actuel
        $user = auth()->user();
        return $user->articles->map(function ($article) {
            // Exclure les colonnes 'id' et 'user_id' de chaque article
            return $article->makeHidden(['id', 'user_id']);
        });
    }

    // Fonction pour définir les en-têtes de colonnes
    public function headings(): array
    {
        // Définir les en-têtes sans les colonnes 'id' et 'user_id'
        return array_diff([
            'Nom',
            'Marque',
            'Taille',
            'Prix d\'achat',
            'Date d\'achat',
            'Date de vente',
            'Prix de vente',
            'Plateforme d\'achat',
            'Plateforme de vente',
            'État',
            'Bénéfice',
            'Marge (%)',
            'Temps de vente (jours)',
            // Ajoutez d'autres en-têtes selon vos besoins
        ], ['id', 'user_id']);
    }
}
