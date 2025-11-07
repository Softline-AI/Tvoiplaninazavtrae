interface MemecoinCategory {
  category: string;
  tokens: string[];
  description: string;
}

const MEMECOIN_CATEGORIES: MemecoinCategory[] = [
  {
    category: 'Dog Memes',
    tokens: ['DOGE', 'SHIB', 'FLOKI', 'ELON', 'SAMO', 'BONK', 'WIF', 'MYRO', 'CHEEMS'],
    description: 'Dog-themed meme coins'
  },
  {
    category: 'Frog Memes',
    tokens: ['PEPE', 'APU', 'BOBO', 'WOJAK', 'PONKE', 'BOME'],
    description: 'Frog and Pepe-based memes'
  },
  {
    category: 'Cat Memes',
    tokens: ['POPCAT', 'MEW', 'CATCOIN', 'NEKO', 'SMOL'],
    description: 'Cat-themed meme coins'
  },
  {
    category: 'Political Memes',
    tokens: ['TRUMP', 'BIDEN', 'MAGA', 'TREMP', 'BODEN'],
    description: 'Political figure meme coins'
  },
  {
    category: 'AI/Tech Memes',
    tokens: ['TURBO', 'GROK', 'AI', 'GPT', 'CHATGPT', 'TRUTH'],
    description: 'AI and tech-themed memes'
  },
  {
    category: 'Community Memes',
    tokens: ['SAFEMOON', 'KISHU', 'HOGE', 'SAITAMA', 'JACY'],
    description: 'Community-driven meme coins'
  },
  {
    category: 'Solana Memes',
    tokens: ['WEN', 'SILLY', 'SLERF', 'SMOG', 'BOOK', 'ANALOS', 'HARAMBE'],
    description: 'Solana-native meme coins'
  }
];

const STABLECOIN_LIST = [
  'USDT', 'USDC', 'DAI', 'BUSD', 'TUSD', 'USDP', 'GUSD', 'USDD',
  'FRAX', 'LUSD', 'SUSD', 'USD1', 'PYUSD', 'USDB'
];

const BLUE_CHIP_TOKENS = [
  'BTC', 'ETH', 'BNB', 'XRP', 'ADA', 'SOL', 'DOT', 'MATIC',
  'LINK', 'UNI', 'AVAX', 'ATOM', 'ALGO', 'ICP', 'APT'
];

export interface MemecoinInfo {
  isMemecoin: boolean;
  category?: string;
  isStablecoin: boolean;
  isBlueChip: boolean;
  riskLevel: 'low' | 'medium' | 'high' | 'extreme';
}

export function classifyToken(symbol: string): MemecoinInfo {
  const upperSymbol = symbol.toUpperCase();

  if (STABLECOIN_LIST.includes(upperSymbol)) {
    return {
      isMemecoin: false,
      isStablecoin: true,
      isBlueChip: false,
      riskLevel: 'low'
    };
  }

  if (BLUE_CHIP_TOKENS.includes(upperSymbol)) {
    return {
      isMemecoin: false,
      isStablecoin: false,
      isBlueChip: true,
      riskLevel: 'low'
    };
  }

  for (const category of MEMECOIN_CATEGORIES) {
    if (category.tokens.includes(upperSymbol)) {
      return {
        isMemecoin: true,
        category: category.category,
        isStablecoin: false,
        isBlueChip: false,
        riskLevel: 'extreme'
      };
    }
  }

  if (symbol.length <= 6 && !symbol.includes('.')) {
    return {
      isMemecoin: true,
      category: 'Unknown Meme',
      isStablecoin: false,
      isBlueChip: false,
      riskLevel: 'extreme'
    };
  }

  return {
    isMemecoin: false,
    isStablecoin: false,
    isBlueChip: false,
    riskLevel: 'medium'
  };
}

export function isMemecoin(symbol: string): boolean {
  return classifyToken(symbol).isMemecoin;
}

export function isStablecoin(symbol: string): boolean {
  return classifyToken(symbol).isStablecoin;
}

export function filterMemecoinsOnly(tokens: any[]): any[] {
  return tokens.filter(token => {
    const classification = classifyToken(token.symbol || token.token_symbol);
    return classification.isMemecoin && !classification.isStablecoin;
  });
}

export function getMemecoinCategories(): MemecoinCategory[] {
  return MEMECOIN_CATEGORIES;
}

export function getMemecoinsInCategory(category: string): string[] {
  const cat = MEMECOIN_CATEGORIES.find(c => c.category === category);
  return cat ? cat.tokens : [];
}

export function getAllKnownMemecoins(): string[] {
  return MEMECOIN_CATEGORIES.flatMap(cat => cat.tokens);
}
