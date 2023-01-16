module "codebuild" {
  source = "github.com/weseek/terraform-aws-codebuild"

  name                = "growi-official-image-builder"
  description         = "The CodeBuild Project for GROWI official docker image"

  artifact_type       = "NO_ARTIFACTS"

  source_type         = "GITHUB"
  source_location     = "https://github.com/weseek/growi.git"
  source_version      = "refs/heads/support/build-with-codebuild"
  git_clone_depth     = 1


  buildspec           = "packages/app/docker/codebuild/buildspec/root.yml"

  # https://docs.aws.amazon.com/codebuild/latest/userguide/build-env-ref-available.html
  build_image         = "aws/codebuild/standard:6.0"
  build_compute_type  = "BUILD_GENERAL1_LARGE"

  # These attributes are optional, used as ENV variables when building Docker images and pushing them to ECR
  # For more info:
  # http://docs.aws.amazon.com/codebuild/latest/userguide/sample-docker.html
  # https://www.terraform.io/docs/providers/aws/r/codebuild_project.html

  privileged_mode     = true

  cache_type          = "LOCAL"
  local_cache_modes   = ["LOCAL_DOCKER_LAYER_CACHE", "LOCAL_CUSTOM_CACHE"]

}
