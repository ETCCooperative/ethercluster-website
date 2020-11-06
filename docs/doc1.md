---
id: doc1
title: Introduction
# sidebar_label: Introduction
# slug: /
---

The goal of this documentation guide is to help you build your own Ethercluster RPC infrastructure step-by-step and learn a lot of DevOps tools used to build it. This design currently uses a Google-Cloud Cluster zone to building your infrastructure. The interest in the future is to make Ethercluster a highly-available cluster across multiple cloud-providers and geographical locations.

## Motivation

The goal of Ethercluster is to make reliable node infrastructure open-source and accessible to everyone. The project began for the Ethereum Classic community so others can run nodes and provide reliable connectivity to the blockchain. Many major node infrastructure providers such as Infura, do not provide Ethereum Classic RPC endpoints. So, Ethercluster wanted to make an open-source alternative to Infura where anyone can manage their own node infrastructure. 

Ethercluster utilizes [Hyperledger Besu](https://besu.hyperledger.org/en/stable/) as the protocol providing client. Therefore, you can use Ethercluster for Ethereum Classic, Ethereum, and related testnets. You just need to modify the volume size (ETH is nearly 2TB on full node).

Ethercluster was created by ETC Cooperative, a 501(c)(3) public charity focused on the development of Ethereum Classic.