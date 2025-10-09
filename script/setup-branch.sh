#!/bin/bash

# Continue on errors instead of exiting
set +e

# Validation function
validate_env() {
  local var_name=$1
  if [ -z "${!var_name}" ]; then
    echo -e "${RED}Error: $var_name is not set${NC}" >&2
    exit 1
  fi
}

validate_env "NEON_API_KEY"
validate_env "BRANCH_NAME"

# Create branch and role
neon branches create --name "$BRANCH_NAME" --api-key "$NEON_API_KEY"
neon roles create --name "$BRANCH_NAME" --branch "$BRANCH_NAME" --api-key "$NEON_API_KEY"

# Get the connection string for the database owner (default role)
OWNER_CONNECTION_STRING=$(neon connection-string --branch "$BRANCH_NAME" --api-key "$NEON_API_KEY" --role-name "$BRANCH_NAME" --ssl require)

# Grant permissions to the new role
echo "Granting permissions to role $BRANCH_NAME..."
psql "$OWNER_CONNECTION_STRING" <<SQL
GRANT ALL ON SCHEMA public TO "$BRANCH_NAME";
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO "$BRANCH_NAME";
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO "$BRANCH_NAME";
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO "$BRANCH_NAME";
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO "$BRANCH_NAME";
SQL
