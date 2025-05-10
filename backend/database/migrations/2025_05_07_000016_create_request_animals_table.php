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
        Schema::create('request_animals', function (Blueprint $table) {
            $table->unsignedBigInteger('request_id');
            $table->unsignedBigInteger('animal_id');
            $table->primary(['request_id','animal_id']);
            $table->foreign('request_id')->references('id')->on('requests')->onDelete('cascade');
            $table->foreign('animal_id')->references('id')->on('animals')->onDelete('cascade');
            
            $table->index('animal_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('request_animals');
    }
};
