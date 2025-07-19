import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, ExternalLink, CrossIcon } from "lucide-react";
import Link from "next/link";
import { Address, createWalletClient, custom, toHex } from "viem";
import { IpMetadata, RegisterIpResponse } from "@story-protocol/react-sdk";
import { ConnectKitButton } from "connectkit";
import { useStory } from "@/lib/context/AppContext";
import { useAccount } from "wagmi";
import { uploadJSONToIPFS } from "@/app/actions";
import { createHash } from "crypto";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { createCreatorClient } from "@zoralabs/protocol-sdk";
import { createPublicClient, http, Chain } from "viem";
import { mainnet, zoraSepolia } from "viem/chains";
import { useWriteContract } from "wagmi";
import { config } from "./providers";
import { switchChain } from "viem/actions";

interface AssetData {
  url: string;
  uri: string;
  nftMinted: boolean;
  nftIpfsHash: string;
  nftHash: string;
  ipIpfsHash: string;
  registeredIp: boolean;
  tokenId: string;
  collectionMintedOnZora: boolean;
  zoraMintPageLink: string;
  storyExplorerLink: string;
}

const Asset = ({
  asset,
  refreshAssets,
}: {
  asset: AssetData;
  refreshAssets: any;
}) => {
  const { toast } = useToast();
  const { isConnected, address, chain } = useAccount();
  const { mintNFT, client } = useStory();
  const [form, setForm] = useState({ title: "", description: "" });
  const [collectionName, setCollectionName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isCreatingCollectionOnZora, setIsCreatingCollectionOnZora] =
    useState(false);
  const { writeContract } = useWriteContract();

  const updateAssetInStorage = (updatedAsset: AssetData) => {
    const existingAssets = JSON.parse(localStorage.getItem("myAssets") || "[]");
    const updatedAssets = existingAssets.map((asset: AssetData) =>
      asset.url === updatedAsset.url ? updatedAsset : asset
    );
    localStorage.setItem("myAssets", JSON.stringify(updatedAssets));

    refreshAssets();
  };
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prevForm) => ({ ...prevForm, [name]: value }));
  };

  const registerIP = async (
    tokenId: string,
    nftIpfsHash: string,
    nftHash: string,
    title: string,
    description: string,
    asset: AssetData
  ) => {
    if (!form.title || !form.description) {
      alert("Please fill in both title and description.");
      return;
    }

    if (chain?.id !== 1513) {
      const client = createWalletClient({
        chain: mainnet,
        transport: custom(window.ethereum!),
      });
      await switchChain(client, { id: 1513 });
    }

    try {
      const ipMetadata: IpMetadata = {
        title: title,
        description: description,
      };
      console.log("Ip metadata:", ipMetadata);
      setIsLoading(true);

      // upload to ipfs
      const ipIpfsHash = await uploadJSONToIPFS(ipMetadata);
      const ipHash = createHash("sha256")
        .update(JSON.stringify(ipMetadata))
        .digest("hex");

      // @ts-ignore
      const response: RegisterIpResponse = await client.ipAsset.register({
        nftContract: "0xd2a4a4Cb40357773b658BECc66A6c165FD9Fc485", // Story NFT contract address
        tokenId: tokenId, // your NFT token ID
        ipMetadata: {
          ipMetadataURI: `https://ipfs.io/ipfs/${ipIpfsHash}`,
          ipMetadataHash: `0x${ipHash}`,
          nftMetadataURI: `https://ipfs.io/ipfs/${nftIpfsHash}`,
          nftMetadataHash: `0x${nftHash}`,
        },
        txOptions: { waitForTransaction: true },
      });

      console.log(`Root IPA created at tx hash ${response?.txHash}`);

      toast({
        title: "IP Registered",
        description: `IP registered with ID : ${response.ipId}`,
      });

      const updatedAsset = {
        ...asset,
        ipIpfsHash: ipIpfsHash,
        registeredIp: true,
        storyExplorerLink: `https://explorer.story.foundation/ipa/${response.ipId}`,
      };

      updateAssetInStorage(updatedAsset);
      setForm({ title: "", description: "" });
      setIsLoading(false);
    } catch (error) {
      console.error("Error minting NFT", error);
      toast({
        title: "Error registering IP",
        description: "There was an error registering the IP",
        variant: "destructive",
      });
      setForm({ title: "", description: "" });
      setIsLoading(false);
    }
  };

  const mintStoryNFT = async (uri: string, asset: AssetData) => {
    // check if chain is iliad and switch if not
    if (chain?.id !== 1513) {
      const client = createWalletClient({
        chain: mainnet,
        transport: custom(window.ethereum!),
      });
      await switchChain(client, { id: 1513 });
    }

    try {
      // save object to ipfs - get name and description from user inside dialog
      const nftMetadata = {
        name: "NFT representing ownership of IP Asset",
        description: "This NFT represents ownership of an IP Asset",
        image: uri,
      };

      setIsLoading(true);

      const nftIpfsHash = await uploadJSONToIPFS(nftMetadata);
      const nftHash = createHash("sha256")
        .update(JSON.stringify(nftMetadata))
        .digest("hex");
      console.log(`NFT hash ${nftHash}`);

      const tokenId = await mintNFT(
        address as Address,
        `https://ipfs.io/ipfs/${nftIpfsHash}`
      );
      console.log(`NFT minted with tokenId ${tokenId}`);

      toast({
        title: "NFT Minted",
        description: `NFT minted with tokenId ${tokenId}`,
      });

      // Update asset after minting
      const updatedAsset = {
        ...asset,
        nftMinted: true,
        nftIpfsHash,
        nftHash,
        tokenId,
      };
      updateAssetInStorage(updatedAsset);
      setIsLoading(false);
    } catch (error) {
      console.error("Error minting NFT", error);
      toast({
        title: "Error minting NFT",
        description: "There was an error minting the NFT",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  const handleCreateCollectionOnZora = async (
    collectionName: string,
    asset: AssetData
  ) => {
    setIsCreatingCollectionOnZora(true);
    if (chain?.id !== zoraSepolia.id) {
      const client = createWalletClient({
        chain: mainnet,
        transport: custom(window.ethereum!),
      });
      await switchChain(client, { id: zoraSepolia.id });
    }

    try {
      // create zora client
      const publicClient = createPublicClient({
        chain: zoraSepolia as Chain,
        transport: http(),
      });

      const creatorClient = createCreatorClient({
        chainId: zoraSepolia.id,
        publicClient,
      });

      const { parameters, contractAddress } = await creatorClient.create1155({
        // the contract will be created at a deterministic address
        contract: {
          // contract name
          name: collectionName, // TODO: get collection name from user
          // contract metadata uri
          uri: asset.uri,
        },
        token: {
          tokenMetadataURI: `ipfs://${asset.nftIpfsHash}`,
        },
        // account to execute the transaction (the creator)
        account: address!,
      });

      console.log("Parameters", parameters);

      writeContract(parameters, {
        onSettled: (txHash) => {
          if (!txHash) {
            console.error("Transaction not settled");
            return;
          }
          console.log("Transaction settled");
          toast({
            title: "Collection created on Zora",
            description: "Collection created on Zora",
          });

          setIsCreatingCollectionOnZora(false);
          console.log("Collection created on Zora", contractAddress);
        },
        onSuccess: (txHash) => {
          console.log("Transaction hash", txHash);
          const updatedAsset = {
            ...asset,
            collectionMintedOnZora: true,
            zoraMintPageLink: ` https://testnet.zora.co/collect/zsep:${contractAddress}/1`,
          };

          updateAssetInStorage(updatedAsset);
        },
        onError: (error) => {
          console.error("Error creating collection on Zora", error);
          toast({
            title: "Error creating collection on Zora",
            description: "There was an error creating the collection on Zora",
            variant: "destructive",
          });
          setIsCreatingCollectionOnZora(false);
        },
      });
    } catch (error) {
      console.error("Error creating collection on Zora", error);
      toast({
        title: "Error creating collection on Zora",
        description: "There was an error creating the collection on Zora",
        variant: "destructive",
      });
      setIsCreatingCollectionOnZora(false);
    }
  };

  return (
    <Card className="w-full max-w-sm mx-auto">
      <CardContent className="p-6">
        <div className="relative mb-4 aspect-square bg-gray-100 rounded-lg overflow-hidden">
          <video
            className="object-cover w-full h-full"
            src={asset.url}
            controls
            preload="metadata"
          />
        </div>
        <div className="space-y-2">
          {asset.nftMinted ? (
            <>
              {asset.registeredIp ? (
                <div className="flex flex-col gap-2">
                  <Button className="w-full" variant="outline" asChild>
                    <Link target="__blank" href={asset.storyExplorerLink}>
                      IP already minted
                      <ExternalLink className="w-4 h-4 ml-2" />
                    </Link>
                  </Button>
                  {asset.collectionMintedOnZora ? (
                    <Button className="w-full" variant="outline" asChild>
                      <Link target="__blank" href={asset.zoraMintPageLink}>
                        Go to Zora Mint Page
                        <ExternalLink className="w-4 h-4 ml-2" />
                      </Link>
                    </Button>
                  ) : (
                    <>
                      {isConnected ? (
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button className="w-full" variant="outline">
                              Create collection on Zora
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="w-full max-w-md">
                            <DialogHeader>
                              <DialogTitle>
                                {" "}
                                Create collection on Zora
                              </DialogTitle>
                            </DialogHeader>
                            <form
                              onSubmit={(e) => {
                                e.preventDefault();
                                handleCreateCollectionOnZora(
                                  collectionName,
                                  asset
                                );
                              }}
                            >
                              <div className="flex flex-col gap-4">
                                <Label htmlFor="collectionName">
                                  Collection Name
                                </Label>
                                <Input
                                  id="collectionName"
                                  name="collectionName"
                                  placeholder="Enter collection name"
                                  value={collectionName}
                                  onChange={(e) =>
                                    setCollectionName(e.target.value)
                                  }
                                  required
                                />
                              </div>
                              <DialogFooter>
                                <Button
                                  type="submit"
                                  disabled={isCreatingCollectionOnZora}
                                  className="w-full mt-4"
                                >
                                  {isCreatingCollectionOnZora
                                    ? "Creating collection..."
                                    : "Create collection"}
                                </Button>
                              </DialogFooter>
                            </form>
                          </DialogContent>
                        </Dialog>
                      ) : (
                        <div className="w-full flex justify-center">
                          <ConnectKitButton />
                        </div>
                      )}
                    </>
                  )}
                </div>
              ) : (
                <Dialog>
                  <DialogTrigger asChild>
                    <Button className="w-full" variant="outline">
                      Register IP for Asset
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="w-full max-w-md">
                    <DialogHeader>
                      <DialogTitle>Register IP for Asset</DialogTitle>
                    </DialogHeader>
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        registerIP(
                          asset.tokenId,
                          asset.nftIpfsHash,
                          asset.nftHash,
                          form.title,
                          form.description,
                          asset
                        );
                      }}
                    >
                      <div className="flex flex-col gap-4">
                        <Label htmlFor="title">Title</Label>
                        <Input
                          id="title"
                          name="title"
                          placeholder="Enter title"
                          value={form.title}
                          onChange={handleFormChange}
                          required
                        />
                        <Label htmlFor="description">Description</Label>
                        <Input
                          id="description"
                          name="description"
                          placeholder="Enter description"
                          value={form.description}
                          onChange={handleFormChange}
                          required
                        />
                      </div>
                      <DialogFooter>
                        <Button
                          type="submit"
                          className="w-full mt-4"
                          disabled={isLoading}
                        >
                          {isLoading ? "Registering IP..." : "Register IP"}
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              )}
            </>
          ) : isConnected ? (
            <Button
              onClick={() => {
                mintStoryNFT(asset.url, asset);
              }}
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? "Minting NFT..." : "Mint Story NFT"}
            </Button>
          ) : (
            <div className="w-full flex justify-center">
              <ConnectKitButton />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default Asset;
