import { VersionInfo } from '@start9labs/start-sdk'

export const v_1_4_3_1 = VersionInfo.of({
  version: '1.4.3.1:1',
  releaseNotes: {
    en_US:
      'Fixes a start-sdk daemon-supervisor race that left ElectrumX stuck in a stopped state after restart (collapses electrumx\u2019s four prep oneshots behind a single prep-complete gate to avoid concurrent HealthDaemon.updateStatus invocations resolving out of order). Also reconfigures the WS/WSS interfaces so StartOS no longer auto-wraps them with an extra SSL frontend \u2014 ElectrumX already serves WS/WSS natively, and the auto-addSsl wrapper was the only lxcbr0 ipv4 address exposed for those bindings, making the WS/WSS Tor onion services unreachable from sibling LXC containers.',
  },
  migrations: {
    up: async ({ effects }) => {},
    down: async ({ effects }) => {},
  },
})
