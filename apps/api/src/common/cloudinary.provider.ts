import { v2 as cloudinary } from 'cloudinary';
import { Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CLOUDINARY } from './constant';

export const CloudinaryProvider: Provider = {
    provide: CLOUDINARY,
    inject: [ConfigService],
    useFactory: (config: ConfigService) => {
        const cloudName = config.get('CLOUDINARY_CLOUD_NAME');
        const apiKey = config.get('CLOUDINARY_API_KEY');
        const apiSecret = config.get('CLOUDINARY_API_SECRET');

        console.log('[Cloudinary]', {
            cloudName,
            apiKeyExists: !!apiKey,
            apiSecretExists: !!apiSecret,
        });

        cloudinary.config({
            cloud_name: cloudName,
            api_key: apiKey,
            api_secret: apiSecret,
        });

        return cloudinary;
    },
};