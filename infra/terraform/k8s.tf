
# kafka
resource "kubectl_manifest" "zookeeper_depl" {
  yaml_body  = file("../k8s/kafka/zookeeper-depl.yaml")
  depends_on = [google_container_cluster.default]
}
resource "kubectl_manifest" "zookeeper_pvc" {
  yaml_body  = file("../k8s/kafka/zookeeper-pvc.yaml")
  depends_on = [google_container_cluster.default]
}
resource "kubectl_manifest" "zookeeper_srv" {
  yaml_body  = file("../k8s/kafka/zookeeper-srv.yaml")
  depends_on = [google_container_cluster.default]
}

resource "kubectl_manifest" "kafka_depl" {
  yaml_body  = file("../k8s/kafka/kafka-depl.yaml")
  depends_on = [google_container_cluster.default,kubectl_manifest.zookeeper_depl]
}
resource "kubectl_manifest" "srv" {
  yaml_body  = file("../k8s/kafka/kafka-srv.yaml")
  depends_on = [google_container_cluster.default,kubectl_manifest.zookeeper_depl]
}
resource "kubectl_manifest" "kafka_pvc" {
  yaml_body  = file("../k8s/kafka/kafka-pvc.yaml")
  depends_on = [google_container_cluster.default,kubectl_manifest.zookeeper_depl]
}

# redis

resource "kubectl_manifest" "redis_depl" {
  yaml_body  = file("../k8s/redis/redis-depl.yaml")
  depends_on = [google_container_cluster.default]
}
resource "kubectl_manifest" "redis_pvc" {
  yaml_body  = file("../k8s/redis/redis-pvc.yaml")
  depends_on = [google_container_cluster.default]
}
resource "kubectl_manifest" "redis_srv" {
  yaml_body  = file("../k8s/redis/redis-srv.yaml")
  depends_on = [google_container_cluster.default]
}

#Secrets and configmap

resource "kubectl_manifest" "main-configMap" {
  yaml_body  = file("../k8s/secrets/main-server-configMap.yaml")
  depends_on = [google_container_cluster.default]
}

resource "kubectl_manifest" "main-secret" {
  yaml_body  = file("../k8s/secrets/main-server-secret.yaml")
  depends_on = [google_container_cluster.default]
}

resource "kubectl_manifest" "transcoder-configMap" {
  yaml_body  = file("../k8s/secrets/transcoding-server-configMap.yaml")
  depends_on = [google_container_cluster.default]
}

resource "kubectl_manifest" "transcoder-secret" {
  yaml_body  = file("../k8s/secrets/transcoding-server-secret.yaml")
  depends_on = [google_container_cluster.default]
}

resource "kubectl_manifest" "backend_config" {
  yaml_body  = file("../k8s/backend-config.yaml")
  depends_on = [google_container_cluster.default]
}

#services

resource "kubectl_manifest" "main_depl" {
  yaml_body  = file("../k8s/services/main/main-depl.yaml")
  depends_on = [google_container_cluster.default,kubectl_manifest.backend_config, kubectl_manifest.kafka_depl, kubectl_manifest.main-configMap, kubectl_manifest.main-secret]
}
resource "kubectl_manifest" "main_srv" {
  yaml_body  = file("../k8s/services/main/main-srv.yaml")
  depends_on = [google_container_cluster.default,kubectl_manifest.backend_config, kubectl_manifest.kafka_depl, kubectl_manifest.main-configMap, kubectl_manifest.main-secret]
}

resource "kubectl_manifest" "transcoding_depl" {
  yaml_body  = file("../k8s/services/transcoder/transcoding-depl.yaml")
  depends_on = [google_container_cluster.default, kubectl_manifest.kafka_depl, kubectl_manifest.transcoder-configMap, kubectl_manifest.transcoder-secret]
}

#cert and ingress

resource "kubectl_manifest" "cert" {
  yaml_body  = file("../k8s/cert/managed-cert.yaml")
  depends_on = [google_container_cluster.default,kubectl_manifest.main_depl,kubectl_manifest.transcoding_depl]
}

resource "kubectl_manifest" "ingress" {
  yaml_body  = file("../k8s/ingress/ingress.yaml")
  depends_on = [google_container_cluster.default,kubectl_manifest.cert]
}
