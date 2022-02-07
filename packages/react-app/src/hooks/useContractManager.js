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
      addressOrName: "0x7a2088a1bFc9d81c55368AE168C2C02570cB814F",
      contractInterface: wagmiABI,
      signerOrProvider: signerProvider,
    });
  } catch (e) {
    console.log("dick");
    console.error(e);
    return;
  }

  console.log("signer", signer);
  console.log("contractManager", !!signer, !!provider, contractManager);

  return contractManager;
};
