import { useContract } from "wagmi";
import wagmiABI from "../abi/wagmi.json";
import { ethers } from "../../../hardhat/node_modules/ethers/lib";
import { WAGMI_CONTRACT_ADDRESS } from "../constants/contract";

export const useContractManager = signer => {
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const metamaskSigner = provider.getSigner();

  const signerProvider = metamaskSigner ?? provider;
  let contractManager;

  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    contractManager = useContract({
      addressOrName: WAGMI_CONTRACT_ADDRESS,
      contractInterface: wagmiABI,
      signerOrProvider: signerProvider,
    });
  } catch (e) {
    console.error(e);
    return;
  }

  if (!signerProvider) {
    return;
  }

  return contractManager;
};
