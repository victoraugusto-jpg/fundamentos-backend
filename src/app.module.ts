import { Module } from '@nestjs/common';
import { CreateProductController } from './create-product.controller';

@Module({
  imports: [],
  controllers: [CreateProductController],
  providers: [],
})
export class AppModule {}
