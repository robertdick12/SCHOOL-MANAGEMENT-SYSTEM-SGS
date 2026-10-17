<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class UserProvisioningService
{
    /**
     * Create a portal login for a newly-registered person and assign their
     * role. A random temporary password is generated when none is supplied
     * — this app has no email delivery configured, so the caller is
     * responsible for surfacing it once (see controller responses).
     */
    public function createForRole(string $name, string $email, string $role, ?string $password = null): array
    {
        $plainPassword = $password ?: Str::password(12);

        $user = User::create([
            'name' => $name,
            'email' => $email,
            'password' => Hash::make($plainPassword),
        ]);

        $user->assignRole($role);

        return ['user' => $user, 'temporary_password' => $password ? null : $plainPassword];
    }
}
