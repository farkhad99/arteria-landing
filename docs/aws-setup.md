# AWS setup guide for Arteria Landing

## Recommended hosting choice
- Primary recommendation: ECS Fargate for production-grade reliability and simpler scaling.
- Budget MVP fallback: single EC2 instance (`t3.small`) with Docker + Nginx.

This repository includes a direct EC2 deployment workflow for fastest setup, while this guide also covers scalable ECS direction.

## 1) Create S3 bucket for project media
1. Open AWS Console -> S3 -> Create bucket.
2. Bucket name: `arteria-uploads` (or your custom value for `AWS_S3_BUCKET`).
3. Keep Object Ownership as `ACLs disabled`.
4. Keep Block Public Access enabled.
5. Create bucket.

**Public read for project files (required):** your app user (`arteria-dev`) can upload, but **visitors and Next.js Image** are anonymous. Without a public `GetObject` rule on `projects/*`, images return 403/400 on the site and in admin previews.

**Block Public Access:** edit bucket → Permissions → Block Public Access. For a public read policy on `projects/*` to work, **uncheck these two** (leave the ACL-related two **checked**):

1. *Block public access … granted through **new** public bucket or access point policies*
2. *Block public and cross-account access … through **any** public bucket or access point policies*

If the second one stays **on**, your `Principal: "*"` `GetObject` rule has no effect — images stay 403/400 even with a correct bucket policy.

**Full bucket policy** (keeps your IAM user + adds public read for published media):

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "AllowArteriaAppUser",
      "Effect": "Allow",
      "Principal": {
        "AWS": "arn:aws:iam::234951665388:user/arteria-dev"
      },
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject"
      ],
      "Resource": "arn:aws:s3:::arteria-uploads/*"
    },
    {
      "Sid": "AllowListBucket",
      "Effect": "Allow",
      "Principal": {
        "AWS": "arn:aws:iam::234951665388:user/arteria-dev"
      },
      "Action": "s3:ListBucket",
      "Resource": "arn:aws:s3:::arteria-uploads"
    },
    {
      "Sid": "PublicReadProjectMedia",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::arteria-uploads/projects/*"
    }
  ]
}
```

After saving, open one uploaded file URL in an incognito window — it should load without signing in.

### S3 CORS (required for fast admin uploads)

Uploads use **presigned URLs**: the browser sends files **directly to S3** (not through EC2). Apply the CORS config in [s3-cors.json](./s3-cors.json) on your bucket (S3 → bucket → Permissions → CORS). Add your production domain to `AllowedOrigins` if it is not listed.

Flow: `POST /api/admin/upload-url` → browser `PUT` to S3 → save `fileUrl` on the project.

Fallback proxy upload (`/api/admin/upload`) still exists but admin uses the direct path.

### Image & video on the public site

- **S3 images:** optimized via **`/_next/image`** (WebP/AVIF, responsive widths). Project cards use a small `sizes` hint (~28–52vw); the enlarged gallery requests ~92vw. Requires public `GetObject` on `projects/*` so the Next server can fetch from S3, plus `sharp` in the Docker image (already in `package.json`).

#### `"url" parameter is not allowed` (400 on `/_next/image`)

This is **not** S3 CORS. Next.js blocks the optimizer when the S3 hostname was **not** in `next.config.js` at **`next build`** time.

| Symptom | Cause |
|--------|--------|
| Admin preview works, public site 400 | Admin uses plain `<img src="https://…s3…">`; visitors use `/_next/image`, which needs an allowlisted host. |
| Direct S3 URL works in incognito, `/_next/image` 400 | Bucket policy is fine; redeploy after fixing `images.remotePatterns` / `images.domains`. |
| Still broken after policy change | Production container is still running an **old Docker image** built before config changes. Push to `main` and let deploy rebuild. |

**Checklist**

1. `AWS_REGION` and `AWS_S3_BUCKET` GitHub secrets match the bucket used in stored `fileUrl` values (e.g. `arteria-uploads.s3.eu-north-1.amazonaws.com`).
2. Push changes and run a full deploy (`docker build` on EC2 — not just `docker restart`).
3. After deploy, open in incognito:  
   `https://your-domain/_next/image?url=https%3A%2F%2Farteria-uploads.s3.eu-north-1.amazonaws.com%2Fprojects%2F<one-file>.jpg&w=640&q=75`  
   You should get an image (200), not JSON with `"url" parameter is not allowed`.
4. `npm run build` locally runs `scripts/verify-image-config.js` and fails if S3 hosts are missing from the baked allowlist.

**Current default:** project images on S3 use **`unoptimized`** (browser loads the public S3 URL directly), so they work even if production is still on an old Docker image that rejects `/_next/image`. After a successful deploy with an updated allowlist, you can set GitHub secret / env `NEXT_PUBLIC_S3_IMAGE_OPTIMIZER=true` to re-enable WebP/AVIF via `/_next/image`.

Compare build IDs: local `cat .next/BUILD_ID` vs view page source on production (`buildId` in `__NEXT_DATA__`). If they differ, production has not picked up the latest deploy.
- **S3 videos:** `<video src="https://…s3…">` (no `next/video` in Next 14). Compress MP4/WebM before upload for best performance; optional poster images are not generated automatically yet.
- **GIFs:** uploaded as `image/gif` and shown with **next/image** (same as JPEG/PNG). They are **not** treated as video. Animated GIFs must stay **unoptimized** (Next.js would strip animation if resized to WebP/AVIF).
- **Legacy non-S3 images** (e.g. Contentful): still use `/_next/image` optimization where configured.

## 2) Create RDS PostgreSQL
1. Open AWS Console -> RDS -> Create database.
2. Engine: PostgreSQL.
3. Template: Production (or Dev/Test for staging).
4. Instance class:
   - MVP: `db.t4g.micro` or `db.t3.micro`
   - Production baseline: `db.t4g.small`
5. Enable storage autoscaling.
6. Create DB name `arteria`.
7. Set master username/password and store them safely.
8. Configure VPC and Security Group to allow inbound PostgreSQL (`5432`) only from app server SG.
9. Create database.

Build `DATABASE_URL`:
`postgresql://<user>:<password>@<rds-endpoint>:5432/arteria?schema=public`

## 3) IAM user/policy for app S3 access
Create IAM policy with least privilege (replace bucket name):

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject"
      ],
      "Resource": "arn:aws:s3:::arteria-uploads/*"
    },
    {
      "Effect": "Allow",
      "Action": ["s3:ListBucket"],
      "Resource": "arn:aws:s3:::arteria-uploads"
    }
  ]
}
```

Attach policy to an IAM user (or better: IAM role when on ECS/EC2 instance profile).

## 4) Environment variables to configure
Set these on your runtime host:
- `DATABASE_URL`
- `ADMIN_PASSWORD`
- `ADMIN_SESSION_SECRET`
- `AWS_REGION`
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_S3_BUCKET`
- `TELEGRAM_BOT_TOKEN`
- `TELEGRAM_CHAT_ID`
- GitHub secrets per `docs/github-secrets.md` (no Contentful)

## 5) Run database migration
After first deploy:
1. `npx prisma generate`
2. `npx prisma migrate deploy`

## 6) Telegram bot setup
1. Create bot via [@BotFather](https://t.me/BotFather), get token.
2. Add bot to your target chat/channel.
3. Obtain chat ID and set `TELEGRAM_CHAT_ID`.

## 7) ECS Fargate direction (recommended)
- Build image in GitHub Actions and push to ECR.
- ECS service with at least 2 tasks behind ALB.
- Store secrets in AWS Secrets Manager.
- Use task role for S3 and optional CloudWatch logging.

If you want a next step, convert `deploy-ec2.yml` into `deploy-ecs.yml` with ECR push + ECS service update.
