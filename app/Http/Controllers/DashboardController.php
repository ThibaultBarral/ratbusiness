<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Auth;

class DashboardController extends Controller
{
    public function index()
    {
        $user = Auth::user();
        $articles = $user->articles;

        // Calculs globaux pour les articles 'vendu'
        $articlesVendus = $articles->where('etat', 'vendu');

        $beneficeTotal = $articlesVendus->sum('benefice');
        $chiffreAffaireTotal = $articlesVendus->sum('prix_vente');
        $margeMoyenneTotale = $articlesVendus->avg('margePercentage');

        // Autres calculs globaux pour tous les articles
        $beneficeEspere = $articles->where('etat', 'non_vendu')->sum('benefice');
        $beneficeAttente = $articles->where('etat', 'en_cours')->sum('benefice');
        $balance = $articles->whereIn('etat', ['en_cours', 'non_vendu'])->sum('prix_achat');

        return view('dashboard', [
            'beneficeTotal' => $beneficeTotal,
            'chiffreAffaireTotal' => $chiffreAffaireTotal,
            'beneficeEspere' => $beneficeEspere,
            'beneficeAttente' => $beneficeAttente,
            'margeMoyenneTotale' => $margeMoyenneTotale,
            'balance' => $balance,
        ]);
    }

  
}
