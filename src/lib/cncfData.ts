export type CNCFMaturity = 'graduated' | 'incubating' | 'sandbox'

export interface CNCFProject {
  repo: string        // "org/name" e.g. "kubernetes/kubernetes"
  name: string        // Display name: "Kubernetes"
  maturity: CNCFMaturity
  category: CNCFCategory
  homepage: string    // e.g. "https://kubernetes.io"
  pillars?: CNCFPillarId[]  // Optional tag(s) into the featured "AI era" pillars below
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

// The 5 pillars pushing cloud native + AI forward (see castrojo/peoplehub#25).
// This is the primary curation feature: distinct from — and cutting across —
// the regular landscape categories above.
export interface CNCFPillar {
  id: string
  label: string
  icon: string
  description: string
}

export const CNCF_PILLARS: CNCFPillar[] = [
  {
    id: 'ai-infra',
    label: 'AI Workloads & Infrastructure',
    icon: '🤖',
    description: 'Orchestrating model training and inference via Kubernetes-native tools.',
  },
  {
    id: 'platform-engineering',
    label: 'Platform Engineering',
    icon: '🛤️',
    description: '"Golden Paths" for AI researchers that reduce cognitive load and automate model deployment.',
  },
  {
    id: 'security',
    label: 'Cloud Native Security',
    icon: '🔒',
    description: 'Zero Trust for AI: model supply chain security and privacy guardrails.',
  },
  {
    id: 'observability',
    label: 'Observability',
    icon: '📡',
    description: 'eBPF and OpenTelemetry to monitor model drift, GPU health, and token usage.',
  },
  {
    id: 'sustainability',
    label: 'Sustainability & FinOps',
    icon: '🌱',
    description: 'Carbon-aware scheduling and granular cost attribution for GPU-heavy workloads.',
  },
]

export type CNCFPillarId = (typeof CNCF_PILLARS)[number]['id']

export const CNCF_GRADUATED: CNCFProject[] = [
  { repo: 'kubernetes/kubernetes',                     name: 'Kubernetes',         maturity: 'graduated', category: 'Orchestration', homepage: 'https://kubernetes.io' },
  { repo: 'prometheus/prometheus',                     name: 'Prometheus',         maturity: 'graduated', category: 'Observability', homepage: 'https://prometheus.io', pillars: ['observability'] },
  { repo: 'envoyproxy/envoy',                          name: 'Envoy',              maturity: 'graduated', category: 'Networking',    homepage: 'https://envoyproxy.io' },
  { repo: 'coredns/coredns',                           name: 'CoreDNS',            maturity: 'graduated', category: 'Networking',    homepage: 'https://coredns.io' },
  { repo: 'containerd/containerd',                     name: 'containerd',         maturity: 'graduated', category: 'Runtime',       homepage: 'https://containerd.io' },
  { repo: 'fluxcd/flux2',                              name: 'Flux',               maturity: 'graduated', category: 'App Delivery',  homepage: 'https://fluxcd.io' },
  { repo: 'jaegertracing/jaeger',                      name: 'Jaeger',             maturity: 'graduated', category: 'Observability', homepage: 'https://jaegertracing.io', pillars: ['observability'] },
  { repo: 'vitessio/vitess',                           name: 'Vitess',             maturity: 'graduated', category: 'Storage',       homepage: 'https://vitess.io' },
  { repo: 'open-policy-agent/opa',                     name: 'Open Policy Agent',  maturity: 'graduated', category: 'Security',      homepage: 'https://openpolicyagent.org', pillars: ['security'] },
  { repo: 'thanos-io/thanos',                          name: 'Thanos',             maturity: 'graduated', category: 'Observability', homepage: 'https://thanos.io' },
  { repo: 'rook/rook',                                 name: 'Rook',               maturity: 'graduated', category: 'Storage',       homepage: 'https://rook.io' },
  { repo: 'helm/helm',                                 name: 'Helm',               maturity: 'graduated', category: 'App Delivery',  homepage: 'https://helm.sh' },
  { repo: 'goharbor/harbor',                           name: 'Harbor',             maturity: 'graduated', category: 'Runtime',       homepage: 'https://goharbor.io' },
  { repo: 'etcd-io/etcd',                              name: 'etcd',               maturity: 'graduated', category: 'Orchestration', homepage: 'https://etcd.io' },
  { repo: 'open-telemetry/opentelemetry-collector',    name: 'OpenTelemetry',      maturity: 'graduated', category: 'Observability', homepage: 'https://opentelemetry.io', pillars: ['observability'] },
  { repo: 'argoproj/argo-cd',                          name: 'Argo CD',            maturity: 'graduated', category: 'App Delivery',  homepage: 'https://argoproj.github.io/cd' },
  { repo: 'falcosecurity/falco',                       name: 'Falco',              maturity: 'graduated', category: 'Security',      homepage: 'https://falco.org' },
  { repo: 'linkerd/linkerd2',                          name: 'Linkerd',            maturity: 'graduated', category: 'Networking',    homepage: 'https://linkerd.io' },
  { repo: 'cilium/cilium',                             name: 'Cilium',             maturity: 'graduated', category: 'Networking',    homepage: 'https://cilium.io' },
  { repo: 'spiffe/spire',                              name: 'SPIRE',              maturity: 'graduated', category: 'Security',      homepage: 'https://spiffe.io', pillars: ['security'] },
  { repo: 'longhorn/longhorn',                         name: 'Longhorn',           maturity: 'graduated', category: 'Storage',       homepage: 'https://longhorn.io' },
  { repo: 'kedacore/keda',                             name: 'KEDA',               maturity: 'graduated', category: 'Orchestration', homepage: 'https://keda.sh' },
  { repo: 'cert-manager/cert-manager',                 name: 'cert-manager',       maturity: 'graduated', category: 'Security',      homepage: 'https://cert-manager.io' },
  { repo: 'grpc/grpc',                                 name: 'gRPC',               maturity: 'graduated', category: 'Networking',    homepage: 'https://grpc.io' },
  { repo: 'fluent/fluentd',                            name: 'Fluentd',            maturity: 'graduated', category: 'Observability', homepage: 'https://fluentd.org' },
  { repo: 'backstage/backstage',                       name: 'Backstage',          maturity: 'graduated', category: 'Platform',      homepage: 'https://backstage.io', pillars: ['platform-engineering'] },
  { repo: 'dapr/dapr',                                 name: 'Dapr',               maturity: 'graduated', category: 'Platform',      homepage: 'https://dapr.io', pillars: ['platform-engineering'] },
  { repo: 'sigstore/cosign',                           name: 'Sigstore',           maturity: 'graduated', category: 'Security',      homepage: 'https://sigstore.dev', pillars: ['security'] },
  { repo: 'crossplane/crossplane',                     name: 'Crossplane',         maturity: 'graduated', category: 'Platform',      homepage: 'https://crossplane.io', pillars: ['platform-engineering'] },
  { repo: 'kubeflow/kubeflow',                         name: 'KubeFlow',           maturity: 'graduated', category: 'AI/ML',         homepage: 'https://kubeflow.org', pillars: ['ai-infra'] },
]

export const CNCF_INCUBATING: CNCFProject[] = [
  { repo: 'argoproj/argo-workflows',         name: 'Argo Workflows',   maturity: 'incubating', category: 'App Delivery',  homepage: 'https://argoproj.github.io/workflows' },
  { repo: 'knative/serving',                 name: 'Knative',          maturity: 'incubating', category: 'App Delivery',  homepage: 'https://knative.dev' },
  { repo: 'kyverno/kyverno',                 name: 'Kyverno',          maturity: 'incubating', category: 'Security',      homepage: 'https://kyverno.io', pillars: ['security'] },
  { repo: 'openkruise/kruise',               name: 'OpenKruise',       maturity: 'incubating', category: 'Orchestration', homepage: 'https://openkruise.io' },
  { repo: 'volcano-sh/volcano',              name: 'Volcano',          maturity: 'incubating', category: 'AI/ML',         homepage: 'https://volcano.sh', pillars: ['ai-infra'] },
  { repo: 'telepresenceio/telepresence',     name: 'Telepresence',     maturity: 'incubating', category: 'App Delivery',  homepage: 'https://telepresence.io' },
  { repo: 'chaos-mesh/chaos-mesh',           name: 'Chaos Mesh',       maturity: 'incubating', category: 'Platform',      homepage: 'https://chaos-mesh.org' },
  { repo: 'kubevela/kubevela',               name: 'KubeVela',         maturity: 'incubating', category: 'App Delivery',  homepage: 'https://kubevela.io', pillars: ['platform-engineering'] },
  { repo: 'nats-io/nats-server',             name: 'NATS',             maturity: 'incubating', category: 'Networking',    homepage: 'https://nats.io' },
  { repo: 'cloudevents/spec',                name: 'CloudEvents',      maturity: 'incubating', category: 'Platform',      homepage: 'https://cloudevents.io' },
  { repo: 'notaryproject/notation',          name: 'Notary',           maturity: 'incubating', category: 'Security',      homepage: 'https://notaryproject.dev', pillars: ['security'] },
  { repo: 'opencontainers/runc',             name: 'OCI (runc)',       maturity: 'incubating', category: 'Runtime',       homepage: 'https://opencontainers.org' },
  { repo: 'cni-plugins/cni-plugins',         name: 'CNI',              maturity: 'incubating', category: 'Networking',    homepage: 'https://cni.dev' },
  { repo: 'in-toto/in-toto',                 name: 'in-toto',          maturity: 'incubating', category: 'Security',      homepage: 'https://in-toto.io', pillars: ['security'] },
  { repo: 'pixie-io/pixie',                  name: 'Pixie',            maturity: 'incubating', category: 'Observability', homepage: 'https://px.dev', pillars: ['observability'] },
]

// Early-stage projects driving the AI-era pillars (see castrojo/peoplehub#25).
export const CNCF_SANDBOX: CNCFProject[] = [
  { repo: 'kubernetes-sigs/kueue',   name: 'Kueue',     maturity: 'incubating', category: 'AI/ML',        homepage: 'https://kueue.sigs.k8s.io', pillars: ['ai-infra'] },
  { repo: 'llm-d/llm-d',             name: 'llm-d',     maturity: 'sandbox',    category: 'AI/ML',        homepage: 'https://llm-d.ai', pillars: ['ai-infra'] },
  { repo: 'sustainable-computing-io/kepler', name: 'Kepler', maturity: 'sandbox', category: 'Observability', homepage: 'https://sustainable-computing.io', pillars: ['observability', 'sustainability'] },
  { repo: 'opencost/opencost',       name: 'OpenCost',  maturity: 'sandbox',    category: 'Platform',     homepage: 'https://opencost.io', pillars: ['sustainability'] },
]

export const CNCF_PROJECTS = [...CNCF_GRADUATED, ...CNCF_INCUBATING, ...CNCF_SANDBOX]

// Build lookup map by repo full name (lowercase for case-insensitive matching)
const _repoMap = new Map(CNCF_PROJECTS.map(p => [p.repo.toLowerCase(), p]))

export function getCNCFProject(repoFullName: string): CNCFProject | undefined {
  return _repoMap.get(repoFullName.toLowerCase())
}

export function getCNCFCategory(repoFullName: string): CNCFCategory | undefined {
  return getCNCFProject(repoFullName)?.category
}

export function getCNCFPillars(repoFullName: string): CNCFPillarId[] {
  return getCNCFProject(repoFullName)?.pillars ?? []
}
