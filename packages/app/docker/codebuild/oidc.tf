resource "aws_iam_policy" "policy" {
  policy = <<POLICY
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "codebuild:StartBuild",
        "codebuild:StopBuild",
        "codebuild:RetryBuild"
      ],
      "Resource": [
        "*"
      ]
    }
  ]
}
POLICY
}

module "oidc_github" {
  source  = "unfunco/oidc-github/aws"

  iam_role_name = "GitHubOIDC-for-growi"
  iam_role_policy_arns = [
    aws_iam_policy.policy.arn
  ]

  github_repositories = [
    "weseek/growi",
  ]
}
