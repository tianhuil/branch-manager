#!/bin/bash

if [ -z "$1" ]; then
  echo "Usage: $0 <branch-name>"
  exit 1
fi

BRANCH_NAME="$1"

neon branches create --name "$BRANCH_NAME"
neon roles create --name "$BRANCH_NAME" --branch "$BRANCH_NAME"
neon connection-string --branch "$BRANCH_NAME" --role-name "$BRANCH_NAME"
