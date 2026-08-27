"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const throttler_1 = require("@nestjs/throttler");
const schedule_1 = require("@nestjs/schedule");
const auth_module_1 = require("./modules/auth/auth.module");
const projects_module_1 = require("./modules/projects/projects.module");
const units_module_1 = require("./modules/units/units.module");
const payments_module_1 = require("./modules/payments/payments.module");
const costs_module_1 = require("./modules/costs/costs.module");
const assets_module_1 = require("./modules/assets/assets.module");
const cashflow_module_1 = require("./modules/cashflow/cashflow.module");
const craftsmen_module_1 = require("./modules/craftsmen/craftsmen.module");
const messaging_module_1 = require("./modules/messaging/messaging.module");
const templates_module_1 = require("./modules/templates/templates.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({ isGlobal: true }),
            throttler_1.ThrottlerModule.forRoot([{ name: 'default', ttl: 60000, limit: 20 }]),
            schedule_1.ScheduleModule.forRoot(),
            typeorm_1.TypeOrmModule.forRootAsync({
                imports: [config_1.ConfigModule],
                inject: [config_1.ConfigService],
                useFactory: (config) => ({
                    type: 'postgres',
                    host: config.get('DB_HOST'),
                    port: config.get('DB_PORT'),
                    username: config.get('DB_USERNAME'),
                    password: config.get('DB_PASSWORD'),
                    database: config.get('DB_NAME'),
                    entities: [__dirname + '/modules/**/entities/*.entity{.ts,.js}'],
                    synchronize: false,
                }),
            }),
            auth_module_1.AuthModule,
            projects_module_1.ProjectsModule,
            units_module_1.UnitsModule,
            payments_module_1.PaymentsModule,
            costs_module_1.CostsModule,
            assets_module_1.AssetsModule,
            cashflow_module_1.CashflowModule,
            craftsmen_module_1.CraftsmenModule,
            messaging_module_1.MessagingModule,
            templates_module_1.TemplatesModule,
        ],
        providers: [
            { provide: core_1.APP_GUARD, useClass: throttler_1.ThrottlerGuard },
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map