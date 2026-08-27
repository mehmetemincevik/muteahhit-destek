import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';

// Bir controller veya metoda erişebilecek rolleri işaretler: @Roles('contractor').
// İşaretlenmemiş uçlarda RolesGuard kısıtlama uygulamaz; rol kontrolü gereken her
// uca açıkça eklenmelidir.
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
