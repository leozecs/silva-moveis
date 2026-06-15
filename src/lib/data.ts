import {
  Award,
  BadgeCheck,
  Factory,
  Handshake,
  ShieldCheck,
  Sparkles,
  Truck,
  Waves,
} from "lucide-react";

export type Product = {
  slug: string;
  name: string;
  category: string;
  collection: string;
  price: number;
  priceLabel: string;
  image: string;
  gallery: string[];
  shortDescription: string;
  description: string;
  dimensions: string;
  materials: string;
  specs: string[];
  featured?: boolean;
};

export const heroImage =
  "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=2200&q=85";

export const categories = [
  {
    name: "Sofas externos",
    description: "Composicoes amplas para varandas, decks e lounges gourmet.",
    image:
      "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=82",
  },
  {
    name: "Poltronas",
    description: "Pecas de assinatura com ergonomia, tramas e presenca.",
    image:
      "https://images.unsplash.com/photo-1618220179428-22790b461013?auto=format&fit=crop&w=1200&q=82",
  },
  {
    name: "Areas gourmet",
    description: "Conjuntos completos para receber com conforto e sofisticação.",
    image:
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=82",
  },
  {
    name: "Piscina e lazer",
    description: "Espreguicadeiras, mesas laterais e ambientes de resort.",
    image:
      "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1200&q=82",
  },
];

export const products: Product[] = [
  {
    slug: "sofa-externo-verona",
    name: "Sofa Externo Verona",
    category: "Sofas externos",
    collection: "Colecao Verona",
    price: 12900,
    priceLabel: "R$ 12.900,00",
    image:
      "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=84",
    gallery: [
      "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1400&q=84",
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1400&q=84",
      "https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=1400&q=84",
    ],
    shortDescription:
      "Sofa modular com proporcoes generosas, acabamento em fibra sintetica e almofadas de alta densidade.",
    description:
      "Criado para areas externas de alto padrao, o Sofa Verona combina estrutura robusta, tramas precisas e conforto profundo. A modulacao permite adaptar o conjunto a varandas, pergolados e lounges de piscina com uma presenca elegante e atemporal.",
    dimensions: "Modulo central 92 x 92 x 72 cm | Chaise 180 x 92 x 72 cm",
    materials:
      "Fibra sintetica premium, estrutura em aluminio tratado, tecido impermeavel e espuma D33 soft.",
    specs: [
      "Modulacao sob medida",
      "Almofadas removiveis",
      "Protecao UV",
      "Uso coberto ou area externa protegida",
    ],
    featured: true,
  },
  {
    slug: "poltrona-nautica-milano",
    name: "Poltrona Nautica Milano",
    category: "Poltronas",
    collection: "Colecao Milano",
    price: 4890,
    priceLabel: "R$ 4.890,00",
    image:
      "https://images.unsplash.com/photo-1618220179428-22790b461013?auto=format&fit=crop&w=1200&q=84",
    gallery: [
      "https://images.unsplash.com/photo-1618220179428-22790b461013?auto=format&fit=crop&w=1400&q=84",
      "https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?auto=format&fit=crop&w=1400&q=84",
      "https://images.unsplash.com/photo-1600210491892-03d54c0aaf87?auto=format&fit=crop&w=1400&q=84",
    ],
    shortDescription:
      "Poltrona em corda nautica com desenho envolvente para varandas e salas integradas.",
    description:
      "A Milano foi pensada como peca protagonista. O encosto em corda nautica valoriza o trabalho artesanal e cria um contorno leve, enquanto a base solida garante estabilidade e conforto para longos momentos de descanso.",
    dimensions: "86 x 82 x 78 cm",
    materials:
      "Corda nautica, aluminio naval, tecido acrilico e pes niveladores.",
    specs: ["Trama artesanal", "Assento extra confort", "Cores personalizaveis"],
    featured: true,
  },
  {
    slug: "conjunto-gourmet-lago",
    name: "Conjunto Gourmet Lago",
    category: "Conjuntos gourmet",
    collection: "Colecao Lago",
    price: 18750,
    priceLabel: "R$ 18.750,00",
    image:
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=84",
    gallery: [
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1400&q=84",
      "https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=1400&q=84",
      "https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1400&q=84",
    ],
    shortDescription:
      "Mesa gourmet com cadeiras estofadas para projetos que pedem recepcao impecavel.",
    description:
      "Um conjunto completo para areas gourmet contemporaneas. A mesa possui linhas limpas e visual arquitetonico, enquanto as cadeiras trazem conforto de sala de jantar para ambientes semiabertos.",
    dimensions: "Mesa 240 x 110 x 76 cm | Cadeiras 58 x 62 x 82 cm",
    materials:
      "Tampo amadeirado tecnico, estrutura em aluminio e estofamento externo.",
    specs: ["6 ou 8 lugares", "Tampo resistente", "Cadeiras com bracos"],
    featured: true,
  },
  {
    slug: "mesa-aurora",
    name: "Mesa Aurora",
    category: "Mesas",
    collection: "Colecao Aurora",
    price: 7390,
    priceLabel: "R$ 7.390,00",
    image:
      "https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=1200&q=84",
    gallery: [
      "https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=1400&q=84",
      "https://images.unsplash.com/photo-1600607687644-c7171b42498b?auto=format&fit=crop&w=1400&q=84",
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1400&q=84",
    ],
    shortDescription:
      "Mesa de jantar externa com acabamento limpo e proporcao elegante.",
    description:
      "A Mesa Aurora une durabilidade e refinamento para espacos de convivencia. O desenho minimalista facilita composicoes com cadeiras de corda, fibra ou estofadas.",
    dimensions: "220 x 100 x 76 cm",
    materials: "Aluminio tratado, pintura eletrostatica e tampo tecnico.",
    specs: ["4 acabamentos", "Niveladores ocultos", "Uso gourmet"],
  },
  {
    slug: "cadeira-alba",
    name: "Cadeira Alba",
    category: "Cadeiras",
    collection: "Colecao Alba",
    price: 1890,
    priceLabel: "R$ 1.890,00",
    image:
      "https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?auto=format&fit=crop&w=1200&q=84",
    gallery: [
      "https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?auto=format&fit=crop&w=1400&q=84",
      "https://images.unsplash.com/photo-1600210491892-03d54c0aaf87?auto=format&fit=crop&w=1400&q=84",
      "https://images.unsplash.com/photo-1618220179428-22790b461013?auto=format&fit=crop&w=1400&q=84",
    ],
    shortDescription:
      "Cadeira leve com encosto tramado, ideal para mesas gourmet e varandas.",
    description:
      "A Alba entrega visual sofisticado sem perder praticidade. Sua estrutura leve facilita o uso diario, enquanto a trama traz textura premium ao conjunto.",
    dimensions: "56 x 58 x 82 cm",
    materials: "Aluminio, fibra sintetica e assento estofado externo.",
    specs: ["Empilhavel sob consulta", "Assento macio", "Acabamento premium"],
  },
  {
    slug: "espreguicadeira-solare",
    name: "Espreguicadeira Solare",
    category: "Espreguicadeiras",
    collection: "Colecao Solare",
    price: 5290,
    priceLabel: "R$ 5.290,00",
    image:
      "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1200&q=84",
    gallery: [
      "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1400&q=84",
      "https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=1400&q=84",
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1400&q=84",
    ],
    shortDescription:
      "Espreguicadeira reclinavel com leitura de resort para piscinas residenciais.",
    description:
      "A Solare foi desenhada para transformar decks e bordas de piscina em ambientes de lazer de alto impacto visual, com regulagem suave e conforto prolongado.",
    dimensions: "205 x 76 x 38 cm",
    materials: "Aluminio naval, tela sling e tecido impermeavel.",
    specs: ["Encosto reclinavel", "Rodas discretas", "Secagem rapida"],
    featured: true,
  },
  {
    slug: "conjunto-piscina-riviera",
    name: "Conjunto Piscina Riviera",
    category: "Conjuntos para piscina",
    collection: "Colecao Riviera",
    price: 24600,
    priceLabel: "R$ 24.600,00",
    image:
      "https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=1200&q=84",
    gallery: [
      "https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=1400&q=84",
      "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1400&q=84",
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1400&q=84",
    ],
    shortDescription:
      "Composicao completa com lounge, mesas laterais e espreguicadeiras.",
    description:
      "Riviera e uma solucao visual para apresentar a area da piscina como um ambiente completo. O conjunto pode ser adaptado para projetos residenciais, condominios e pousadas boutique.",
    dimensions: "Projeto configuravel por ambiente",
    materials: "Fibra sintetica, aluminio tratado, corda nautica e tecidos UV.",
    specs: ["Layout sob medida", "Mix de pecas", "Curadoria de acabamentos"],
  },
  {
    slug: "chaise-origem",
    name: "Chaise Origem",
    category: "Poltronas",
    collection: "Colecao Origem",
    price: 6150,
    priceLabel: "R$ 6.150,00",
    image:
      "https://images.unsplash.com/photo-1600210491892-03d54c0aaf87?auto=format&fit=crop&w=1200&q=84",
    gallery: [
      "https://images.unsplash.com/photo-1600210491892-03d54c0aaf87?auto=format&fit=crop&w=1400&q=84",
      "https://images.unsplash.com/photo-1618220179428-22790b461013?auto=format&fit=crop&w=1400&q=84",
      "https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?auto=format&fit=crop&w=1400&q=84",
    ],
    shortDescription:
      "Chaise de descanso com silhueta baixa e acabamento artesanal.",
    description:
      "A Chaise Origem adiciona um ponto de pausa ao projeto. Ideal para varandas amplas, quartos integrados e areas de leitura com ventilacao natural.",
    dimensions: "165 x 78 x 74 cm",
    materials: "Base em aluminio, corda nautica e almofada de toque macio.",
    specs: ["Peca de destaque", "Almofada solta", "Acabamento artesanal"],
  },
];

export const featuredProducts = products.filter((product) => product.featured);

export const cartItems = [
  { product: products[0], quantity: 1 },
  { product: products[1], quantity: 2 },
  { product: products[4], quantity: 4 },
];

export const purchaseHistory = [
  {
    id: "SM-2026-0148",
    date: "18/05/2026",
    status: "Entregue",
    payment: "Mercado Pago - Cartao de credito",
    total: 28450,
    items: ["Conjunto Gourmet Lago", "Cadeira Alba"],
  },
  {
    id: "SM-2026-0097",
    date: "22/03/2026",
    status: "Em producao",
    payment: "Mercado Pago - Pix",
    total: 12900,
    items: ["Sofa Externo Verona"],
  },
  {
    id: "SM-2026-0062",
    date: "09/02/2026",
    status: "Orcamento aprovado",
    payment: "Mercado Pago - Link de pagamento",
    total: 11440,
    items: ["Poltrona Nautica Milano", "Espreguicadeira Solare"],
  },
];

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export const inspirations = [
  {
    title: "Varanda gourmet integrada",
    image:
      "https://images.unsplash.com/photo-1600607687644-c7171b42498b?auto=format&fit=crop&w=1400&q=82",
  },
  {
    title: "Deck com atmosfera de resort",
    image:
      "https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=1400&q=82",
  },
  {
    title: "Living externo contemporaneo",
    image:
      "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=1400&q=82",
  },
];

export const differentials = [
  {
    title: "Acabamento premium",
    description:
      "Tramas alinhadas, costuras limpas e curadoria rigorosa de materiais.",
    icon: Sparkles,
  },
  {
    title: "Materiais externos",
    description:
      "Fibra sintetica, corda nautica e aluminio tratados para uso intenso.",
    icon: ShieldCheck,
  },
  {
    title: "Projeto consultivo",
    description:
      "Composicoes pensadas para cada ambiente, medida e estilo arquitetonico.",
    icon: Handshake,
  },
  {
    title: "Entrega especializada",
    description:
      "Acompanhamento da escolha ao posicionamento final das pecas no ambiente.",
    icon: Truck,
  },
];

export const testimonials = [
  {
    name: "Mariana e Fabio",
    context: "Residencia com area gourmet",
    quote:
      "A composicao mudou completamente a varanda. O resultado ficou elegante, confortavel e com aparencia de projeto assinado.",
  },
  {
    name: "Arq. Renata Prado",
    context: "Projeto de lazer residencial",
    quote:
      "A Silva Moveis conseguiu equilibrar durabilidade e refinamento. As texturas valorizam muito a arquitetura externa.",
  },
  {
    name: "Condominio Vila Serena",
    context: "Lounge de piscina",
    quote:
      "As pecas trouxeram unidade visual para a area comum e passam uma percepcao clara de alto padrao.",
  },
];

export const processSteps = [
  {
    title: "Curadoria do ambiente",
    description:
      "Leitura do espaco, insolacao, circulacao e objetivo de uso para definir a melhor composicao.",
    icon: Waves,
  },
  {
    title: "Fabricacao cuidadosa",
    description:
      "Produção com tramas precisas, estrutura resistente e controle de acabamento em cada etapa.",
    icon: Factory,
  },
  {
    title: "Entrega com criterio",
    description:
      "Orientacao de posicionamento e combinacao para manter o resultado premium no uso real.",
    icon: BadgeCheck,
  },
  {
    title: "Confianca no pos-venda",
    description:
      "Relacionamento proximo para ajustes, novas composicoes e manutencao preventiva.",
    icon: Award,
  },
];

export function getProductBySlug(slug: string) {
  return products.find((product) => product.slug === slug);
}
