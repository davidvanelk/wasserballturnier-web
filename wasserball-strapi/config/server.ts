type StrapiEnv = {
  (key: string, defaultValue?: string): string;
  int: (key: string, defaultValue: number) => number;
  array: (key: string) => string[];
};

export default ({ env }: { env: StrapiEnv }) => ({
  host: env("HOST", "0.0.0.0"),
  port: env.int("PORT", 1337),
  url: env("PUBLIC_URL", ""),
  proxy: true,
  app: {
    keys: env.array("APP_KEYS"),
  },
});
