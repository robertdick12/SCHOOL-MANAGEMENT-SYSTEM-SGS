<?php

namespace App\Models\Concerns;

use App\Models\AuditLog;
use Illuminate\Support\Facades\Auth;

/**
 * Writes an immutable AuditLog row on every create/update/delete so financial
 * and result changes stay traceable instead of being silently overwritten.
 */
trait LogsAudits
{
    public static function bootLogsAudits(): void
    {
        static::created(function ($model) {
            $model->writeAuditLog('created', [], $model->getAttributes());
        });

        static::updated(function ($model) {
            $changes = $model->getChanges();
            unset($changes['updated_at']);
            if ($changes === []) {
                return;
            }
            $model->writeAuditLog('updated', $model->originalOnly(array_keys($changes)), $changes);
        });

        static::deleted(function ($model) {
            $model->writeAuditLog('deleted', $model->getAttributes(), []);
        });
    }

    protected function originalOnly(array $keys): array
    {
        return array_intersect_key($this->getOriginal(), array_flip($keys));
    }

    protected function writeAuditLog(string $action, array $oldValues, array $newValues): void
    {
        AuditLog::query()->create([
            'user_id' => Auth::id(),
            'action' => $action,
            'auditable_type' => static::class,
            'auditable_id' => $this->getKey(),
            'old_values' => $oldValues ?: null,
            'new_values' => $newValues ?: null,
            'ip_address' => request()?->ip(),
        ]);
    }
}
