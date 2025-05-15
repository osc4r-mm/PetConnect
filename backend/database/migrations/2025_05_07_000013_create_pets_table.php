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
        Schema::create('pets', function (Blueprint $table) {
            $table->id();
            $table->string('name',100);
            $table->integer('age')->unsigned();
            $table->unsignedBigInteger('gender_id');
            $table->decimal('weight',5,1)->unsigned();
            $table->text('description')->nullable();
            $table->string('profile_path',255)->nullable();
            $table->boolean('for_adoption')->default(false);
            $table->boolean('for_sitting')->default(true);
            $table->unsignedBigInteger('species_id');
            $table->unsignedBigInteger('breed_id')->nullable();
            $table->unsignedBigInteger('size_id')->nullable();
            $table->unsignedBigInteger('activity_level_id')->nullable();
            $table->unsignedBigInteger('noise_level_id')->nullable();
            $table->unsignedBigInteger('user_id');
            $table->timestamp('registered_at')->useCurrent();
            $table->timestamps();
            
            $table->foreign('gender_id')->references('id')->on('genders')->onDelete('restrict');
            $table->foreign('species_id')->references('id')->on('species')->onDelete('restrict');
            $table->foreign('breed_id')->references('id')->on('breeds')->onDelete('set null');
            $table->foreign('size_id')->references('id')->on('sizes')->onDelete('set null');
            $table->foreign('activity_level_id')->references('id')->on('activity_levels')->onDelete('set null');
            $table->foreign('noise_level_id')->references('id')->on('noise_levels')->onDelete('set null');
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            
            $table->index('for_adoption');
            $table->index('for_sitting');
            $table->index('species_id');
            $table->index('breed_id');
            $table->index('size_id');
            $table->index('activity_level_id');
            $table->index('noise_level_id');
            $table->index('user_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pets');
    }
};