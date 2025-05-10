<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('messages', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('chat_id');
            $table->unsignedBigInteger('sender_id');
            $table->text('content');
            $table->boolean('read_flag')->default(false);
            $table->timestamp('sent_at')->useCurrent();
            $table->foreign('chat_id')->references('id')->on('chats')->onDelete('cascade');
            $table->foreign('sender_id')->references('id')->on('users')->onDelete('cascade');
            // Laravel no soporta particionado HASH nativo en migrations; puedes hacerlo manual con DB::statement()
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('messages');
    }
};
