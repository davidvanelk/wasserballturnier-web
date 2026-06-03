import sponsors from './sponsor-config.json';

type Sponsor = {
  sponsor: string;
  logo: string;
  alt: string;
  url: string;
  selector: string;
  tokenMultiplier: number;
};

export function getSponsors(): Sponsor[] {
  return sponsors;
}
