import type { BankQuestion } from "../quiz-bank.ts";

export const testQuestions = [
  {
    "id": "itcs217-l09-q01",
    "subject": "test",
    "topic": "Data Link Layer",
    "objectiveId": "L09-O01",
    "type": "single",
    "difficulty": "Easy",
    "cognitiveLevel": "Understand",
    "prompt": "Which statement best describes the data-link layer’s role when sending an IP packet over a link?",
    "answers": [
      "It encapsulates the IP packet in a frame appropriate for the link.",
      "It assigns the destination application a port number.",
      "It converts an IP packet into a new end-to-end transport connection.",
      "It selects the complete end-to-end route across the Internet."
    ],
    "correct": [
      0
    ],
    "explanation": "The sender encapsulates a network-layer datagram in a link-specific frame; the physical layer carries its signals.",
    "optionExplanations": [
      "Correct: the data-link layer frames the network-layer datagram for transmission on the current link.",
      "Port numbers identify application endpoints, not the framing role of the data-link layer.",
      "Transport connections are not created by data-link framing.",
      "End-to-end routing is a network-layer concern, not link framing."
    ],
    "sourceRefs": [
      {
        "file": "ITCS217-Lecture 9-Intro-to Data-Link-Layer-2026(1).pdf",
        "page": 6
      }
    ],
    "status": "draft",
    "version": 1,
    "lecture": "Lecture 9"
  },
  {
    "id": "itcs217-l09-q02",
    "subject": "test",
    "topic": "Framing and Encapsulation",
    "objectiveId": "L09-O02",
    "type": "boolean",
    "difficulty": "Easy",
    "cognitiveLevel": "Understand",
    "prompt": "When a packet is forwarded by a router onto a different link, the router removes the incoming link-layer frame and creates a new frame for the outgoing link.",
    "answers": [
      "True",
      "False"
    ],
    "correct": [
      0
    ],
    "explanation": "Link-layer encapsulation is hop-by-hop, while the network-layer datagram is forwarded across links.",
    "optionExplanations": [
      "Correct: the lecture explicitly describes removing the incoming frame and creating a new one for the next link.",
      "Incorrect: the router does not normally forward the original link-layer frame unchanged onto the next link."
    ],
    "sourceRefs": [
      {
        "file": "ITCS217-Lecture 9-Intro-to Data-Link-Layer-2026(1).pdf",
        "page": 6
      },
      {
        "file": "ITCS217-Lecture 9-Intro-to Data-Link-Layer-2026(1).pdf",
        "page": 18
      }
    ],
    "status": "draft",
    "version": 1,
    "lecture": "Lecture 9"
  },
  {
    "id": "itcs217-l09-q03",
    "subject": "test",
    "topic": "Error Control",
    "objectiveId": "L09-O03",
    "type": "multiple",
    "difficulty": "Medium",
    "cognitiveLevel": "Understand",
    "prompt": "Which statements about data-link error control are supported by the lecture? Select all that apply.",
    "answers": [
      "A receiver can use error detection to recognize corrupted received data.",
      "Forward Error Correction can allow a receiver to correct some errors.",
      "A Frame Check Sequence can be used for error detection.",
      "Every detected frame error must be corrected locally without retransmission."
    ],
    "correct": [
      0,
      1,
      2
    ],
    "explanation": "Error detection and correction are different capabilities. FCS/CRC supports detection; some systems use FEC or retransmission for recovery.",
    "optionExplanations": [
      "Correct: error detection helps a receiver recognize that received bits may be wrong.",
      "Correct: the lecture identifies receiver-side Forward Error Correction.",
      "Correct: the lecture identifies FCS/CRC as a link-layer error-detection mechanism.",
      "Incorrect: the lecture also lists optional ACKs and retransmission; it does not require local correction of every detected error."
    ],
    "sourceRefs": [
      {
        "file": "ITCS217-Lecture 9-Intro-to Data-Link-Layer-2026(1).pdf",
        "page": 9
      },
      {
        "file": "ITCS217-Lecture 9-Intro-to Data-Link-Layer-2026(1).pdf",
        "page": 15
      }
    ],
    "status": "draft",
    "version": 1,
    "lecture": "Lecture 9"
  },
  {
    "id": "itcs217-l09-q04",
    "subject": "test",
    "topic": "Flow Control",
    "objectiveId": "L09-O04",
    "type": "single",
    "difficulty": "Medium",
    "cognitiveLevel": "Apply",
    "prompt": "A sender transmits frames faster than a receiver can process them. The receiver’s buffer fills up. What problem does flow control aim to prevent?",
    "answers": [
      "The receiver being overwhelmed and dropping incoming frames.",
      "The sender choosing an incorrect destination IP address.",
      "Two stations selecting the same MAC address.",
      "A router selecting a longer network route."
    ],
    "correct": [
      0
    ],
    "explanation": "The lecture notes that insufficient receiver capacity can cause buffer overflow and force newly arriving frames to be dropped.",
    "optionExplanations": [
      "Correct: flow control regulates sending so a receiver is not overwhelmed by incoming data.",
      "Destination IP selection is unrelated to receiver buffer overflow.",
      "MAC-address duplication is not the buffer-management problem described.",
      "Routing decisions do not solve a receiver’s incoming-frame buffer overflow."
    ],
    "sourceRefs": [
      {
        "file": "ITCS217-Lecture 9-Intro-to Data-Link-Layer-2026(1).pdf",
        "page": 10
      },
      {
        "file": "ITCS217-Lecture 9-Intro-to Data-Link-Layer-2026(1).pdf",
        "page": 11
      }
    ],
    "status": "draft",
    "version": 1,
    "lecture": "Lecture 9"
  },
  {
    "id": "itcs217-l09-q05",
    "subject": "test",
    "topic": "Media Access Control",
    "objectiveId": "L09-O05",
    "type": "single",
    "difficulty": "Medium",
    "cognitiveLevel": "Apply",
    "prompt": "Several stations share a communication medium and try to transmit at the same time. Which data-link function is specifically intended to coordinate their access?",
    "answers": [
      "Media access control (MAC).",
      "Dynamic Host Configuration Protocol (DHCP).",
      "Address Resolution Protocol (ARP).",
      "Forward Error Correction (FEC)."
    ],
    "correct": [
      0
    ],
    "explanation": "The lecture describes contention and collisions on shared media and introduces MAC as the access-control mechanism.",
    "optionExplanations": [
      "Correct: MAC coordinates stations competing for access to a shared medium.",
      "DHCP supplies network configuration information rather than scheduling access to a shared medium.",
      "ARP resolves link-layer addresses, not medium-access contention.",
      "FEC addresses transmission errors rather than coordinating transmitters."
    ],
    "sourceRefs": [
      {
        "file": "ITCS217-Lecture 9-Intro-to Data-Link-Layer-2026(1).pdf",
        "page": 12
      },
      {
        "file": "ITCS217-Lecture 9-Intro-to Data-Link-Layer-2026(1).pdf",
        "page": 14
      },
      {
        "file": "ITCS217-Lecture 9-Intro-to Data-Link-Layer-2026(1).pdf",
        "page": 15
      }
    ],
    "status": "draft",
    "version": 1,
    "lecture": "Lecture 9"
  },
  {
    "id": "itcs217-l09-q06",
    "subject": "test",
    "topic": "HDLC",
    "objectiveId": "L09-O06",
    "type": "multiple",
    "difficulty": "Hard",
    "cognitiveLevel": "Analyze",
    "prompt": "Which statements correctly describe the HDLC modes presented in the lecture? Select all that apply.",
    "answers": [
      "In NRM, a secondary station needs permission from the primary before transmitting to it.",
      "In ARM, a secondary station may initiate a message.",
      "In ABM, both stations may send and receive over a full-duplex line.",
      "In NRM, the secondary can transmit to the primary at any time without permission."
    ],
    "correct": [
      0,
      1,
      2
    ],
    "explanation": "The lecture contrasts NRM’s primary-controlled access, ARM’s secondary initiation, and ABM’s balanced communication.",
    "optionExplanations": [
      "Correct: NRM requires the primary to grant permission before a secondary transmits.",
      "Correct: ARM permits the secondary to initiate a message.",
      "Correct: ABM permits both stations to send and receive over a full-duplex line.",
      "Incorrect: this contradicts the primary-controlled transmission rule of NRM."
    ],
    "sourceRefs": [
      {
        "file": "ITCS217-Lecture 9-Intro-to Data-Link-Layer-2026(1).pdf",
        "page": 20
      },
      {
        "file": "ITCS217-Lecture 9-Intro-to Data-Link-Layer-2026(1).pdf",
        "page": 21
      }
    ],
    "status": "draft",
    "version": 1,
    "lecture": "Lecture 9"
  },
  {
    "id": "itcs217-l09-q07",
    "subject": "test",
    "topic": "MAC Addressing and Casting",
    "objectiveId": "L09-O07",
    "type": "single",
    "difficulty": "Medium",
    "cognitiveLevel": "Apply",
    "prompt": "A host sends an Ethernet ARP request to discover a local device’s MAC address. Which destination MAC address is used for the broadcast request?",
    "answers": [
      "FF:FF:FF:FF:FF:FF",
      "00:00:00:00:00:00",
      "The target device’s unknown unicast MAC address",
      "The sender’s own unicast MAC address"
    ],
    "correct": [
      0
    ],
    "explanation": "The lecture lists the all-ones MAC address for broadcast and identifies ARP requests as a broadcast application.",
    "optionExplanations": [
      "Correct: the Ethernet broadcast destination is FF:FF:FF:FF:FF:FF.",
      "All-zero MAC is not the Ethernet broadcast address.",
      "The target MAC is precisely what the host is trying to discover.",
      "The sender’s MAC identifies the source, not the broadcast destination."
    ],
    "sourceRefs": [
      {
        "file": "ITCS217-Lecture 9-Intro-to Data-Link-Layer-2026(1).pdf",
        "page": 28
      },
      {
        "file": "ITCS217-Lecture 9-Intro-to Data-Link-Layer-2026(1).pdf",
        "page": 29
      },
      {
        "file": "ITCS217-Lecture 9-Intro-to Data-Link-Layer-2026(1).pdf",
        "page": 48
      }
    ],
    "status": "draft",
    "version": 1,
    "lecture": "Lecture 9"
  },
  {
    "id": "itcs217-l09-q08",
    "subject": "test",
    "topic": "DHCP",
    "objectiveId": "L09-O08",
    "type": "single",
    "difficulty": "Medium",
    "cognitiveLevel": "Understand",
    "prompt": "Which sequence matches the DHCP DORA exchange shown in the lecture?",
    "answers": [
      "Discover → Offer → Request → ACK",
      "Discover → Request → Offer → ACK",
      "Offer → Discover → ACK → Request",
      "Request → ACK → Discover → Offer"
    ],
    "correct": [
      0
    ],
    "explanation": "DHCP provides IP configuration such as address, subnet mask, and gateway; the lecture depicts the DORA sequence.",
    "optionExplanations": [
      "Correct: DORA stands for Discover, Offer, Request, Acknowledgment.",
      "Incorrect: the server’s Offer precedes the client’s Request in the depicted exchange.",
      "Incorrect: a client’s Discover initiates the exchange rather than following an Offer.",
      "Incorrect: the exchange does not begin with Request and ACK."
    ],
    "sourceRefs": [
      {
        "file": "ITCS217-Lecture 9-Intro-to Data-Link-Layer-2026(1).pdf",
        "page": 35
      },
      {
        "file": "ITCS217-Lecture 9-Intro-to Data-Link-Layer-2026(1).pdf",
        "page": 36
      }
    ],
    "status": "draft",
    "version": 1,
    "lecture": "Lecture 9"
  },
  {
    "id": "itcs217-l09-q09",
    "subject": "test",
    "topic": "Switching and Routing",
    "objectiveId": "L09-O09",
    "type": "single",
    "difficulty": "Hard",
    "cognitiveLevel": "Analyze",
    "prompt": "A frame reaches a Layer 2 switch, then a router, on its way to a host in a different IP subnet. Which description best matches the lecture’s distinction between the two devices?",
    "answers": [
      "The switch forwards using a destination MAC address; the router forwards based on the destination IP address and creates a frame for the next link.",
      "The switch forwards using the destination IP address; the router forwards using the destination port number.",
      "Both devices select their next hop using only the destination MAC address and preserve the same frame.",
      "The switch creates a new IP packet; the router forwards only by checking the Ethernet FCS."
    ],
    "correct": [
      0
    ],
    "explanation": "The lecture contrasts Layer 2 switching by MAC address with Layer 3 routing by IP address and describes hop-by-hop reframing.",
    "optionExplanations": [
      "Correct: the switch uses link-layer MAC forwarding, while the router uses network-layer IP routing and re-encapsulates for the next link.",
      "Incorrect: the lecture associates switches with MAC addresses and routers with IP addresses; ports identify applications.",
      "Incorrect: routing is based on IP and the incoming link-layer frame is replaced at the router.",
      "Incorrect: switches do not create a new IP packet for forwarding, and FCS is for error detection."
    ],
    "sourceRefs": [
      {
        "file": "ITCS217-Lecture 9-Intro-to Data-Link-Layer-2026(1).pdf",
        "page": 6
      },
      {
        "file": "ITCS217-Lecture 9-Intro-to Data-Link-Layer-2026(1).pdf",
        "page": 44
      },
      {
        "file": "ITCS217-Lecture 9-Intro-to Data-Link-Layer-2026(1).pdf",
        "page": 45
      },
      {
        "file": "ITCS217-Lecture 9-Intro-to Data-Link-Layer-2026(1).pdf",
        "page": 46
      },
      {
        "file": "ITCS217-Lecture 9-Intro-to Data-Link-Layer-2026(1).pdf",
        "page": 47
      }
    ],
    "status": "draft",
    "version": 1,
    "lecture": "Lecture 9"
  },
  {
    "id": "itcs217-l09-q10",
    "subject": "test",
    "topic": "ARP Across Networks",
    "objectiveId": "L09-O10",
    "type": "single",
    "difficulty": "Hard",
    "cognitiveLevel": "Apply",
    "prompt": "Alice needs to send an IP packet to Bob on another subnet. Alice knows the default gateway’s IP address but not its MAC address. Which address should Alice resolve with ARP to send the first Ethernet frame?",
    "answers": [
      "The MAC address of her local default gateway interface.",
      "The MAC address of Bob’s remote network interface.",
      "The MAC address of every router on the path.",
      "The MAC address of the remote DHCP server."
    ],
    "correct": [
      0
    ],
    "explanation": "The lecture’s different-network ARP example shows Alice resolving R1’s local MAC, while later routers resolve addresses for their respective outgoing links.",
    "optionExplanations": [
      "Correct: Alice uses ARP for the next-hop gateway MAC on her local link.",
      "Incorrect: Alice does not need Bob’s remote MAC address to send the first local Ethernet frame.",
      "Incorrect: Alice resolves only the local next hop, not every router along the route.",
      "Incorrect: DHCP configuration is not the next-hop link-layer destination for this packet."
    ],
    "sourceRefs": [
      {
        "file": "ITCS217-Lecture 9-Intro-to Data-Link-Layer-2026(1).pdf",
        "page": 52
      },
      {
        "file": "ITCS217-Lecture 9-Intro-to Data-Link-Layer-2026(1).pdf",
        "page": 53
      },
      {
        "file": "ITCS217-Lecture 9-Intro-to Data-Link-Layer-2026(1).pdf",
        "page": 54
      }
    ],
    "status": "draft",
    "version": 1,
    "lecture": "Lecture 9"
  }
] satisfies readonly BankQuestion[];
