import {
  computeOverallStandings,
  computeStandings,
} from "../services/standings";
import { factories } from "@strapi/strapi";

type EntityService = {
  findMany: (uid: string, params: Record<string, unknown>) => Promise<unknown>;
};

type StrapiContext = {
  query: { groupId?: string };
  body: unknown;
  throw: (status: number, message: string) => never;
};

export default factories.createCoreController(
  "api::group-match.group-match",
  ({ strapi }) => ({
    async getStandings(ctx: StrapiContext) {
      const { groupId: groupIdParam } = ctx.query;

      let groupId: number | undefined;
      if (groupIdParam !== undefined) {
        groupId = parseInt(groupIdParam, 10);
        if (isNaN(groupId)) {
          ctx.throw(400, "groupId must be a valid integer.");
        }
      }

      const result = await computeStandings(
        strapi as unknown as { entityService: EntityService },
        groupId,
      );

      ctx.body = { data: result };
    },

    async getOverallStandings(ctx: StrapiContext) {
      const result = await computeOverallStandings(
        strapi as unknown as { entityService: EntityService },
      );
      ctx.body = { data: result };
    },
  }),
);
