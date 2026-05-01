export const SEED_USERS = [
  'caniszczyk',      // CNCF CTO
  'castrojo',        // Universal Blue / CNCF contributor
  'thockin',         // Google / Kubernetes
  'bgrant0607',      // Google / Kubernetes
  'jbeda',           // Kubernetes co-creator
  'brendandburns',   // Kubernetes co-creator
  'liggitt',         // Google / Kubernetes
  'kelseyhightower', // Google / cloud native
  'dims',            // IBM / CNCF TOC
  'nikhita',         // CNCF staff / Kubernetes
  'deads2k',         // Red Hat / Kubernetes
  'smarterclayton',  // Red Hat / OpenShift
  'eddiezane',       // CNCF staff
  'lachie83',        // Microsoft / CNCF
  'dlorenc',         // Chainguard / Sigstore
  'hawkw',           // Buoyant / Linkerd
  'jessfraz',        // Cloud native contributor
  'aojea',           // Google / Kubernetes networking
  'sttts',           // Red Hat / Kubernetes
  'spiffxp',         // Google / Kubernetes testing
  'vincepri',        // CNCF contributor
  'justinsb',        // Kubernetes contributor
  'bobbypage',       // Kubernetes contributor
  'timja',           // Jenkins / CD Foundation
  'ryantking',       // Cloud native contributor
] as const

export type SeedUser = (typeof SEED_USERS)[number]
