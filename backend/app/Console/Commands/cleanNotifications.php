<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Request as RequestModel;
use Carbon\Carbon;

class CleanupOldRequests extends Command
{
    protected $signature = 'requests:cleanup-old';
    protected $description = 'Elimina solicitudes no aceptadas con más de 7 días de antigüedad';

    public function handle()
    {
        $count = RequestModel::where('status', '!=', 'accepted')
            ->where('created_at', '<', Carbon::now()->subDays(7))
            ->delete();

        $this->info("Eliminadas $count solicitudes antiguas no aceptadas.");
    }
}