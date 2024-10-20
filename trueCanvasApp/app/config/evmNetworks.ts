const polygonZkEVMLogo = 'https://www.alchemy.com/_next/image?url=https%3A%2F%2Fwww.datocms-assets.com%2F105223%2F1700666769-polygon-zkevm-testnet-logo.png&w=96&q=75';
const arbitrumSepoliaLogo = 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/arbitrum/info/logo.png';
const storyLogo = 'https://explorer.story.foundation/_next/static/media/favicon.94f4df06.png';
export const evmNetworks = [
    {
      // polygon zk evm cardona
      blockExplorerUrls: ['https://cardona-zkevm.polygonscan.com/'],
      chainId: 2442,
      chainName: 'Polygon ZK EVM Cardona',
      iconUrls: [polygonZkEVMLogo],
      name: 'Polygon ZK EVM Cardona',
      nativeCurrency: {
        decimals: 18,
        name: 'ETH',
        symbol: 'ETH',
        iconUrl: polygonZkEVMLogo,
      },
      networkId: 2442,
      rpcUrls: ['https://rpc.cardona.zkevm-rpc.com'],
      vanityName: 'Polygon ZK EVM Cardona',
    },
    {
      // arbitrum sepolia
      blockExplorerUrls: ['https://sepolia.arbiscan.io/'],
      chainId: 421614,
      chainName: 'Arbitrum Sepolia',
      iconUrls: [arbitrumSepoliaLogo],
      name: 'Arbitrum Sepolia',
      nativeCurrency: {
        decimals: 18,
        name: 'ETH',
        symbol: 'ETH',
        iconUrl: arbitrumSepoliaLogo,
      },
      networkId: 421614,
      rpcUrls: ['https://api.zan.top/arb-sepolia'],
      vanityName: 'Arbitrum Sepolia',
    },
    {
      // story
      blockExplorerUrls: ['https://testnet.storyscan.xyz/'],
      chainId: 1513,
      chainName: 'Story',
      iconUrls: [storyLogo],
      name: 'Story',
      nativeCurrency: {
        decimals: 18,
        name: 'IP',
        symbol: 'IP',
        iconUrl: storyLogo,
      },
      networkId: 1513,
      rpcUrls: ['https://testnet.storyrpc.io/'],
      vanityName: 'Story',
    }
  ];
