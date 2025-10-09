
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

neon connection-string --branch "$BRANCH_NAME" --role-name "$BRANCH_NAME" --api-key "$NEON_API_KEY"
