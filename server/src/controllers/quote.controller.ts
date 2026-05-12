import { Request, Response } from 'express';
import { z } from 'zod';
import prisma from '../utils/prisma';

const PREMIUM_BRANDS = ['Pirelli', 'Goodyear', 'Continental', 'Bridgestone', 'Michelin', 'Dunlop'];

function classifyBrand(brand: string): string {
  const upper = brand.toUpperCase();
  for (const pb of PREMIUM_BRANDS) {
    if (upper.includes(pb.toUpperCase())) return 'premium';
  }
  return 'economy';
}

function countServices(services: string): number {
  if (!services || services === 'Não incluso' || services === 'Não informado') return 0;
  const keywords = ['montagem', 'balanceamento', 'geometria', 'alinhamento', 'válvulas'];
  return keywords.filter(k => services.toLowerCase().includes(k)).length;
}

async function calculateScore(data: {
  unitPrice: number | null;
  totalPrice: number | null;
  services: string;
  payment: string;
  brand: string;
}): Promise<number> {
  let score = 50;

  const allQuotes = await prisma.tireQuote.findMany({ select: { unitPrice: true, totalPrice: true } });
  const allPrices = allQuotes
    .map(q => q.unitPrice ?? (q.totalPrice ? q.totalPrice / 2 : null))
    .filter((p): p is number => p !== null);

  const price = data.unitPrice ?? (data.totalPrice ? data.totalPrice / 2 : null);
  if (price !== null && allPrices.length > 0) {
    const min = Math.min(...allPrices);
    const max = Math.max(...allPrices);
    const range = max - min || 1;
    score += ((max - price) / range) * 30;
  }

  score += countServices(data.services) * 5;

  const payment = data.payment.toLowerCase();
  if (payment.includes('x') || payment.includes('parcela')) score += 8;

  const category = classifyBrand(data.brand);
  if (category === 'premium') score += 7;

  return Math.min(100, Math.max(0, Math.round(score)));
}

const quoteSchema = z.object({
  company: z.string().min(1),
  brand: z.string().min(1),
  model: z.string().optional(),
  unitPrice: z.number().positive().optional().nullable(),
  totalPrice: z.number().positive().optional().nullable(),
  paymentConditions: z.string().optional(),
  includedServices: z.string().optional(),
  observations: z.string().optional(),
});

export async function getQuotes(req: Request, res: Response) {
  try {
    const {
      search, company, category, minPrice, maxPrice, hasInstallment,
      hasServices, sortBy = 'createdAt', sortOrder = 'desc',
      page = '1', limit = '20'
    } = req.query as Record<string, string>;

    const where: any = {};

    if (search) {
      where.OR = [
        { brand: { contains: search, mode: 'insensitive' } },
        { company: { contains: search, mode: 'insensitive' } },
        { model: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (company) where.company = { contains: company, mode: 'insensitive' };
    if (category) where.category = category;

    if (minPrice || maxPrice) {
      where.unitPrice = {};
      if (minPrice) where.unitPrice.gte = parseFloat(minPrice);
      if (maxPrice) where.unitPrice.lte = parseFloat(maxPrice);
    }

    if (hasInstallment === 'true') {
      where.paymentConditions = { contains: 'x', mode: 'insensitive' };
    }

    if (hasServices === 'true') {
      where.NOT = [
        { includedServices: { contains: 'Não incluso' } },
        { includedServices: { contains: 'Não informado' } },
      ];
    }

    const validSortFields = ['unitPrice', 'totalPrice', 'score', 'createdAt', 'company', 'brand'];
    const orderField = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const [quotes, total] = await Promise.all([
      prisma.tireQuote.findMany({
        where,
        orderBy: { [orderField]: sortOrder === 'asc' ? 'asc' : 'desc' },
        skip,
        take: limitNum,
      }),
      prisma.tireQuote.count({ where }),
    ]);

    return res.json({
      quotes,
      pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getQuote(req: Request, res: Response) {
  try {
    const quote = await prisma.tireQuote.findUnique({ where: { id: req.params.id } });
    if (!quote) return res.status(404).json({ error: 'Quote not found' });
    return res.json(quote);
  } catch {
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export async function createQuote(req: Request, res: Response) {
  try {
    const data = quoteSchema.parse(req.body);
    const score = await calculateScore({
      unitPrice: data.unitPrice ?? null,
      totalPrice: data.totalPrice ?? null,
      services: data.includedServices || '',
      payment: data.paymentConditions || '',
      brand: data.brand,
    });

    const quote = await prisma.tireQuote.create({
      data: {
        ...data,
        unitPrice: data.unitPrice ?? null,
        totalPrice: data.totalPrice ?? null,
        score,
        category: classifyBrand(data.brand),
      },
    });

    return res.status(201).json(quote);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation failed', details: error.errors });
    }
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export async function updateQuote(req: Request, res: Response) {
  try {
    const data = quoteSchema.partial().parse(req.body);
    const score = await calculateScore({
      unitPrice: data.unitPrice ?? null,
      totalPrice: data.totalPrice ?? null,
      services: data.includedServices || '',
      payment: data.paymentConditions || '',
      brand: data.brand || '',
    });

    const quote = await prisma.tireQuote.update({
      where: { id: req.params.id },
      data: { ...data, score, category: classifyBrand(data.brand || '') },
    });

    return res.json(quote);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation failed', details: error.errors });
    }
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export async function deleteQuote(req: Request, res: Response) {
  try {
    await prisma.tireQuote.delete({ where: { id: req.params.id } });
    return res.json({ message: 'Quote deleted successfully' });
  } catch {
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export async function compareQuotes(req: Request, res: Response) {
  try {
    const { ids } = req.body as { ids: string[] };
    if (!ids || ids.length < 2 || ids.length > 3) {
      return res.status(400).json({ error: 'Provide 2-3 quote IDs' });
    }
    const quotes = await prisma.tireQuote.findMany({ where: { id: { in: ids } } });
    return res.json(quotes);
  } catch {
    return res.status(500).json({ error: 'Internal server error' });
  }
}
