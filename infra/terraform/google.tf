resource "google_container_cluster" "default" {
  name     = var.cluster_name
  location = var.region
  enable_autopilot = true
  deletion_protection = false
}