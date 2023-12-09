<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('articles', function (Blueprint $table) {
            $table->id();
            $table->string('nom');
            $table->string('marque');
            $table->string('taille');
            $table->decimal('prix_achat', 10, 2);
            $table->date('date_achat');
            $table->date('date_vente')->nullable();
            $table->decimal('prix_vente', 10, 2)->nullable();
            $table->string('plateforme_achat');
            $table->string('plateforme_vente')->nullable();
            $table->enum('etat', ['vendu', 'en_cours', 'non_vendu']);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('articles');
    }
};
