import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CloudinaryProvider } from './cloudinary.provider'; // Adjust path if needed

@Global() // This makes the module available everywhere without re-importing
@Module({
  imports: [ConfigModule],
  providers: [CloudinaryProvider],
  exports: [CloudinaryProvider],
})
export class CommonModule {}