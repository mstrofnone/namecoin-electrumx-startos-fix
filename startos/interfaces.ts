import { sdk } from './sdk'
import { i18n } from './i18n'
import {
  electrumSslInterfaceId,
  electrumSslPort,
  electrumTcpInterfaceId,
  electrumTcpPort,
  electrumWsInterfaceId,
  electrumWsPort,
  electrumWssInterfaceId,
  electrumWssPort,
} from './utils'

export const setInterfaces = sdk.setupInterfaces(async ({ effects }) => {
  // ---- TCP (plaintext electrum) ----
  const tcpMulti = sdk.MultiHost.of(effects, 'electrum-tcp')
  const tcpOrigin = await tcpMulti.bindPort(electrumTcpPort, {
    protocol: null,
    preferredExternalPort: electrumTcpPort,
    addSsl: null,
    secure: { ssl: false },
  })
  const tcp = sdk.createInterface(effects, {
    name: i18n('Electrum TCP Interface'),
    id: electrumTcpInterfaceId,
    description: i18n('Plaintext Electrum protocol for wallet connections'),
    type: 'p2p',
    masked: false,
    schemeOverride: { ssl: null, noSsl: null },
    username: null,
    path: '',
    query: {},
  })
  const tcpReceipt = await tcpOrigin.export([tcp])

  // ---- SSL (electrum over TLS) ----
  const sslMulti = sdk.MultiHost.of(effects, 'electrum-ssl')
  const sslOrigin = await sslMulti.bindPort(electrumSslPort, {
    protocol: null,
    preferredExternalPort: electrumSslPort,
    addSsl: null,
    secure: { ssl: true },
  })
  const ssl = sdk.createInterface(effects, {
    name: i18n('Electrum SSL Interface'),
    id: electrumSslInterfaceId,
    description: i18n('SSL-encrypted Electrum protocol for wallet connections'),
    type: 'p2p',
    masked: false,
    schemeOverride: { ssl: null, noSsl: null },
    username: null,
    path: '',
    query: {},
  })
  const sslReceipt = await sslOrigin.export([ssl])

  // ---- WS (Electrum over WebSocket — needs websockets<11 pin) ----
  // protocol=null + addSsl=null so StartOS does NOT wrap the upstream
  // plaintext WS port with an auto-generated TLS frontend. ElectrumX
  // serves WS natively on 50003; we want the lxcbr0 NAT to expose that
  // port directly so Tor onion services can blind-forward to it.
  // The previous `protocol: 'http'` triggered StartOS's addSsl wrapping,
  // which made the only lxcbr0-reachable address an SSL-wrapped sibling
  // port — leaving onion → plaintext-WS unreachable from sibling LXCs.
  const wsMulti = sdk.MultiHost.of(effects, 'electrum-ws')
  const wsOrigin = await wsMulti.bindPort(electrumWsPort, {
    protocol: null,
    preferredExternalPort: electrumWsPort,
    addSsl: null,
    secure: { ssl: false },
  })
  const ws = sdk.createInterface(effects, {
    name: i18n('Electrum WebSocket Interface'),
    id: electrumWsInterfaceId,
    description: i18n('Electrum protocol over WebSocket (ws://)'),
    type: 'api',
    masked: false,
    schemeOverride: null,
    username: null,
    path: '',
    query: {},
  })
  const wsReceipt = await wsOrigin.export([ws])

  // ---- WSS (Electrum over secure WebSocket) ----
  // ElectrumX serves WSS natively (its own TLS, same cert as the SSL
  // interface). Same reason as the WS interface above: declare native
  // SSL via secure.ssl=true and disable addSsl so the lxcbr0 NAT exposes
  // the upstream port directly. Onion services and external clients see
  // the same TLS endpoint.
  const wssMulti = sdk.MultiHost.of(effects, 'electrum-wss')
  const wssOrigin = await wssMulti.bindPort(electrumWssPort, {
    protocol: null,
    preferredExternalPort: electrumWssPort,
    addSsl: null,
    secure: { ssl: true },
  })
  const wss = sdk.createInterface(effects, {
    name: i18n('Electrum Secure WebSocket Interface'),
    id: electrumWssInterfaceId,
    description: i18n('Electrum protocol over secure WebSocket (wss://)'),
    type: 'api',
    masked: false,
    schemeOverride: null,
    username: null,
    path: '',
    query: {},
  })
  const wssReceipt = await wssOrigin.export([wss])

  return [tcpReceipt, sslReceipt, wsReceipt, wssReceipt]
})
