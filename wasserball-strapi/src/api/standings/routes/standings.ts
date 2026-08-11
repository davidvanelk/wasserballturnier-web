export default {
  routes: [
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
