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
- Write-back method: `argocd`

The `digest` strategy is important here because `latest` is a mutable tag. Argo CD Image Updater can use it to detect when the digest behind `latest` changes.

## Included Services

- `wasserball-web` as a Deployment and Service on port 80
- `matomo` as a Deployment and Service on port 80
- `matomo-db` as a StatefulSet with persistent storage

## Required Adjustments Before the First Rollout

1. Set the web image in `overlays/prod/kustomization.yaml` to your actual registry image.
2. Change the hosts in the ingress files to your real domains.
3. Replace the placeholder secrets in `base/web-secret.yaml.example`, `base/matomo-secret.yaml.example`, and `base/matomo-db-secret.yaml.example` with real values, or replace them entirely with Sealed Secrets, SOPS, or External Secrets.
4. Adjust the storage class, resource requests, and limits for your cluster if needed.
5. Install Argo CD Image Updater in the cluster.

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
