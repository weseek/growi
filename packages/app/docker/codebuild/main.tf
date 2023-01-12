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

resource "aws_s3_bucket" "growi-official-image-builder-cache" {
  bucket = "growi-official-image-builder-cache"
}

resource "aws_s3_bucket_acl" "growi-official-image-builder-cache" {
  bucket = aws_s3_bucket.growi-official-image-builder-cache.id
  acl    = "private"
}

resource "aws_iam_role" "growi-official-image-builder" {
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

resource "aws_iam_role_policy" "growi-official-image-builder" {
  role = aws_iam_role.growi-official-image-builder.name

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
        "${aws_s3_bucket.growi-official-image-builder-cache.arn}",
        "${aws_s3_bucket.growi-official-image-builder-cache.arn}/*"
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

resource "aws_codebuild_project" "growi-official-image-builder" {
  name           = "growi-official-image-builder"
  description    = "The CodeBuild Project for GROWI official docker image"

  service_role = aws_iam_role.growi-official-image-builder.arn

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
  }
  source_version = "refs/heads/support/build-with-codebuild"

  build_batch_config {
    service_role = aws_iam_role.growi-official-image-builder.arn
  }

}