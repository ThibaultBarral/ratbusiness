<?php


namespace App\Models;
use App\Models\User;


use Illuminate\Database\Eloquent\Model;

class Article extends Model
{
    protected $fillable = [
        'nom', 'marque', 'taille', 'prix_achat', 'date_achat', 'date_vente',
        'prix_vente', 'plateforme_achat', 'plateforme_vente', 'etat'
    ];

    // Accesseur pour le bénéfice
    public function getBeneficeAttribute()
    {
        return $this->prix_vente - $this->prix_achat;
    }

    // Accesseur pour la marge en pourcentage
    public function getMargePercentageAttribute()
    {
        if ($this->prix_achat > 0) {
            // Convertir le résultat en entier
            return (int)(($this->benefice / $this->prix_achat) * 100);
        } else {
            return 0;
        }
    }

    // Accesseur pour le temps de vente
    public function getTempsVenteAttribute()
    {
        if ($this->date_vente) {
            $dateAchat = new \DateTime($this->date_achat);
            $dateVente = new \DateTime($this->date_vente);
            $interval = $dateAchat->diff($dateVente);
            return $interval->days;
        } else {
            return 0;
        }
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // D'autres accesseurs selon vos besoins
}
