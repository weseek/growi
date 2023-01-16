module "oidc_github" {
  source  = "unfunco/oidc-github/aws"

  iam_role_name = "GitHubOIDC-for-growi"

  github_repositories = [
    "weseek/growi",
  ]
}
