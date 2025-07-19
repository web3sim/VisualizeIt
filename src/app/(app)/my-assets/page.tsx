"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, ExternalLink, CrossIcon } from "lucide-react";
import Link from "next/link";
import { Address, toHex } from "viem";
import {
  useIpAsset,
  useNftClient,
  PIL_TYPE,
  IpMetadata,
  RegisterIpResponse,
} from "@story-protocol/react-sdk";
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
import Asset from "@/components/asset";

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

export default function MyAssets() {
  const [assets, setAssets] = useState<AssetData[]>([]);

  function refreshAssets() {
    const storedAssets = localStorage.getItem("myAssets");
    if (storedAssets) {
      setAssets(JSON.parse(storedAssets));
    }
  }

  useEffect(() => {
    refreshAssets();
  }, []);

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {assets.length === 0 ? (
        <div className="text-center col-span-full mt-40">
          <p className="text-2xl font-semibold text-muted-foreground">
            No Saved Assets Found
          </p>
        </div>
      ) : (
        assets.map((asset, index) => (
          <Asset key={index} asset={asset} refreshAssets={refreshAssets} />
        ))
      )}
    </div>
  );
}
