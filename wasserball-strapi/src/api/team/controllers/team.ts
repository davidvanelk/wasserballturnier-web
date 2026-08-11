import { factories } from "@strapi/strapi";

type QueryWithPopulate = Record<string, unknown> & {
  populate?: unknown;
};

export default factories.createCoreController("api::team.team", () => ({
  async find(ctx) {
    const query = (ctx.query ?? {}) as QueryWithPopulate;
    ctx.query = {
      ...query,
      populate: query.populate ?? { group: true },
    };

    return super.find(ctx);
  },

  async findOne(ctx) {
    const query = (ctx.query ?? {}) as QueryWithPopulate;
    ctx.query = {
      ...query,
      populate: query.populate ?? { group: true },
    };

    return super.findOne(ctx);
  },
}));
