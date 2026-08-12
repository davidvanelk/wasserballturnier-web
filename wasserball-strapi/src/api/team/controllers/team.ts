import { factories } from "@strapi/strapi";

type QueryWithPopulate = Record<string, unknown> & {
  populate?: unknown;
  filters?: unknown;
};

function onlyPresentTeams(query: QueryWithPopulate): QueryWithPopulate {
  const presenceFilter = { isPresent: { $eq: true } };
  return {
    ...query,
    filters: query.filters
      ? { $and: [query.filters, presenceFilter] }
      : presenceFilter,
    populate: query.populate ?? { group: true },
  };
}

export default factories.createCoreController("api::team.team", () => ({
  async find(ctx) {
    const query = (ctx.query ?? {}) as QueryWithPopulate;
    ctx.query = onlyPresentTeams(query);

    return super.find(ctx);
  },

  async findOne(ctx) {
    const query = (ctx.query ?? {}) as QueryWithPopulate;
    ctx.query = onlyPresentTeams(query);

    return super.findOne(ctx);
  },
}));
