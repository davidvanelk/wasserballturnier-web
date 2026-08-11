#!/usr/bin/env sh
set -eu

if [ "${COMPOSE_PROJECT_NAME:-}" = "" ]; then
  WORKTREE_NAME=$(basename "$PWD")
  SANITIZED_NAME=$(
    printf "%s" "$WORKTREE_NAME" \
      | tr '[:upper:]' '[:lower:]' \
      | tr -cs 'a-z0-9' '_'
  )
  SANITIZED_NAME=$(printf "%s" "$SANITIZED_NAME" | sed 's/^_//; s/_$//')

  if [ "$SANITIZED_NAME" = "" ]; then
    SANITIZED_NAME="default"
  fi

  COMPOSE_PROJECT_NAME="wasserball_${SANITIZED_NAME}"
fi

export COMPOSE_PROJECT_NAME
echo "Using COMPOSE_PROJECT_NAME=$COMPOSE_PROJECT_NAME"

if [ "$#" -eq 0 ]; then
  set -- up
fi

exec docker compose "$@"
