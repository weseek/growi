module "oidc_github" {
  source  = "unfunco/oidc-github/aws"

#   iam_role_name = "github-oidc-"

  github_repositories = [
    "weseek/github",
  ]
}
