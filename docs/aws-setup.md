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

Add a bucket policy for read access only if you need public direct URLs from the app. Prefer CloudFront signed delivery for stricter control in production.

Admin media uploads go through `/api/admin/upload` on your Next.js server (server-side `PutObject` to S3). You do **not** need S3 CORS rules for browser uploads.

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
