export default {
  routes: [
    {
      method: "POST",
      path: "/knockout/generate",
      handler: "knockout.generate",
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};
