import { factories } from "@strapi/strapi";

type KnockoutService = {
  generateKnockoutRound: () => Promise<unknown>;
};

export default factories.createCoreController(
  "api::group-match.group-match",
  ({ strapi }) => ({
    async generate(ctx) {
      const service = strapi.service(
        "api::knockout.knockout",
      ) as KnockoutService;
      ctx.body = { data: await service.generateKnockoutRound() };
    },
  }),
);
