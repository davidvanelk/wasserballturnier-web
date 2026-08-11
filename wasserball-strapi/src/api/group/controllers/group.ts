import { factories } from "@strapi/strapi";

type GroupService = {
  generateGroupPhaseMatches: () => Promise<{
    createdMatches: number;
    skippedMatches: number;
  }>;
};

export default factories.createCoreController("api::group.group", ({ strapi }) => ({
  async generateGroupPhase(ctx) {
    const groupService = strapi.service("api::group.group") as GroupService;
    const result = await groupService.generateGroupPhaseMatches();

    ctx.body = {
      data: result,
    };
  },
}));
