export interface CNCFProject {
  repo: string        // "org/name" e.g. "kubernetes/kubernetes"
  name: string        // Display name: "Kubernetes"
  maturity: 'graduated' | 'incubating'
  category: CNCFCategory
  homepage: string    // e.g. "https://kubernetes.io"
}

export const CNCF_CATEGORIES = [
  'Orchestration',
  'App Delivery',
  'Observability',
  'Security',
  'Networking',
  'Runtime',
  'Storage',
  'AI/ML',
  'Platform',
] as const

export type CNCFCategory = (typeof CNCF_CATEGORIES)[number]

export const CNCF_GRADUATED: CNCFProject[] = [
  { repo: 'kubernetes/kubernetes',                     name: 'Kubernetes',         maturity: 'graduated', category: 'Orchestration', homepage: 'https://kubernetes.io' },
  { repo: 'prometheus/prometheus',                     name: 'Prometheus',         maturity: 'graduated', category: 'Observability', homepage: 'https://prometheus.io' },
  { repo: 'envoyproxy/envoy',                          name: 'Envoy',              maturity: 'graduated', category: 'Networking',    homepage: 'https://envoyproxy.io' },
  { repo: 'coredns/coredns',                           name: 'CoreDNS',            maturity: 'graduated', category: 'Networking',    homepage: 'https://coredns.io' },
  { repo: 'containerd/containerd',                     name: 'containerd',         maturity: 'graduated', category: 'Runtime',       homepage: 'https://containerd.io' },
  { repo: 'fluxcd/flux2',                              name: 'Flux',               maturity: 'graduated', category: 'App Delivery',  homepage: 'https://fluxcd.io' },
  { repo: 'jaegertracing/jaeger',                      name: 'Jaeger',             maturity: 'graduated', category: 'Observability', homepage: 'https://jaegertracing.io' },
  { repo: 'vitessio/vitess',                           name: 'Vitess',             maturity: 'graduated', category: 'Storage',       homepage: 'https://vitess.io' },
  { repo: 'open-policy-agent/opa',                     name: 'Open Policy Agent',  maturity: 'graduated', category: 'Security',      homepage: 'https://openpolicyagent.org' },
  { repo: 'thanos-io/thanos',                          name: 'Thanos',             maturity: 'graduated', category: 'Observability', homepage: 'https://thanos.io' },
  { repo: 'rook/rook',                                 name: 'Rook',               maturity: 'graduated', category: 'Storage',       homepage: 'https://rook.io' },
  { repo: 'helm/helm',                                 name: 'Helm',               maturity: 'graduated', category: 'App Delivery',  homepage: 'https://helm.sh' },
  { repo: 'goharbor/harbor',                           name: 'Harbor',             maturity: 'graduated', category: 'Runtime',       homepage: 'https://goharbor.io' },
  { repo: 'etcd-io/etcd',                              name: 'etcd',               maturity: 'graduated', category: 'Orchestration', homepage: 'https://etcd.io' },
  { repo: 'open-telemetry/opentelemetry-collector',    name: 'OpenTelemetry',      maturity: 'graduated', category: 'Observability', homepage: 'https://opentelemetry.io' },
  { repo: 'argoproj/argo-cd',                          name: 'Argo CD',            maturity: 'graduated', category: 'App Delivery',  homepage: 'https://argoproj.github.io/cd' },
  { repo: 'falcosecurity/falco',                       name: 'Falco',              maturity: 'graduated', category: 'Security',      homepage: 'https://falco.org' },
  { repo: 'linkerd/linkerd2',                          name: 'Linkerd',            maturity: 'graduated', category: 'Networking',    homepage: 'https://linkerd.io' },
  { repo: 'cilium/cilium',                             name: 'Cilium',             maturity: 'graduated', category: 'Networking',    homepage: 'https://cilium.io' },
  { repo: 'spiffe/spire',                              name: 'SPIRE',              maturity: 'graduated', category: 'Security',      homepage: 'https://spiffe.io' },
  { repo: 'longhorn/longhorn',                         name: 'Longhorn',           maturity: 'graduated', category: 'Storage',       homepage: 'https://longhorn.io' },
  { repo: 'kedacore/keda',                             name: 'KEDA',               maturity: 'graduated', category: 'Orchestration', homepage: 'https://keda.sh' },
  { repo: 'cert-manager/cert-manager',                 name: 'cert-manager',       maturity: 'graduated', category: 'Security',      homepage: 'https://cert-manager.io' },
  { repo: 'grpc/grpc',                                 name: 'gRPC',               maturity: 'graduated', category: 'Networking',    homepage: 'https://grpc.io' },
  { repo: 'fluent/fluentd',                            name: 'Fluentd',            maturity: 'graduated', category: 'Observability', homepage: 'https://fluentd.org' },
  { repo: 'backstage/backstage',                       name: 'Backstage',          maturity: 'graduated', category: 'Platform',      homepage: 'https://backstage.io' },
  { repo: 'dapr/dapr',                                 name: 'Dapr',               maturity: 'graduated', category: 'Platform',      homepage: 'https://dapr.io' },
  { repo: 'sigstore/cosign',                           name: 'Sigstore',           maturity: 'graduated', category: 'Security',      homepage: 'https://sigstore.dev' },
  { repo: 'crossplane/crossplane',                     name: 'Crossplane',         maturity: 'graduated', category: 'Platform',      homepage: 'https://crossplane.io' },
  { repo: 'kubeflow/kubeflow',                         name: 'KubeFlow',           maturity: 'graduated', category: 'AI/ML',         homepage: 'https://kubeflow.org' },
]

export const CNCF_INCUBATING: CNCFProject[] = [
  { repo: 'argoproj/argo-workflows',         name: 'Argo Workflows',   maturity: 'incubating', category: 'App Delivery',  homepage: 'https://argoproj.github.io/workflows' },
  { repo: 'knative/serving',                 name: 'Knative',          maturity: 'incubating', category: 'App Delivery',  homepage: 'https://knative.dev' },
  { repo: 'kyverno/kyverno',                 name: 'Kyverno',          maturity: 'incubating', category: 'Security',      homepage: 'https://kyverno.io' },
  { repo: 'openkruise/kruise',               name: 'OpenKruise',       maturity: 'incubating', category: 'Orchestration', homepage: 'https://openkruise.io' },
  { repo: 'volcano-sh/volcano',              name: 'Volcano',          maturity: 'incubating', category: 'AI/ML',         homepage: 'https://volcano.sh' },
  { repo: 'telepresenceio/telepresence',     name: 'Telepresence',     maturity: 'incubating', category: 'App Delivery',  homepage: 'https://telepresence.io' },
  { repo: 'chaos-mesh/chaos-mesh',           name: 'Chaos Mesh',       maturity: 'incubating', category: 'Platform',      homepage: 'https://chaos-mesh.org' },
  { repo: 'kubevela/kubevela',               name: 'KubeVela',         maturity: 'incubating', category: 'App Delivery',  homepage: 'https://kubevela.io' },
  { repo: 'nats-io/nats-server',             name: 'NATS',             maturity: 'incubating', category: 'Networking',    homepage: 'https://nats.io' },
  { repo: 'cloudevents/spec',                name: 'CloudEvents',      maturity: 'incubating', category: 'Platform',      homepage: 'https://cloudevents.io' },
  { repo: 'notaryproject/notation',          name: 'Notary',           maturity: 'incubating', category: 'Security',      homepage: 'https://notaryproject.dev' },
  { repo: 'opencontainers/runc',             name: 'OCI (runc)',       maturity: 'incubating', category: 'Runtime',       homepage: 'https://opencontainers.org' },
  { repo: 'cni-plugins/cni-plugins',         name: 'CNI',              maturity: 'incubating', category: 'Networking',    homepage: 'https://cni.dev' },
  { repo: 'in-toto/in-toto',                 name: 'in-toto',          maturity: 'incubating', category: 'Security',      homepage: 'https://in-toto.io' },
  { repo: 'pixie-io/pixie',                  name: 'Pixie',            maturity: 'incubating', category: 'Observability', homepage: 'https://px.dev' },
]

export const CNCF_PROJECTS = [...CNCF_GRADUATED, ...CNCF_INCUBATING]

// Build lookup map by repo full name (lowercase for case-insensitive matching)
const _repoMap = new Map(CNCF_PROJECTS.map(p => [p.repo.toLowerCase(), p]))

export function getCNCFProject(repoFullName: string): CNCFProject | undefined {
  return _repoMap.get(repoFullName.toLowerCase())
}

export function getCNCFCategory(repoFullName: string): CNCFCategory | undefined {
  return getCNCFProject(repoFullName)?.category
}
