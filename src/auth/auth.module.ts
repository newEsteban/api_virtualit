import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwt.strategy';
import { TokenBlacklistService } from './services/token-blacklist.service';
import { User } from '../user/entities/user.entity';
import { UserModule } from '../user/user.module';

/**
 * Módulo de autenticación
 * 
 * Configura JWT, Passport y todas las dependencias necesarias
 * para el sistema de autenticación y autorización.
 */
@Module({
    imports: [
        // Importar entidades necesarias
        TypeOrmModule.forFeature([User]),
        
        // Configurar Passport
        PassportModule.register({ 
            defaultStrategy: 'jwt',
            session: false,
        }),
        
        // Configurar JWT
        JwtModule.registerAsync({
            imports: [ConfigModule],
            useFactory: async (configService: ConfigService) => ({
                secret: configService.get<string>('JWT_SECRET') || 'default-secret-key',
                signOptions: {
                    expiresIn: configService.get<string>('JWT_EXPIRES_IN') || '1h',
                    issuer: 'virtualit-api',
                    audience: 'virtualit-client',
                },
            }),
            inject: [ConfigService],
        }),
        
        // Importar módulo de usuarios
        UserModule,
    ],
    controllers: [AuthController],
    providers: [
        AuthService,
        JwtStrategy,
        TokenBlacklistService,
    ],
    exports: [
        AuthService,
        JwtStrategy,
        PassportModule,
        JwtModule,
    ],
})
export class AuthModule {}
