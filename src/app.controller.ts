import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Put,
} from '@nestjs/common';
import { z } from 'zod';
import { ZodValidationPipe } from './pipes/zod-validation-pipe';

function isValidCPF(cpf: string): boolean {
  cpf = cpf.replace(/[^\d]+/g, '');

  if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) return false;

  let sum = 0;
  for (let i = 0; i < 9; i++) sum += +cpf.charAt(i) * (10 - i);
  let rev = 11 - (sum % 11);
  if (rev === 10 || rev === 11) rev = 0;
  if (rev !== +cpf.charAt(9)) return false;

  sum = 0;
  for (let i = 0; i < 10; i++) sum += +cpf.charAt(i) * (11 - i);
  rev = 11 - (sum % 11);
  if (rev === 10 || rev === 11) rev = 0;
  return rev === +cpf.charAt(10);
}

let products: CreateProductBodySchema[] = [];

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

const updateStatusBodySchema = z.object({
  status: z.enum(['INATIVO', 'PENDENTE', 'ATIVO']),
});

const updateStatusValidationPipe = new ZodValidationPipe(
  updateStatusBodySchema,
);

type UpdateStatusBodySchema = z.infer<typeof updateStatusBodySchema>;

const updateProductBodySchema = z.object({
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

const updatebodyValidationPipe = new ZodValidationPipe(updateProductBodySchema);

type UpdateProductBodySchema = z.infer<typeof updateProductBodySchema>;

@Controller('/products')
export class AppController {
  constructor() {}

  @Get()
  @HttpCode(200)
  getAllProducts() {
    return products;
  }

  @Post()
  @HttpCode(201)
  create(@Body(bodyValidationPipe) body: CreateProductBodySchema) {
    products.push(body);
    return body;
  }

  @Delete(':id')
  @HttpCode(200)
  delete(@Param('id') id: string) {
    products = products.filter((product) => product.id !== id);
  }

  @Put(':id')
  updateProduct(
    @Param('id') idUrl: string,
    @Body(updatebodyValidationPipe) body: UpdateProductBodySchema,
  ) {
    const { id, brand, cpf, dateManufacture, email, model, name, year } = body;

    const listWithoutOldProduct = products.filter(
      (product) => product.id !== id,
    );

    const oldProduct = products.filter((product) => product.id === idUrl);

    const newProduct = oldProduct[0];

    newProduct.id = id;
    newProduct.brand = brand;
    newProduct.cpf = cpf;
    newProduct.dateManufacture = dateManufacture;
    newProduct.email = email; 
    newProduct.model = model;
    newProduct.name = name;
    newProduct.year = year;

    listWithoutOldProduct.push(newProduct);

    return newProduct;
  }

  @Patch(':id')
  @HttpCode(200)
  updateStatus(
    @Param('id') idUrl: string,
    @Body(updateStatusValidationPipe) body: UpdateStatusBodySchema,
  ) {
    const { status } = body;

    const productIndex = products.findIndex((product) => product.id === idUrl);

    products[productIndex].status = status;

    return products[productIndex];
  }
}