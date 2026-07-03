# GitOps with Kustomize

This directory maps the current Compose-based setup to Kubernetes manifests for a GitOps workflow.

The application is configured to deploy into the `default` namespace.

## Structure

- `base/`: shared resources for the web app, Matomo, and MariaDB
- `overlays/prod/`: production-oriented overlay with ingress resources and a replica patch for the web app
- `apps/`: Argo CD Application manifests as the GitOps entrypoint

## Container Build with GitHub Actions

The workflow `.github/workflows/build-web-image.yml` builds the Next.js image from `wasserball-public-web/` and pushes it to GHCR.

- Target image: `ghcr.io/<github-owner>/wasserball-public-web`
- Tags: `latest` on the default branch and one SHA-based tag per build
- Push authentication is handled through `GITHUB_TOKEN`

Important: the image reference in `overlays/prod/kustomization.yaml` and `base/web-deployment.yaml` must match your real GHCR path.

The repository and the container image are public, so no repository secret or registry pull secret is required for the deployment flow described here.

## Automatic Image Updates with Argo CD

The Argo CD Application is annotated for Argo CD Image Updater. This allows Argo CD to watch the container repository `ghcr.io/davidvanelk/wasserball-public-web` and roll out new releases automatically, even when nothing changes in the GitOps repository itself.

- Observed image: `ghcr.io/davidvanelk/wasserball-public-web`
- Allowed tag: `latest`
- Strategy: `digest`
- Write-back method: `git`
- Write-back target: `kustomization`

The `digest` strategy is important here because `latest` is a mutable tag. Argo CD Image Updater can use it to detect when the digest behind `latest` changes.

For GitOps-managed Argo CD `Application` resources, `argocd` write-back is not sufficient because it only patches the live `Application` object and those changes can be overwritten by the declarative sync from Git. Using `git` write-back with the `kustomization` target makes Image Updater persist the selected digest into the tracked Kustomize source so the rollout survives re-syncs and recreations.

## Included Services

- `wasserball-web` as a Deployment and Service on port 80
- `matomo` as a Deployment and Service on port 80
- `matomo-db` as a StatefulSet with persistent storage

## Required Adjustments Before the First Rollout

1. Set the web image in `overlays/prod/kustomization.yaml` to your actual registry image.
2. Change the hosts in the ingress files to your real domains.
3. Install cert-manager in the cluster and provide a `ClusterIssuer` named `letsencrypt-prod` that solves HTTP-01 challenges through Traefik. The prod overlay creates explicit `Certificate` resources for the web and Matomo hosts.
4. Ensure Traefik serves the `traefik` ingress class and the `web` plus `websecure` entrypoints.
5. Create the Matomo basic-auth secret from `overlays/prod/matomo-basic-auth-secret.yaml.example`, or manage it via Sealed Secrets, SOPS, or External Secrets.
6. Replace the placeholder secrets in `base/web-secret.yaml.example`, `base/matomo-secret.yaml.example`, and `base/matomo-db-secret.yaml.example` with real values, or replace them entirely with Sealed Secrets, SOPS, or External Secrets.
7. Adjust the storage class, resource requests, and limits for your cluster if needed.
8. Install Argo CD Image Updater in the cluster.

## Basic Authentication

The prod ingress for Matomo is configured to require HTTP Basic Authentication through a Traefik middleware.

- `matomo.wasserball.elk-software.de` expects a secret named `matomo-basic-auth`

Each secret must contain a `users` entry with htpasswd content. Example generation:

```sh
htpasswd -nbB <username> <password>
```

Use the generated line as the value of `stringData.users` in the example manifests, or store the same payload through your preferred secret management workflow.

The public website can be protected temporarily through the optional patch `overlays/prod/web-ingress-basic-auth-patch.yaml` together with `overlays/prod/wasserball-web-basic-auth-middleware.yaml`. This is intentionally not enabled by default.

HTTP-to-HTTPS redirect is handled by separate Traefik ingress resources on the `web` entrypoint. The application ingresses themselves listen only on `websecure`, which avoids Traefik serving a TLS-only router on plain HTTP and returning 404.

Important: Traefik also cannot treat a missing basic-auth secret as "auth disabled". If the auth middleware is active and the referenced secret is missing, the route will fail instead of opening the page. To temporarily protect the site, enable the patch and create the matching secret. To reopen the site, remove the patch again.

## Local Validation

```sh
kustomize build gitops/overlays/prod
```

Or with `kubectl`:

```sh
kubectl kustomize gitops/overlays/prod
```

## GitOps with Argo CD

The manifest `apps/wasserball-prod-argocd.yaml` shows how Argo CD can sync the production overlay from this repository into the `default` namespace. Adjust `repoURL` and `targetRevision` if your repository location or branch changes.

Because the repository is public, Argo CD does not need a repository access secret for this setup.
