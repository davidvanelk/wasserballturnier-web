import { factories } from "@strapi/strapi";

type QueryWithPopulate = Record<string, unknown> & {
  populate?: unknown;
};

export default factories.createCoreController(
  "api::group-match.group-match",
  () => ({
    async find(ctx) {
      const query = (ctx.query ?? {}) as QueryWithPopulate;
      ctx.query = {
        ...query,
        populate:
          query.populate ??
          ({
            group: true,
            homeTeam: true,
            awayTeam: true,
          } as const),
      };

      return super.find(ctx);
    },

    async findOne(ctx) {
      const query = (ctx.query ?? {}) as QueryWithPopulate;
      ctx.query = {
        ...query,
        populate:
          query.populate ??
          ({
            group: true,
            homeTeam: true,
            awayTeam: true,
          } as const),
      };

      return super.findOne(ctx);
    },
  }),
);
