import { Request, Response } from 'express';
import prisma from '../utils/prisma';

export async function getDashboardStats(req: Request, res: Response) {
  try {
    const [
      totalQuotes,
      companies,
      bestScore,
      lowestPrice,
      premiumCount,
      economyCount,
    ] = await Promise.all([
      prisma.tireQuote.count(),
      prisma.tireQuote.groupBy({ by: ['company'], _count: true }),
      prisma.tireQuote.findFirst({ orderBy: { score: 'desc' }, where: { unitPrice: { not: null } } }),
      prisma.tireQuote.findFirst({ orderBy: { unitPrice: 'asc' }, where: { unitPrice: { not: null } } }),
      prisma.tireQuote.count({ where: { category: 'premium' } }),
      prisma.tireQuote.count({ where: { category: 'economy' } }),
    ]);

    const prices = await prisma.tireQuote.findMany({
      where: { unitPrice: { not: null } },
      select: { unitPrice: true },
    });

    const avgPrice = prices.length > 0
      ? prices.reduce((sum, q) => sum + (q.unitPrice || 0), 0) / prices.length
      : 0;

    return res.json({
      totalQuotes,
      totalCompanies: companies.length,
      avgPrice: Math.round(avgPrice * 100) / 100,
      lowestPrice: lowestPrice?.unitPrice || null,
      bestDeal: bestScore ? { company: bestScore.company, brand: bestScore.brand, score: bestScore.score, price: bestScore.unitPrice } : null,
      premiumCount,
      economyCount,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getPriceByBrand(req: Request, res: Response) {
  try {
    const quotes = await prisma.tireQuote.findMany({
      where: { unitPrice: { not: null } },
      select: { brand: true, unitPrice: true },
    });

    const brandMap: Record<string, number[]> = {};
    for (const q of quotes) {
      const key = q.brand.split(' ')[0];
      if (!brandMap[key]) brandMap[key] = [];
      brandMap[key].push(q.unitPrice!);
    }

    const data = Object.entries(brandMap)
      .map(([brand, prices]) => ({
        brand,
        avgPrice: Math.round(prices.reduce((a, b) => a + b, 0) / prices.length),
        minPrice: Math.min(...prices),
        maxPrice: Math.max(...prices),
        count: prices.length,
      }))
      .sort((a, b) => a.avgPrice - b.avgPrice);

    return res.json(data);
  } catch {
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getCompanyRanking(req: Request, res: Response) {
  try {
    const quotes = await prisma.tireQuote.findMany({
      select: { company: true, score: true, unitPrice: true },
    });

    const companyMap: Record<string, { scores: number[]; prices: number[] }> = {};
    for (const q of quotes) {
      if (!companyMap[q.company]) companyMap[q.company] = { scores: [], prices: [] };
      companyMap[q.company].scores.push(q.score);
      if (q.unitPrice) companyMap[q.company].prices.push(q.unitPrice);
    }

    const data = Object.entries(companyMap)
      .map(([company, d]) => ({
        company,
        avgScore: Math.round(d.scores.reduce((a, b) => a + b, 0) / d.scores.length),
        avgPrice: d.prices.length > 0 ? Math.round(d.prices.reduce((a, b) => a + b, 0) / d.prices.length) : null,
        quoteCount: d.scores.length,
      }))
      .sort((a, b) => b.avgScore - a.avgScore);

    return res.json(data);
  } catch {
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getPriceDistribution(req: Request, res: Response) {
  try {
    const quotes = await prisma.tireQuote.findMany({
      where: { unitPrice: { not: null } },
      select: { unitPrice: true, category: true, brand: true, company: true },
    });

    const ranges = [
      { label: 'Até R$300', min: 0, max: 300 },
      { label: 'R$300-400', min: 300, max: 400 },
      { label: 'R$400-500', min: 400, max: 500 },
      { label: 'R$500-600', min: 500, max: 600 },
      { label: 'Acima R$600', min: 600, max: Infinity },
    ];

    const distribution = ranges.map(range => ({
      label: range.label,
      count: quotes.filter(q => q.unitPrice! >= range.min && q.unitPrice! < range.max).length,
    }));

    const premiumVsEconomy = [
      { name: 'Premium', value: quotes.filter(q => q.category === 'premium').length },
      { name: 'Médio', value: quotes.filter(q => q.category === 'mid-range').length },
      { name: 'Econômico', value: quotes.filter(q => q.category === 'economy').length },
    ];

    return res.json({ distribution, premiumVsEconomy });
  } catch {
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getInsights(req: Request, res: Response) {
  try {
    const quotes = await prisma.tireQuote.findMany({
      where: { unitPrice: { not: null } },
      orderBy: { score: 'desc' },
    });

    if (quotes.length === 0) return res.json({ insights: [] });

    const best = quotes[0];
    const worst = quotes[quotes.length - 1];
    const cheapest = [...quotes].sort((a, b) => (a.unitPrice || 0) - (b.unitPrice || 0))[0];
    const avgPrice = quotes.reduce((s, q) => s + (q.unitPrice || 0), 0) / quotes.length;

    const insights = [
      {
        type: 'success',
        title: 'Melhor custo-benefício',
        description: `${best.brand} na ${best.company} tem o melhor score (${best.score}/100) por R$${best.unitPrice?.toFixed(2)}`,
      },
      {
        type: 'info',
        title: 'Opção mais barata',
        description: `${cheapest.brand} na ${cheapest.company} é a mais barata: R$${cheapest.unitPrice?.toFixed(2)}/unidade`,
      },
      {
        type: 'warning',
        title: 'Pior custo-benefício',
        description: `${worst.brand} na ${worst.company} tem o menor score (${worst.score}/100)`,
      },
      {
        type: 'info',
        title: 'Média de mercado',
        description: `O preço médio dos pneus é R$${avgPrice.toFixed(2)}/unidade`,
      },
    ];

    return res.json({ insights });
  } catch {
    return res.status(500).json({ error: 'Internal server error' });
  }
}
