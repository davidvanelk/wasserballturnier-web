import seedSponsors from "./seed/sponsors.json";
import { createMatchLabel } from "./api/group-match/content-types/group-match/lifecycles";

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
  getModel: (uid: string) => unknown;
  plugin: (name: string) => {
    service: (name: string) => {
      findConfiguration: (model: unknown) => Promise<ContentManagerConfiguration>;
      updateConfiguration: (
        model: unknown,
        configuration: ContentManagerConfiguration,
      ) => Promise<unknown>;
    };
  };
};

type LayoutField = { name: string; size: number };

type ContentManagerConfiguration = {
  settings: Record<string, unknown>;
  metadatas: Record<string, any>;
  layouts: {
    list: string[];
    edit: LayoutField[][];
  };
};

type ExistingSponsor = {
  id: number;
  selector?: string;
};

type UploadFile = {
  id: number;
  url?: string | null;
};

type MatchLabelRecord = {
  id: number;
  matchLabel?: string | null;
  phase?: string | null;
  roundSlot?: number | null;
  group?: { name?: string | null } | null;
  homeTeam?: { name?: string | null } | null;
  awayTeam?: { name?: string | null } | null;
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
    "api::team.team.find",
    "api::team.team.findOne",
    "api::group.group.find",
    "api::group.group.findOne",
    "api::group-match.group-match.find",
    "api::group-match.group-match.findOne",
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

async function ensureMatchStatusAdminLayout(strapi: StrapiLike) {
  const uid = "api::group-match.group-match";
  const model = strapi.getModel(uid);
  const service = strapi.plugin("content-manager").service("content-types");
  const configuration = await service.findConfiguration(model);
  const edit = configuration.layouts.edit.map((row) =>
    row.filter(
      (field) =>
        ![
          "matchLabel",
          "matchStatus",
          "team1PenaltyPoints",
          "team2PenaltyPoints",
        ].includes(field.name),
    ),
  );
  edit.unshift([{ name: "matchLabel", size: 12 }]);

  const phaseRowIndex = edit.findIndex((row) =>
    row.some((field) => field.name === "phase"),
  );
  const statusRowIndex = phaseRowIndex >= 0 ? phaseRowIndex + 1 : 0;
  edit.splice(statusRowIndex, 0, [{ name: "matchStatus", size: 6 }]);

  const scoreRowIndex = edit.findIndex((row) =>
    row.some((field) => field.name === "homeScore"),
  );
  const penaltyRowIndex = scoreRowIndex >= 0 ? scoreRowIndex + 1 : edit.length;
  edit.splice(penaltyRowIndex, 0, [
    { name: "team1PenaltyPoints", size: 6 },
    { name: "team2PenaltyPoints", size: 6 },
  ]);

  const metadata = configuration.metadatas.matchStatus;
  if (metadata) {
    metadata.edit = { ...metadata.edit, label: "Status" };
    metadata.list = { ...metadata.list, label: "Status" };
  }

  const labelMetadata = configuration.metadatas.matchLabel;
  if (labelMetadata) {
    labelMetadata.edit = {
      ...labelMetadata.edit,
      label: "Spiel",
      description: "Wird beim Speichern automatisch aus Gruppe und Teams erzeugt.",
      editable: true,
    };
    labelMetadata.list = { ...labelMetadata.list, label: "Spiel" };
  }

  const matchLabels: Record<string, string> = {
    homeTeam: "Team 1",
    awayTeam: "Team 2",
    homeScore: "Tore Team 1",
    awayScore: "Tore Team 2",
    team1PenaltyPoints: "Strafpunkte Team 1",
    team2PenaltyPoints: "Strafpunkte Team 2",
    roundSlot: "Viertelfinalplatz",
  };

  for (const [field, label] of Object.entries(matchLabels)) {
    const fieldMetadata = configuration.metadatas[field];
    if (!fieldMetadata) continue;
    fieldMetadata.edit = { ...fieldMetadata.edit, label };
    fieldMetadata.list = { ...fieldMetadata.list, label };
  }

  await service.updateConfiguration(model, {
    settings: {
      ...configuration.settings,
      mainField: "matchLabel",
      defaultSortBy: "matchNumber",
      defaultSortOrder: "ASC",
    },
    metadatas: configuration.metadatas,
    layouts: {
      ...configuration.layouts,
      list: [
        "matchLabel",
        ...configuration.layouts.list.filter(
          (field) => field !== "matchLabel",
        ),
      ].slice(0, 4),
      edit: edit.filter((row) => row.length > 0),
    },
  });

  const teamUid = "api::team.team";
  const teamModel = strapi.getModel(teamUid);
  const teamConfiguration = await service.findConfiguration(teamModel);
  const teamLabels: Record<string, string> = {
    homeMatches: "Spiele als Team 1",
    awayMatches: "Spiele als Team 2",
  };

  for (const [field, label] of Object.entries(teamLabels)) {
    const fieldMetadata = teamConfiguration.metadatas[field];
    if (!fieldMetadata) continue;
    fieldMetadata.edit = {
      ...fieldMetadata.edit,
      label,
      mainField: "matchLabel",
    };
    fieldMetadata.list = { ...fieldMetadata.list, label };
  }

  const presenceMetadata = teamConfiguration.metadatas.isPresent;
  if (presenceMetadata) {
    presenceMetadata.edit = {
      ...presenceMetadata.edit,
      label: "Anwesend",
      description: "Vor der Spielgenerierung für nicht erschienene Teams deaktivieren.",
    };
    presenceMetadata.list = {
      ...presenceMetadata.list,
      label: "Anwesend",
    };
  }

  await service.updateConfiguration(teamModel, {
    settings: teamConfiguration.settings,
    metadatas: teamConfiguration.metadatas,
    layouts: teamConfiguration.layouts,
  });

  const groupUid = "api::group.group";
  const groupModel = strapi.getModel(groupUid);
  const groupConfiguration = await service.findConfiguration(groupModel);
  const matchesMetadata = groupConfiguration.metadatas.matches;

  if (matchesMetadata) {
    matchesMetadata.edit = {
      ...matchesMetadata.edit,
      label: "Spiele",
      mainField: "matchLabel",
    };
    matchesMetadata.list = { ...matchesMetadata.list, label: "Spiele" };
  }

  await service.updateConfiguration(groupModel, {
    settings: groupConfiguration.settings,
    metadatas: groupConfiguration.metadatas,
    layouts: groupConfiguration.layouts,
  });
}

async function ensureExistingMatchLabels(strapi: StrapiLike) {
  const matches = (await strapi.entityService.findMany(
    "api::group-match.group-match",
    {
      fields: ["id", "matchLabel", "phase", "roundSlot"],
      populate: {
        group: { fields: ["name"] },
        homeTeam: { fields: ["name"] },
        awayTeam: { fields: ["name"] },
      },
      limit: 500,
    },
  )) as MatchLabelRecord[];

  for (const match of matches) {
    const matchLabel = createMatchLabel(match);
    if (!matchLabel || match.matchLabel === matchLabel) continue;
    await strapi.entityService.update("api::group-match.group-match", match.id, {
      data: { matchLabel },
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
    await ensureMatchStatusAdminLayout(strapi);
    await ensureExistingMatchLabels(strapi);

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
