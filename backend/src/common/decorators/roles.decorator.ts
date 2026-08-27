import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';

// Kullanımı: @Roles('contractor') ya da @Roles('contractor', 'craftsman')
// Bir controller/metodun üzerine SADECE belirtilen rollerin erişebileceğini işaretler.
// Hiç @Roles() yoksa, RolesGuard hiçbir kısıtlama uygulamaz (herkese açık kalır).
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
