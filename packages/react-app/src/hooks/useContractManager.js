import { useContract, useProvider, useSigner } from "wagmi";
import wagmiABI from "../abi/wagmi.json";

export const useContractManager = () => {
  const [{ data: signer }] = useSigner();
  const provider = useProvider();

  const signerProvider = signer ?? provider;
  let contractManager;

  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    contractManager = useContract({
      addressOrName: "0x3Aa5ebB10DC797CAC828524e59A333d0A371443c",
      contractInterface: wagmiABI,
      signerOrProvider: signerProvider,
    });
  } catch (e) {
    console.log("dick");
    console.error(e);
    return;
  }

  console.log("contractManager", !!signer, !!provider, contractManager);

  return contractManager;
};
