import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const PREMIUM_BRANDS = ['Pirelli', 'Goodyear', 'Continental', 'Bridgestone', 'Michelin', 'Dunlop'];
const MID_BRANDS = ['Nexen', 'XBRI', 'Wanli', 'Hifly', 'Comforser', 'Compasal', 'Gripmaster'];

function classifyBrand(brand: string): string {
  const upper = brand.toUpperCase();
  for (const pb of PREMIUM_BRANDS) {
    if (upper.includes(pb.toUpperCase())) return 'premium';
  }
  for (const mb of MID_BRANDS) {
    if (upper.includes(mb.toUpperCase())) return 'mid-range';
  }
  return 'economy';
}

function countServices(services: string): number {
  if (!services || services === 'Não incluso' || services === 'Não informado') return 0;
  const keywords = ['montagem', 'balanceamento', 'geometria', 'alinhamento', 'válvulas', 'válvula'];
  return keywords.filter(k => services.toLowerCase().includes(k)).length;
}

function hasInstallments(payment: string): boolean {
  return payment.toLowerCase().includes('x') || payment.toLowerCase().includes('parcela');
}

function calculateScore(data: {
  unitPrice: number | null;
  totalPrice: number | null;
  services: string;
  payment: string;
  brand: string;
  allPrices: number[];
}): number {
  let score = 50;

  const price = data.unitPrice ?? (data.totalPrice ? data.totalPrice / 2 : null);
  if (price !== null && data.allPrices.length > 0) {
    const min = Math.min(...data.allPrices);
    const max = Math.max(...data.allPrices);
    const range = max - min || 1;
    const priceScore = ((max - price) / range) * 30;
    score += priceScore;
  }

  const serviceCount = countServices(data.services);
  score += serviceCount * 5;

  if (hasInstallments(data.payment)) score += 8;

  const category = classifyBrand(data.brand);
  if (category === 'premium') score += 7;
  else if (category === 'mid-range') score += 4;

  return Math.min(100, Math.max(0, Math.round(score)));
}

const rawData = [
  { empresa: 'Harter Pneus', marca: 'XBRI', valorUnitario: 399.90, valor2Pneus: 799.80, pagamento: 'Pix', servicos: 'Válvulas + balanceamento grátis', observacoes: 'Colocado' },
  { empresa: 'Harter Pneus', marca: 'Dunlop', valorUnitario: 470.00, valor2Pneus: 940.00, pagamento: 'Pix', servicos: 'Válvulas + balanceamento grátis', observacoes: 'Colocado' },
  { empresa: 'Harter Pneus', marca: 'XBRI / Dunlop', valorUnitario: null, valor2Pneus: null, pagamento: 'Cartão até 4x', servicos: 'Serviços cobrados à parte', observacoes: 'Geometria + balanceamento + válvulas' },
  { empresa: 'Corrales Pneus', marca: 'Milever MP270', valorUnitario: 275.00, valor2Pneus: 550.00, pagamento: 'Pix ou 5x cartão', servicos: 'Montagem + balanceamento + geometria', observacoes: 'Kit serviços R$189' },
  { empresa: 'Corrales Pneus', marca: 'Milever MP270', valorUnitario: null, valor2Pneus: 739.00, pagamento: 'Pix', servicos: 'Tudo incluso', observacoes: '2 pneus + serviços' },
  { empresa: 'Corrales Pneus', marca: 'Milever MP270', valorUnitario: null, valor2Pneus: 799.00, pagamento: '5x cartão', servicos: 'Tudo incluso', observacoes: '2 pneus + serviços' },
  { empresa: 'Muniz Pneus', marca: 'Lanvigator Comfort II', valorUnitario: 239.90, valor2Pneus: 479.80, pagamento: 'Até 10x sem juros', servicos: 'Não incluso', observacoes: 'Balanceamento/válvula R$20 cada' },
  { empresa: 'Impacto Pneus', marca: 'Comforser CF510', valorUnitario: 253.90, valor2Pneus: 507.80, pagamento: 'Até 5x sem juros', servicos: 'Montagem + balanceamento grátis', observacoes: 'Geometria separada' },
  { empresa: 'Impacto Pneus', marca: 'XBRI Fastway', valorUnitario: 252.90, valor2Pneus: 505.80, pagamento: 'Até 5x sem juros', servicos: 'Montagem + balanceamento grátis', observacoes: 'Geometria separada' },
  { empresa: 'Impacto Pneus', marca: 'Agate AG-266', valorUnitario: 308.90, valor2Pneus: 617.80, pagamento: 'Até 5x sem juros', servicos: 'Montagem + balanceamento grátis', observacoes: 'Geometria separada' },
  { empresa: 'Zé Pneus', marca: 'Goodyear Kelly Edge Sport 2', valorUnitario: 519.90, valor2Pneus: 1039.80, pagamento: 'Pix', servicos: 'Não informado', observacoes: '' },
  { empresa: 'Zé Pneus', marca: 'Goodyear Kelly Edge Sport 2', valorUnitario: 540.00, valor2Pneus: 1080.00, pagamento: 'Até 10x sem juros', servicos: 'Não informado', observacoes: '' },
  { empresa: 'Rede GP Pneus', marca: 'Gripmaster G-Push', valorUnitario: 268.00, valor2Pneus: 536.00, pagamento: 'À vista', servicos: 'Montagem grátis', observacoes: 'Balanceamento + geometria R$140' },
  { empresa: 'Rede GP Pneus', marca: 'Gripmaster G-Push', valorUnitario: 303.00, valor2Pneus: 606.00, pagamento: 'Até 6x cartão', servicos: 'Montagem grátis', observacoes: 'Balanceamento + geometria R$140' },
  { empresa: 'Gomma Pneus', marca: 'Hifly HF261', valorUnitario: 256.08, valor2Pneus: 512.16, pagamento: 'Pix', servicos: 'Montagem grátis', observacoes: 'Balanceamento/alinhamento pagos à parte' },
  { empresa: 'Gomma Pneus', marca: 'Hifly HF261', valorUnitario: 286.21, valor2Pneus: 572.42, pagamento: 'Até 4x sem juros', servicos: 'Montagem grátis', observacoes: '' },
  { empresa: 'Lyon Pneus', marca: 'Continental PowerContact', valorUnitario: 575.00, valor2Pneus: 1150.00, pagamento: 'À vista', servicos: 'Não incluso', observacoes: 'Marca premium' },
  { empresa: 'Lyon Pneus', marca: 'Dunlop', valorUnitario: 478.00, valor2Pneus: 956.00, pagamento: 'À vista', servicos: 'Não incluso', observacoes: '' },
  { empresa: 'Lyon Pneus', marca: 'Pirelli', valorUnitario: 513.00, valor2Pneus: 1026.00, pagamento: 'À vista', servicos: 'Não incluso', observacoes: '' },
  { empresa: 'Lyon Pneus', marca: 'Goodyear', valorUnitario: 576.00, valor2Pneus: 1152.00, pagamento: 'À vista', servicos: 'Não incluso', observacoes: '' },
  { empresa: 'Lyon Pneus', marca: 'Serviços', valorUnitario: null, valor2Pneus: null, pagamento: '', servicos: 'Geometria R$100', observacoes: 'Balanceamento R$30/roda' },
  { empresa: 'Crestani Pneus', marca: 'Dunlop FM800', valorUnitario: 485.00, valor2Pneus: 970.00, pagamento: 'Pix/dinheiro', servicos: 'Montagem + balanceamento', observacoes: '' },
  { empresa: 'Crestani Pneus', marca: 'Continental PowerContact 2', valorUnitario: 609.00, valor2Pneus: 1218.00, pagamento: 'Pix/dinheiro', servicos: 'Montagem + balanceamento', observacoes: '' },
  { empresa: 'Crestani Pneus', marca: 'Nexen NPriz', valorUnitario: 416.00, valor2Pneus: 832.00, pagamento: 'Pix/dinheiro', servicos: 'Montagem + balanceamento', observacoes: '' },
  { empresa: 'Crestani Pneus', marca: 'Comforser CF510', valorUnitario: 385.00, valor2Pneus: 770.00, pagamento: 'Pix/dinheiro', servicos: 'Montagem + balanceamento', observacoes: '' },
  { empresa: 'Crestani Pneus', marca: 'Wanli', valorUnitario: 359.00, valor2Pneus: 718.00, pagamento: 'Pix/dinheiro', servicos: 'Montagem + balanceamento', observacoes: '' },
  { empresa: 'Crestani Pneus', marca: 'Serviços', valorUnitario: null, valor2Pneus: null, pagamento: '', servicos: 'Geometria R$70', observacoes: '' },
  { empresa: 'HR Pneus', marca: 'Compasal', valorUnitario: 330.00, valor2Pneus: 660.00, pagamento: 'Não informado', servicos: 'Não informado', observacoes: '' },
  { empresa: 'HR Pneus', marca: 'Pirelli', valorUnitario: 618.00, valor2Pneus: 1236.00, pagamento: 'Não informado', servicos: 'Não informado', observacoes: '' },
];

async function main() {
  console.log('🌱 Starting seed...');

  await prisma.tireQuote.deleteMany();
  await prisma.user.deleteMany();

  // Create default admin user
  const bcrypt = require('bcryptjs');
  const hashedPassword = await bcrypt.hash('admin123', 10);
  await prisma.user.create({
    data: {
      name: 'Admin',
      email: 'admin@buscapneu.com',
      password: hashedPassword,
    },
  });
  console.log('✅ Default user created: admin@buscapneu.com / admin123');

  const allPrices = rawData
    .map(d => d.valorUnitario ?? (d.valor2Pneus ? d.valor2Pneus / 2 : null))
    .filter((p): p is number => p !== null);

  for (const item of rawData) {
    const score = calculateScore({
      unitPrice: item.valorUnitario,
      totalPrice: item.valor2Pneus,
      services: item.servicos,
      payment: item.pagamento,
      brand: item.marca,
      allPrices,
    });

    const parts = item.marca.split(' ');
    const modelName = parts.length > 1 ? parts.slice(1).join(' ') : null;

    await prisma.tireQuote.create({
      data: {
        company: item.empresa,
        brand: item.marca,
        model: modelName,
        unitPrice: item.valorUnitario,
        totalPrice: item.valor2Pneus,
        paymentConditions: item.pagamento || null,
        includedServices: item.servicos || null,
        observations: item.observacoes || null,
        score,
        category: classifyBrand(item.marca),
      },
    });
  }

  console.log(`✅ ${rawData.length} tire quotes seeded successfully!`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
