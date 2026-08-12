export default {
  routes: [
    {
      method: "GET",
      path: "/standings/overall",
      handler: "standings.getOverallStandings",
      config: {
        policies: [],
        middlewares: [],
        auth: false,
      },
    },
    {
      method: "GET",
      path: "/standings",
      handler: "standings.getStandings",
      config: {
        policies: [],
        middlewares: [],
        auth: false,
      },
    },
  ],
};
