import { Contract } from '@ethersproject/contracts';
import { AssetTypes } from '@/entities';
import networkTypes from '@/helpers/networkTypes';
import {
  ARBITRUM_ETH_ADDRESS,
  BNB_BSC_ADDRESS,
  erc20ABI,
  ETH_ADDRESS,
  MATIC_POLYGON_ADDRESS,
  OPTIMISM_ETH_ADDRESS,
} from '@/references';
import {
  convertAmountToBalanceDisplay,
  convertRawAmountToDecimalFormat,
} from '@/helpers/utilities';

const nativeAssetsPerNetwork = {
  [networkTypes.arbitrum]: ARBITRUM_ETH_ADDRESS,
  [networkTypes.goerli]: ETH_ADDRESS,
  [networkTypes.mainnet]: ETH_ADDRESS,
  [networkTypes.optimism]: OPTIMISM_ETH_ADDRESS,
  [networkTypes.polygon]: MATIC_POLYGON_ADDRESS,
  [networkTypes.bsc]: BNB_BSC_ADDRESS,
};

export function isL2Asset(type: any) {
  switch (type) {
    case AssetTypes.arbitrum:
    case AssetTypes.optimism:
    case AssetTypes.polygon:
    case AssetTypes.bsc:
    case AssetTypes.zora:
      return true;
    default:
      return false;
  }
}

export function isNativeAsset(address: any, network: any) {
  return (
    nativeAssetsPerNetwork[network]?.toLowerCase() === address?.toLowerCase()
  );
}

export async function getOnchainAssetBalance(
  { address, decimals, symbol }: any,
  userAddress: any,
  network: any,
  provider: any
) {
  // Check if it's the native chain asset
  if (isNativeAsset(address, network)) {
    return getOnchainNativeAssetBalance(
      { decimals, symbol },
      userAddress,
      provider
    );
  }
  return getOnchainTokenBalance(
    { address, decimals, symbol },
    userAddress,
    provider
  );
}

async function getOnchainTokenBalance(
  { address, decimals, symbol }: any,
  userAddress: any,
  provider: any
) {
  try {
    const tokenContract = new Contract(address, erc20ABI, provider);
    const balance = await tokenContract.balanceOf(userAddress);
    const tokenBalance = convertRawAmountToDecimalFormat(
      balance.toString(),
      decimals
    );
    const displayBalance = convertAmountToBalanceDisplay(tokenBalance, {
      // @ts-expect-error ts-migrate(2345) FIXME: Argument of type '{ address: any; decimals: any; s... Remove this comment to see the full error message
      address,
      decimals,
      symbol,
    });

    return {
      amount: tokenBalance,
      display: displayBalance,
    };
  } catch (e) {
    return null;
  }
}

async function getOnchainNativeAssetBalance(
  { decimals, symbol }: any,
  userAddress: any,
  provider: any
) {
  try {
    const balance = await provider.getBalance(userAddress);
    const tokenBalance = convertRawAmountToDecimalFormat(
      balance.toString(),
      decimals
    );
    const displayBalance = convertAmountToBalanceDisplay(tokenBalance, {
      decimals,
      symbol,
    });

    return {
      amount: tokenBalance,
      display: displayBalance,
    };
  } catch (e) {
    return null;
  }
}
