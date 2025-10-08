# This deploy script pushes production to staging

bun run db:push

bun run check

# deploy to production
bun dotenvx run -f .env.production -f .env -- vercel --prod
