import { toBrowserMediaUrl } from './api';
import { getSingleTypeContent } from './single-types';

type EuregioText = {
  heading: string;
  text: string;
  interregLogoUrl: string;
  euregioLogoUrl: string;
};

type EuregioTextResponse = {
  heading: string;
  text: string;
  logo_interreg?: {
    url: string;
  };
  logo_euregio?: {
    url: string;
  };
};

export async function getEuregioText(
  locale: string,
): Promise<EuregioText | null> {
  const content = await getSingleTypeContent<EuregioTextResponse>(
    'euregio-text',
    {
      populate: 'logo_interreg,logo_euregio',
      locale,
    },
  );

  if (!content) {
    return null;
  }

  return {
    heading: content.heading,
    text: content.text,
    interregLogoUrl: toBrowserMediaUrl(content.logo_interreg?.url ?? ''),
    euregioLogoUrl: toBrowserMediaUrl(content.logo_euregio?.url ?? ''),
  };
}
