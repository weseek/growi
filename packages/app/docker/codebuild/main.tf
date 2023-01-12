terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 4.16"
    }
  }

  required_version = ">= 1.2.0"
}

provider "aws" {
  profile = "weseek"
  region  = "ap-northeast-1"
}

resource "aws_s3_bucket" "s3_bucket" {
  bucket = "growi-official-image-builder-cache"
}

resource "aws_s3_bucket_acl" "s3_bucket_acl" {
  bucket = aws_s3_bucket.s3_bucket.id
  acl    = "private"
}

resource "aws_s3_bucket_lifecycle_configuration" "s3_bucket_lifecycle" {
  bucket = aws_s3_bucket.s3_bucket.id

  rule {
    id     = "auto-expire"
    status = "Enabled"

    expiration {
      days = 60
    }
    noncurrent_version_expiration {
      noncurrent_days = 3
    }
  }

}

resource "aws_iam_role" "iam_role" {
  name = "growi-official-image-builder"

  assume_role_policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Service": "codebuild.amazonaws.com"
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
EOF
}

resource "aws_secretsmanager_secret" "secret" {
  name = "growi/official-image-builder"
}

resource "aws_secretsmanager_secret_version" "main" {
  secret_id     = aws_secretsmanager_secret.secret.id
  secret_string = "CHANGE THIS"

  lifecycle {
    ignore_changes = [secret_string, version_stages]
  }
}

resource "aws_iam_role_policy" "growi-official-image-builder" {
  role = aws_iam_role.iam_role.name

  policy = <<POLICY
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Resource": [
        "*"
      ],
      "Action": [
        "logs:CreateLogGroup",
        "logs:CreateLogStream",
        "logs:PutLogEvents"
      ]
    },
    {
      "Effect": "Allow",
      "Action": [
        "s3:*"
      ],
      "Resource": [
        "${aws_s3_bucket.s3_bucket.arn}",
        "${aws_s3_bucket.s3_bucket.arn}/*"
      ]
    },
    {
      "Effect": "Allow",
      "Action": [
        "secretsmanager:GetResourcePolicy",
        "secretsmanager:GetSecretValue",
        "secretsmanager:DescribeSecret",
        "secretsmanager:ListSecretVersionIds"
      ],
      "Resource": [
        "${aws_secretsmanager_secret.secret.arn}"
      ]
    },
    {
      "Effect": "Allow",
      "Action": [
        "codebuild:StartBuild",
        "codebuild:StopBuild",
        "codebuild:RetryBuild",
        "codebuild:CreateReportGroup",
        "codebuild:CreateReport",
        "codebuild:UpdateReport",
        "codebuild:BatchPutTestCases",
        "codebuild:BatchPutCodeCoverages"
      ],
      "Resource": [
        "*"
      ]
    }
  ]
}
POLICY
}

resource "aws_codebuild_project" "codebuild" {
  name           = "growi-official-image-builder"
  description    = "The CodeBuild Project for GROWI official docker image"

  service_role = aws_iam_role.iam_role.arn
  build_batch_config {
    service_role = aws_iam_role.iam_role.arn
  }

  artifacts {
    type = "NO_ARTIFACTS"
  }

  environment {
    compute_type                = "BUILD_GENERAL1_LARGE"
    image                       = "aws/codebuild/standard:6.0"
    type                        = "LINUX_CONTAINER"
    privileged_mode             = true
  }

  source {
    # type = "NO_SOURCE"
    type = "GITHUB"
    location = "https://github.com/weseek/growi.git"
    git_clone_depth = 1
    buildspec = "packages/app/docker/codebuild/buildspec.yml"
  }
  source_version = "refs/heads/support/build-with-codebuild"

  cache {
    type  = "LOCAL"
    modes = ["LOCAL_DOCKER_LAYER_CACHE", "LOCAL_CUSTOM_CACHE"]
  }

}
