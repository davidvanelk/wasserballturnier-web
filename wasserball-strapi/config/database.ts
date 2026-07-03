type StrapiEnv = {
  (key: string, defaultValue?: string): string;
  int: (key: string, defaultValue: number) => number;
  bool: (key: string, defaultValue: boolean) => boolean;
};

export default ({ env }: { env: StrapiEnv }) => ({
  connection: {
    client: "mysql2",
    connection: {
      host: env("DATABASE_HOST", "127.0.0.1"),
      port: env.int("DATABASE_PORT", 3306),
      database: env("DATABASE_NAME", "wasserball_strapi"),
      user: env("DATABASE_USERNAME", "strapi"),
      password: env("DATABASE_PASSWORD", "strapi"),
      ssl: env.bool("DATABASE_SSL", false)
        ? {
            rejectUnauthorized: env.bool(
              "DATABASE_SSL_REJECT_UNAUTHORIZED",
              true,
            ),
          }
        : false,
    },
  },
});
