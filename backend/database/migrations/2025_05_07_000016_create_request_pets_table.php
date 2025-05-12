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
        Schema::create('request_pets', function (Blueprint $table) {
            $table->unsignedBigInteger('request_id');
            $table->unsignedBigInteger('pet_id');
            $table->primary(['request_id','pet_id']);
            $table->foreign('request_id')->references('id')->on('requests')->onDelete('cascade');
            $table->foreign('pet_id')->references('id')->on('pets')->onDelete('cascade');
            
            $table->index('pet_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('request_pets');
    }
};
