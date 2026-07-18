import seedSponsors from "./seed/sponsors.json";

type SponsorSeed = {
  sponsor: string;
  logo: string;
  alt: string;
  url: string;
  selector: string;
  tokenMultiplier: number;
};

type StrapiEntityService = {
  findMany: (
    uid: string,
    params: Record<string, unknown>,
  ) => Promise<Array<Record<string, unknown>>>;
  create: (uid: string, params: Record<string, unknown>) => Promise<unknown>;
  update: (
    uid: string,
    entityId: number,
    params: Record<string, unknown>,
  ) => Promise<unknown>;
};

type QueryApi = {
  findOne: (params: Record<string, unknown>) => Promise<any>;
  update: (params: Record<string, unknown>) => Promise<unknown>;
  create: (params: Record<string, unknown>) => Promise<unknown>;
};

type StrapiLike = {
  query: (uid: string) => QueryApi;
  entityService: StrapiEntityService;
};

type ExistingSponsor = {
  id: number;
  selector?: string;
};

type UploadFile = {
  id: number;
  url?: string | null;
};

function shouldSeedSponsorsOnBoot() {
  return process.env.SEED_SPONSORS_ON_BOOT !== "false";
}

async function ensurePublicReadPermissions(strapi: StrapiLike) {
  const publicRole = await strapi
    .query("plugin::users-permissions.role")
    .findOne({ where: { type: "public" } });

  if (!publicRole) {
    return;
  }

  const actions = [
    "api::sponsor.sponsor.find",
    "api::sponsor.sponsor.findOne",
    "plugin::upload.content-api.find",
    "plugin::upload.content-api.findOne",
    "api::euregio-text.euregio-text.find",
  ];

  for (const action of actions) {
    const permission = await strapi
      .query("plugin::users-permissions.permission")
      .findOne({
        where: {
          action,
          role: publicRole.id,
        },
      });

    if (permission) {
      if (!permission.enabled) {
        await strapi.query("plugin::users-permissions.permission").update({
          where: { id: permission.id },
          data: { enabled: true },
        });
      }

      continue;
    }

    await strapi.query("plugin::users-permissions.permission").create({
      data: {
        action,
        role: publicRole.id,
        enabled: true,
      },
    });
  }
}

async function findSponsorLogoMedia(
  strapi: StrapiLike,
  logoPath: string,
): Promise<UploadFile | null> {
  return (await strapi.query("plugin::upload.file").findOne({
    where: {
      url: logoPath,
    },
  })) as UploadFile | null;
}

async function seedSponsorsIfEmpty(strapi: StrapiLike) {
  const existingSponsors = await strapi.entityService.findMany(
    "api::sponsor.sponsor",
    {
      fields: ["id", "selector"],
      limit: 100,
    },
  );

  const sponsorsBySelector = new Map(
    (existingSponsors as ExistingSponsor[])
      .filter((sponsor) => sponsor.selector)
      .map((sponsor) => [sponsor.selector as string, sponsor]),
  );

  for (const [index, sponsor] of (seedSponsors as SponsorSeed[]).entries()) {
    const media = await findSponsorLogoMedia(strapi, sponsor.logo);

    if (!media?.id) {
      console.warn(
        `Unable to find sponsor media for ${sponsor.selector} with upload URL ${sponsor.logo}.`,
      );
      continue;
    }

    const data = {
      sponsor: sponsor.sponsor,
      logo: media.id,
      alt: sponsor.alt,
      url: sponsor.url,
      selector: sponsor.selector,
      tokenMultiplier: sponsor.tokenMultiplier,
      sortOrder: index,
      active: true,
    };

    const existingSponsor = sponsorsBySelector.get(sponsor.selector);

    if (existingSponsor) {
      await strapi.entityService.update(
        "api::sponsor.sponsor",
        existingSponsor.id,
        {
          data,
        },
      );
      continue;
    }

    await strapi.entityService.create("api::sponsor.sponsor", {
      data,
    });
  }
}

export default {
  async bootstrap({ strapi }: { strapi: StrapiLike }) {
    await ensurePublicReadPermissions(strapi);

    if (!shouldSeedSponsorsOnBoot()) {
      console.info(
        "Skipping sponsor seed because SEED_SPONSORS_ON_BOOT=false.",
      );
      return;
    }

    console.info("Seeding sponsor data from src/seed/sponsors.json.");
    await seedSponsorsIfEmpty(strapi);
  },
};
