import { useState, useEffect } from 'react';
import { tokenMetadataService } from '../services/tokenMetadataService';

/**
 * Hook to fetch and cache token logo
 * @param tokenMint - Token mint address
 * @returns Token logo URL
 */
export const useTokenLogo = (tokenMint: string | null | undefined): string => {
  const [logoUrl, setLogoUrl] = useState<string>('https://pbs.twimg.com/profile_images/1969372691523145729/jb8dFHTB_400x400.jpg');

  useEffect(() => {
    if (!tokenMint) {
      setLogoUrl('https://pbs.twimg.com/profile_images/1969372691523145729/jb8dFHTB_400x400.jpg');
      return;
    }

    let isMounted = true;

    const fetchLogo = async () => {
      const logo = await tokenMetadataService.getTokenLogo(tokenMint);
      if (isMounted) {
        setLogoUrl(logo);
      }
    };

    fetchLogo();

    return () => {
      isMounted = false;
    };
  }, [tokenMint]);

  return logoUrl;
};

/**
 * Hook to fetch multiple token logos
 * @param tokenMints - Array of token mint addresses
 * @returns Map of token mint to logo URL
 */
export const useTokenLogos = (tokenMints: string[]): Record<string, string> => {
  const [logos, setLogos] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!tokenMints || tokenMints.length === 0) {
      return;
    }

    let isMounted = true;

    const fetchLogos = async () => {
      const logoMap = await tokenMetadataService.getBatchTokenLogos(tokenMints);
      if (isMounted) {
        setLogos(logoMap);
      }
    };

    fetchLogos();

    return () => {
      isMounted = false;
    };
  }, [tokenMints.join(',')]);

  return logos;
};
