export default {
  routes: [
    {
      method: "POST",
      path: "/groups/generate-group-phase",
      handler: "group.generateGroupPhase",
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};
