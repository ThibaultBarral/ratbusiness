<?php

namespace App\Http\Controllers;

use App\Models\Article;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth; 

class ArticleController extends Controller
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

        // Calculs par mois pour les articles 'vendu'
        $beneficeMensuelVendu = $articles->where('etat', 'vendu')->groupBy(function ($date) {
            return \Carbon\Carbon::parse($date->date_vente)->format('m');
        })->map(function ($month) {
            return $month->sum('benefice');
        });

        $chiffreAffaireMensuelVendu = $articles->where('etat', 'vendu')->groupBy(function ($date) {
            return \Carbon\Carbon::parse($date->date_vente)->format('m');
        })->map(function ($month) {
            return $month->sum('prix_vente');
        });

        return view('articles.index', [
            'articles' => $articles,
            'beneficeTotal' => $beneficeTotal,
            'chiffreAffaireTotal' => $chiffreAffaireTotal,
            'beneficeEspere' => $beneficeEspere,
            'beneficeAttente' => $beneficeAttente,
            'margeMoyenneTotale' => $margeMoyenneTotale,
            'balance' => $balance,
            'beneficeMensuelVendu' => $beneficeMensuelVendu,
            'chiffreAffaireMensuelVendu' => $chiffreAffaireMensuelVendu,
        ]);
    }

    public function create()
    {
        return view('articles.create');
    }

    public function store(Request $request)
    {
        // Validation des données du formulaire, etc.

        $article = new Article($request->all());
        $article->user_id = Auth::id(); // Associez l'utilisateur actuellement authentifié
        $article->save();

        return redirect()->route('articles.index')->with('success', 'Article créé avec succès!');
    }

    public function edit(Article $article)
    {
        // Vous pouvez également ajouter une politique d'accès pour s'assurer que l'utilisateur a le droit de modifier cet article

        return view('articles.edit', compact('article'));
    }

    public function update(Request $request, Article $article)
    {
        // Validation des données du formulaire, etc.

        $article->update($request->all());

        return redirect()->route('articles.index')->with('success', 'Article mis à jour avec succès!');
    }

    public function destroy(Article $article)
    {
        // Vous pouvez également ajouter une politique d'accès pour s'assurer que l'utilisateur a le droit de supprimer cet article

        $article->delete();

        return redirect()->route('articles.index')->with('success', 'Article supprimé avec succès!');
    }
}