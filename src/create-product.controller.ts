import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { z } from 'zod';
import { ZodValidationPipe } from './pipes/zod-validation-pipe';
import { isValidCPF } from './utils/is-valid-cpf';

const createProductBodySchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  model: z.string().min(1),
  dateManufacture: z.string().date(),
  year: z.number(),
  brand: z.string().min(1),
  email: z.string().email(),
  cpf: z
    .string()
    .regex(/^\d{11}$/, {
      message: 'CPF deve conter exatamente 11 dígitos numéricos.',
    })
    .refine(isValidCPF, {
      message: 'CPF Invalid',
    }),
  status: z.enum(['INATIVO', 'PENDENTE', 'ATIVO']),
});

const bodyValidationPipe = new ZodValidationPipe(createProductBodySchema);

type CreateProductBodySchema = z.infer<typeof createProductBodySchema>;

@Controller('/products')
export class CreateProductController {
  constructor() {}

  @Post()
  @HttpCode(201)
  async handle(@Body(bodyValidationPipe) body: CreateProductBodySchema) {}
}