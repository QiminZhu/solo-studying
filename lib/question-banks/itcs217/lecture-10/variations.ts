import type { BankQuestion } from "../../../quiz-bank.ts";

export const lecture10VariationQuestions = [
  {
    id: "L10-1-Q01-A",
    subject: "ITCS217_Computer Data Communication",
    topic: "Lecture 10 · Framing",
    objectiveId: "PROV-L10-1-O01",
    type: "single",
    difficulty: "Medium",
    cognitiveLevel: "Apply",
    prompt:
      "A receiver sees an uninterrupted bit stream. What link-layer task identifies separate transmission units?",
    answers: ["DHCP leasing", "Framing", "Routing"],
    correct: [1],
    explanation:
      "Framing marks or determines the boundaries of link-layer transmission units.",
    optionExplanations: [
      "DHCP leasing configures IP addresses, not bit-stream boundaries.",
      "Framing marks or determines the boundaries of link-layer transmission units.",
      "Routing selects paths rather than frame boundaries.",
    ],
    sourceRefs: [
      {
        file: "Lecture 10_ Part 1_ Attempt review _ ICT My Courses.pdf",
        page: 1,
      },
      {
        file: "ITCS217-Lecture-10-Flow-control-and-Error-Control-2026.pdf",
        page: 7,
      },
    ],
    status: "draft",
    version: 1,
    tags: ["original:L10-1-Q01", "variation:A", "provisional-objective"],
    lecture: "Lecture 10",
  },
  {
    id: "L10-1-Q01-B",
    subject: "ITCS217_Computer Data Communication",
    topic: "Lecture 10 · Framing",
    objectiveId: "PROV-L10-1-O01",
    type: "single",
    difficulty: "Medium",
    cognitiveLevel: "Apply",
    prompt:
      "What problem would occur if a receiver could not identify frame boundaries?",
    answers: [
      "It could not reliably separate successive link-layer frames",
      "It would automatically increase the physical bit rate",
      "Every packet would acquire a new destination IP",
    ],
    correct: [0],
    explanation: "Boundaries distinguish where each frame begins and ends.",
    optionExplanations: [
      "Boundaries distinguish where each frame begins and ends.",
      "Missing boundaries do not increase the physical transmission rate.",
      "Framing does not assign destination IP addresses.",
    ],
    sourceRefs: [
      {
        file: "Lecture 10_ Part 1_ Attempt review _ ICT My Courses.pdf",
        page: 1,
      },
      {
        file: "ITCS217-Lecture-10-Flow-control-and-Error-Control-2026.pdf",
        page: 7,
      },
    ],
    status: "draft",
    version: 1,
    tags: ["original:L10-1-Q01", "variation:B", "provisional-objective"],
    lecture: "Lecture 10",
  },
  {
    id: "L10-1-Q02-A",
    subject: "ITCS217_Computer Data Communication",
    topic: "Lecture 10 · Byte stuffing",
    objectiveId: "PROV-L10-1-O02",
    type: "single",
    difficulty: "Medium",
    cognitiveLevel: "Apply",
    prompt:
      "A byte-oriented frame payload contains the reserved delimiter byte. How should a byte-stuffing sender preserve it?",
    answers: [
      "Treat it as an actual frame end",
      "Delete the payload byte",
      "Encode it with the protocol escape convention",
    ],
    correct: [2],
    explanation:
      "Escaping keeps the delimiter value as data rather than a frame boundary.",
    optionExplanations: [
      "That would terminate the payload prematurely.",
      "Deleting it would change the user data.",
      "Escaping keeps the delimiter value as data rather than a frame boundary.",
    ],
    sourceRefs: [
      {
        file: "Lecture 10_ Part 1_ Attempt review _ ICT My Courses.pdf",
        page: 1,
      },
      {
        file: "ITCS217-Lecture-10-Flow-control-and-Error-Control-2026.pdf",
        page: 10,
      },
    ],
    status: "draft",
    version: 1,
    tags: ["original:L10-1-Q02", "variation:A", "provisional-objective"],
    lecture: "Lecture 10",
  },
  {
    id: "L10-1-Q02-B",
    subject: "ITCS217_Computer Data Communication",
    topic: "Lecture 10 · Byte stuffing",
    objectiveId: "PROV-L10-1-O02",
    type: "single",
    difficulty: "Medium",
    cognitiveLevel: "Apply",
    prompt:
      "A byte-oriented protocol uses ESC as an escape byte. If ESC occurs as payload, what is normally required?",
    answers: [
      "Remove all ESC payload bytes",
      "Escape the payload ESC according to the protocol rules",
      "Interpret every payload ESC as the end flag",
    ],
    correct: [1],
    explanation:
      "The receiver must distinguish a literal ESC from an escape indicator.",
    optionExplanations: [
      "Removal corrupts the original data.",
      "The receiver must distinguish a literal ESC from an escape indicator.",
      "ESC is an escape mechanism, not automatically a frame terminator.",
    ],
    sourceRefs: [
      {
        file: "Lecture 10_ Part 1_ Attempt review _ ICT My Courses.pdf",
        page: 1,
      },
      {
        file: "ITCS217-Lecture-10-Flow-control-and-Error-Control-2026.pdf",
        page: 10,
      },
    ],
    status: "draft",
    version: 1,
    tags: ["original:L10-1-Q02", "variation:B", "provisional-objective"],
    lecture: "Lecture 10",
  },
  {
    id: "L10-1-Q03-A",
    subject: "ITCS217_Computer Data Communication",
    topic: "Lecture 10 · Bit stuffing",
    objectiveId: "PROV-L10-1-O03",
    type: "single",
    difficulty: "Medium",
    cognitiveLevel: "Apply",
    prompt:
      "Under HDLC stuffing, what is the transmitted form of payload bits 01111110? Apply stuffing only to this payload.",
    answers: ["011111010", "011111110", "01111110"],
    correct: [0],
    explanation:
      "After the first five ones a zero is inserted; the remaining original one and final zero follow.",
    optionExplanations: [
      "After the first five ones a zero is inserted; the remaining original one and final zero follow.",
      "The sender inserts zero after five ones, not an additional one.",
      "Leaving the payload unchanged would reproduce the reserved flag pattern.",
    ],
    sourceRefs: [
      {
        file: "Lecture 10_ Part 1_ Attempt review _ ICT My Courses.pdf",
        page: 1,
      },
      {
        file: "ITCS217-Lecture-10-Flow-control-and-Error-Control-2026.pdf",
        page: 12,
      },
    ],
    status: "draft",
    version: 1,
    tags: ["original:L10-1-Q03", "variation:A", "provisional-objective"],
    lecture: "Lecture 10",
  },
  {
    id: "L10-1-Q03-B",
    subject: "ITCS217_Computer Data Communication",
    topic: "Lecture 10 · Bit stuffing",
    objectiveId: "PROV-L10-1-O03",
    type: "single",
    difficulty: "Medium",
    cognitiveLevel: "Apply",
    prompt:
      "Under HDLC stuffing, how many zeros are inserted into payload 011111111110 (ten consecutive ones)?",
    answers: ["0", "2", "1"],
    correct: [1],
    explanation:
      "Each run of five consecutive payload ones triggers one inserted zero; ten ones require two.",
    optionExplanations: [
      "The payload includes two groups that trigger bit stuffing.",
      "Each run of five consecutive payload ones triggers one inserted zero; ten ones require two.",
      "A second group of five ones also requires a stuffed zero.",
    ],
    sourceRefs: [
      {
        file: "Lecture 10_ Part 1_ Attempt review _ ICT My Courses.pdf",
        page: 1,
      },
      {
        file: "ITCS217-Lecture-10-Flow-control-and-Error-Control-2026.pdf",
        page: 12,
      },
    ],
    status: "draft",
    version: 1,
    tags: ["original:L10-1-Q03", "variation:B", "provisional-objective"],
    lecture: "Lecture 10",
  },
  {
    id: "L10-1-Q04-A",
    subject: "ITCS217_Computer Data Communication",
    topic: "Lecture 10 · Simple Protocol",
    objectiveId: "PROV-L10-1-O04",
    type: "single",
    difficulty: "Medium",
    cognitiveLevel: "Apply",
    prompt:
      "Which model assumes an ideal receiver and omits both flow and error control?",
    answers: ["Selective Repeat ARQ", "Stop-and-Wait ARQ", "Simple Protocol"],
    correct: [2],
    explanation:
      "The lecture Simple Protocol has neither flow nor error control.",
    optionExplanations: [
      "Selective Repeat uses acknowledgements, retransmission and windows.",
      "Stop-and-Wait ARQ waits for acknowledgements and handles errors.",
      "The lecture Simple Protocol has neither flow nor error control.",
    ],
    sourceRefs: [
      {
        file: "Lecture 10_ Part 1_ Attempt review _ ICT My Courses.pdf",
        page: 2,
      },
      {
        file: "ITCS217-Lecture-10-Flow-control-and-Error-Control-2026.pdf",
        page: 21,
      },
    ],
    status: "draft",
    version: 1,
    tags: ["original:L10-1-Q04", "variation:A", "provisional-objective"],
    lecture: "Lecture 10",
  },
  {
    id: "L10-1-Q04-B",
    subject: "ITCS217_Computer Data Communication",
    topic: "Lecture 10 · Simple Protocol",
    objectiveId: "PROV-L10-1-O04",
    type: "single",
    difficulty: "Medium",
    cognitiveLevel: "Apply",
    prompt:
      "A sender in the lecture Simple Protocol keeps sending without ACKs. Which assumption supports that model?",
    answers: [
      "The receiver can accept data and the modeled channel needs no error recovery",
      "Every frame must wait for its ACK",
      "Out-of-order buffering and selective retransmission are mandatory",
    ],
    correct: [0],
    explanation:
      "The simplified model omits the mechanisms needed for receiver overload and transmission errors.",
    optionExplanations: [
      "The simplified model omits the mechanisms needed for receiver overload and transmission errors.",
      "That describes waiting behavior absent from Simple Protocol.",
      "Those are Selective Repeat mechanisms, not Simple Protocol assumptions.",
    ],
    sourceRefs: [
      {
        file: "Lecture 10_ Part 1_ Attempt review _ ICT My Courses.pdf",
        page: 2,
      },
      {
        file: "ITCS217-Lecture-10-Flow-control-and-Error-Control-2026.pdf",
        page: 21,
      },
    ],
    status: "draft",
    version: 1,
    tags: ["original:L10-1-Q04", "variation:B", "provisional-objective"],
    lecture: "Lecture 10",
  },
  {
    id: "L10-1-Q05-A",
    subject: "ITCS217_Computer Data Communication",
    topic: "Lecture 10 · Duplicate detection",
    objectiveId: "PROV-L10-1-O05",
    type: "single",
    difficulty: "Medium",
    cognitiveLevel: "Apply",
    prompt:
      "Stop-and-Wait Frame 1 is accepted, but its ACK is lost. A duplicate Frame 1 arrives. What identifies it as a duplicate?",
    answers: [
      "A changed destination IP address",
      "The sequence number and receiver expected-frame state",
      "A higher physical bit rate",
    ],
    correct: [1],
    explanation:
      "The receiver remembers which sequence number it expects next, distinguishing the duplicate.",
    optionExplanations: [
      "IP addresses need not change on a link retransmission.",
      "The receiver remembers which sequence number it expects next, distinguishing the duplicate.",
      "Transmission rate does not identify frame duplicates.",
    ],
    sourceRefs: [
      {
        file: "Lecture 10_ Part 1_ Attempt review _ ICT My Courses.pdf",
        page: 2,
      },
      {
        file: "ITCS217-Lecture-10-Flow-control-and-Error-Control-2026.pdf",
        page: 26,
      },
    ],
    status: "draft",
    version: 1,
    tags: ["original:L10-1-Q05", "variation:A", "provisional-objective"],
    lecture: "Lecture 10",
  },
  {
    id: "L10-1-Q05-B",
    subject: "ITCS217_Computer Data Communication",
    topic: "Lecture 10 · Duplicate detection",
    objectiveId: "PROV-L10-1-O05",
    type: "single",
    difficulty: "Medium",
    cognitiveLevel: "Apply",
    prompt:
      "Why can a Stop-and-Wait sender not treat every retransmission as a new numbered frame?",
    answers: [
      "The receiver must recognize the retransmitted copy of the same data",
      "A retransmission always represents new user data",
      "Sequence numbers are only for route selection",
    ],
    correct: [0],
    explanation:
      "Retaining the frame identity prevents duplicate delivery when an ACK was lost.",
    optionExplanations: [
      "Retaining the frame identity prevents duplicate delivery when an ACK was lost.",
      "A retransmission repeats previously sent data.",
      "Sequence numbers in ARQ support reliable delivery, not routing.",
    ],
    sourceRefs: [
      {
        file: "Lecture 10_ Part 1_ Attempt review _ ICT My Courses.pdf",
        page: 2,
      },
      {
        file: "ITCS217-Lecture-10-Flow-control-and-Error-Control-2026.pdf",
        page: 26,
      },
    ],
    status: "draft",
    version: 1,
    tags: ["original:L10-1-Q05", "variation:B", "provisional-objective"],
    lecture: "Lecture 10",
  },
  {
    id: "L10-1-Q06-A",
    subject: "ITCS217_Computer Data Communication",
    topic: "Lecture 10 · Stop-and-Wait ACK convention",
    objectiveId: "PROV-L10-1-O06",
    type: "single",
    difficulty: "Medium",
    cognitiveLevel: "Apply",
    prompt:
      "In alternating-bit Stop-and-Wait, ACK k means frame k is expected next. What follows correct reception of Frame 1?",
    answers: ["ACK 0", "ACK 2", "ACK 1"],
    correct: [0],
    explanation: "The expected sequence alternates modulo 2 from 1 back to 0.",
    optionExplanations: [
      "The expected sequence alternates modulo 2 from 1 back to 0.",
      "Alternating-bit Stop-and-Wait uses only sequence numbers 0 and 1.",
      "ACK 1 would indicate Frame 1 is still expected, not that it was just accepted.",
    ],
    sourceRefs: [
      {
        file: "Lecture 10_ Part 1_ Attempt review _ ICT My Courses.pdf",
        page: 2,
      },
      {
        file: "ITCS217-Lecture-10-Flow-control-and-Error-Control-2026.pdf",
        page: 26,
      },
    ],
    status: "draft",
    version: 1,
    tags: ["original:L10-1-Q06", "variation:A", "provisional-objective"],
    lecture: "Lecture 10",
  },
  {
    id: "L10-1-Q06-B",
    subject: "ITCS217_Computer Data Communication",
    topic: "Lecture 10 · Stop-and-Wait ACK convention",
    objectiveId: "PROV-L10-1-O06",
    type: "single",
    difficulty: "Medium",
    cognitiveLevel: "Apply",
    prompt:
      "In alternating-bit Stop-and-Wait, ACK k means frame k is expected next. What does ACK 0 indicate?",
    answers: [
      "Frame 0 was just accepted and Frame 1 is expected",
      "Frame 1 was accepted and Frame 0 is expected next",
      "Frames 0 and 1 were both rejected",
    ],
    correct: [1],
    explanation:
      "With this next-expected convention the acknowledgement wraps modulo 2.",
    optionExplanations: [
      "That would be ACK 1 under the stated convention.",
      "With this next-expected convention the acknowledgement wraps modulo 2.",
      "ACK 0 is not a statement that both frames were rejected.",
    ],
    sourceRefs: [
      {
        file: "Lecture 10_ Part 1_ Attempt review _ ICT My Courses.pdf",
        page: 2,
      },
      {
        file: "ITCS217-Lecture-10-Flow-control-and-Error-Control-2026.pdf",
        page: 26,
      },
    ],
    status: "draft",
    version: 1,
    tags: ["original:L10-1-Q06", "variation:B", "provisional-objective"],
    lecture: "Lecture 10",
  },
  {
    id: "L10-1-Q07-A",
    subject: "ITCS217_Computer Data Communication",
    topic: "Lecture 10 · Delayed ACK trace",
    objectiveId: "PROV-L10-1-O07",
    type: "multiple",
    difficulty: "Medium",
    cognitiveLevel: "Apply",
    prompt:
      "Alternating-bit Stop-and-Wait uses next-expected ACKs. Frame 1 is accepted; ACK 0 is delayed. A timeout causes duplicate Frame 1, producing a second ACK 0. The first ACK 0 reaches the sender, which sends Frame 0. While awaiting its ACK, the sender receives the second ACK 0. Select all THREE correct statements.",
    answers: [
      "The old ACK 0 does not confirm the new Frame 0",
      "If no valid ACK 1 arrives before timeout, retransmit Frame 0",
      "Advance immediately to new Frame 1 upon the second ACK 0",
      "The second ACK 0 can originate from the duplicate Frame 1",
    ],
    correct: [0, 1, 3],
    explanation:
      "ACK 0 says Frame 0 is expected next; it is not the expected ACK 1 for acceptance of the new Frame 0. The outstanding Frame 0 requires ACK 1 under the next-expected convention. The described duplicate reception produces that acknowledgement.",
    optionExplanations: [
      "ACK 0 says Frame 0 is expected next; it is not the expected ACK 1 for acceptance of the new Frame 0.",
      "The outstanding Frame 0 requires ACK 1 under the next-expected convention.",
      "That old ACK does not acknowledge the currently outstanding Frame 0.",
      "The described duplicate reception produces that acknowledgement.",
    ],
    sourceRefs: [
      {
        file: "Lecture 10_ Part 1_ Attempt review _ ICT My Courses.pdf",
        page: 3,
      },
      {
        file: "ITCS217-Lecture-10-Flow-control-and-Error-Control-2026.pdf",
        page: 30,
      },
    ],
    status: "draft",
    version: 1,
    tags: ["original:L10-1-Q07", "variation:A", "provisional-objective"],
    lecture: "Lecture 10",
  },
  {
    id: "L10-1-Q07-B",
    subject: "ITCS217_Computer Data Communication",
    topic: "Lecture 10 · Delayed ACK trace",
    objectiveId: "PROV-L10-1-O07",
    type: "single",
    difficulty: "Hard",
    cognitiveLevel: "Analyze",
    prompt:
      "Alternating-bit Stop-and-Wait uses next-expected ACKs. Frame 0 is accepted, its ACK 1 is delayed, and duplicate Frame 0 produces another ACK 1. After one ACK 1 arrives, the sender sends Frame 1. The old ACK 1 arrives again before a valid ACK 0. What should the sender do?",
    answers: [
      "Immediately send a new Frame 0",
      "Keep Frame 1 outstanding and retransmit it on timeout if ACK 0 never arrives",
      "Consider Frame 1 acknowledged by ACK 1",
    ],
    correct: [1],
    explanation:
      "The old ACK 1 does not acknowledge Frame 1; ACK 0 is required.",
    optionExplanations: [
      "Advancing would incorrectly treat an old ACK as acceptance of Frame 1.",
      "The old ACK 1 does not acknowledge Frame 1; ACK 0 is required.",
      "The prompt defines ACK numbers as next expected, not the frame just accepted.",
    ],
    sourceRefs: [
      {
        file: "Lecture 10_ Part 1_ Attempt review _ ICT My Courses.pdf",
        page: 3,
      },
      {
        file: "ITCS217-Lecture-10-Flow-control-and-Error-Control-2026.pdf",
        page: 30,
      },
    ],
    status: "draft",
    version: 1,
    tags: ["original:L10-1-Q07", "variation:B", "provisional-objective"],
    lecture: "Lecture 10",
  },
  {
    id: "L10-1-Q08-A",
    subject: "ITCS217_Computer Data Communication",
    topic: "Lecture 10 · GBN sender window",
    objectiveId: "PROV-L10-1-O08",
    type: "single",
    difficulty: "Medium",
    cognitiveLevel: "Apply",
    prompt:
      "A Go-Back-N protocol has an 4-bit sequence field. What is its maximum sender window?",
    answers: ["8 frames", "16 frames", "15 frames"],
    correct: [2],
    explanation: "The maximum is 2^4 - 1 = 15.",
    optionExplanations: [
      "Half the sequence space is the Selective Repeat limit, not the GBN maximum.",
      "Using the full sequence space permits ambiguity after wraparound.",
      "The maximum is 2^4 - 1 = 15.",
    ],
    sourceRefs: [
      {
        file: "Lecture 10_ Part 1_ Attempt review _ ICT My Courses.pdf",
        page: 3,
      },
      {
        file: "ITCS217-Lecture-10-Flow-control-and-Error-Control-2026.pdf",
        page: 41,
      },
    ],
    status: "draft",
    version: 1,
    tags: ["original:L10-1-Q08", "variation:A", "provisional-objective"],
    lecture: "Lecture 10",
  },
  {
    id: "L10-1-Q08-B",
    subject: "ITCS217_Computer Data Communication",
    topic: "Lecture 10 · GBN sender window",
    objectiveId: "PROV-L10-1-O08",
    type: "single",
    difficulty: "Medium",
    cognitiveLevel: "Apply",
    prompt:
      "A Go-Back-N protocol has an 5-bit sequence field. What is its maximum sender window?",
    answers: ["32 frames", "31 frames", "16 frames"],
    correct: [1],
    explanation: "The maximum is 2^5 - 1 = 31.",
    optionExplanations: [
      "Using the full sequence space permits ambiguity after wraparound.",
      "The maximum is 2^5 - 1 = 31.",
      "Half the sequence space is the Selective Repeat limit, not the GBN maximum.",
    ],
    sourceRefs: [
      {
        file: "Lecture 10_ Part 1_ Attempt review _ ICT My Courses.pdf",
        page: 3,
      },
      {
        file: "ITCS217-Lecture-10-Flow-control-and-Error-Control-2026.pdf",
        page: 41,
      },
    ],
    status: "draft",
    version: 1,
    tags: ["original:L10-1-Q08", "variation:B", "provisional-objective"],
    lecture: "Lecture 10",
  },
  {
    id: "L10-1-Q09-A",
    subject: "ITCS217_Computer Data Communication",
    topic: "Lecture 10 · Stop-and-Wait versus GBN",
    objectiveId: "PROV-L10-1-O09",
    type: "single",
    difficulty: "Medium",
    cognitiveLevel: "Apply",
    prompt: "Which statement correctly compares Stop-and-Wait and Go-Back-N?",
    answers: [
      "Stop-and-Wait always has a larger sender window than GBN",
      "Both always buffer several out-of-order frames at the receiver",
      "Stop-and-Wait permits one outstanding frame; GBN can permit several",
    ],
    correct: [2],
    explanation:
      "GBN pipelines multiple outstanding frames when its sender window exceeds one.",
    optionExplanations: [
      "Stop-and-Wait is the one-outstanding-frame special case.",
      "The lecture GBN receiver has window size one and does not buffer out-of-order frames.",
      "GBN pipelines multiple outstanding frames when its sender window exceeds one.",
    ],
    sourceRefs: [
      {
        file: "Lecture 10_ Part 1_ Attempt review _ ICT My Courses.pdf",
        page: 3,
      },
      {
        file: "ITCS217-Lecture-10-Flow-control-and-Error-Control-2026.pdf",
        page: 46,
      },
    ],
    status: "draft",
    version: 1,
    tags: ["original:L10-1-Q09", "variation:A", "provisional-objective"],
    lecture: "Lecture 10",
  },
  {
    id: "L10-1-Q09-B",
    subject: "ITCS217_Computer Data Communication",
    topic: "Lecture 10 · Stop-and-Wait versus GBN",
    objectiveId: "PROV-L10-1-O09",
    type: "single",
    difficulty: "Medium",
    cognitiveLevel: "Apply",
    prompt:
      "In Go-Back-N, Sf = 3 and Sn = 6, with no wraparound. What do these variables mean?",
    answers: [
      "Frames 3 through 6 are all already acknowledged",
      "Frame 6 is oldest outstanding; Frame 3 is next to send",
      "Frame 3 is oldest outstanding; Frame 6 is next to send",
    ],
    correct: [2],
    explanation:
      "Sf marks the beginning of outstanding data and Sn the next new sequence number.",
    optionExplanations: [
      "Outstanding frames are not yet cumulatively acknowledged.",
      "This reverses the roles of Sf and Sn.",
      "Sf marks the beginning of outstanding data and Sn the next new sequence number.",
    ],
    sourceRefs: [
      {
        file: "Lecture 10_ Part 1_ Attempt review _ ICT My Courses.pdf",
        page: 3,
      },
      {
        file: "ITCS217-Lecture-10-Flow-control-and-Error-Control-2026.pdf",
        page: 46,
      },
    ],
    status: "draft",
    version: 1,
    tags: ["original:L10-1-Q09", "variation:B", "provisional-objective"],
    lecture: "Lecture 10",
  },
  {
    id: "L10-2-Q01-A",
    subject: "ITCS217_Computer Data Communication",
    topic: "Lecture 10 · Cumulative ACK window movement",
    objectiveId: "PROV-L10-2-O01",
    type: "single",
    difficulty: "Medium",
    cognitiveLevel: "Apply",
    prompt:
      "GBN uses sequence numbers 0–15, W = 4 and next-expected cumulative ACKs. Sf = 4, Sn = 8, so Frames 4–7 are outstanding. ACK 6 arrives. What is the result?",
    answers: [
      "Sf = 4; the window cannot move",
      "Sf = 6; Frames 6 and 7 remain outstanding",
      "Sf = 7; only Frame 7 remains outstanding",
    ],
    correct: [1],
    explanation:
      "ACK 6 cumulatively acknowledges Frames 4 and 5, making 6 the oldest outstanding.",
    optionExplanations: [
      "A valid cumulative ACK does advance the sender window.",
      "ACK 6 cumulatively acknowledges Frames 4 and 5, making 6 the oldest outstanding.",
      "ACK 6 does not acknowledge Frame 6 under the next-expected convention.",
    ],
    sourceRefs: [
      {
        file: "Lecture 10_ Part 2_ Attempt review _ ICT My Courses.pdf",
        page: 1,
      },
      {
        file: "ITCS217-Lecture-10-Flow-control-and-Error-Control-2026.pdf",
        page: 42,
      },
    ],
    status: "draft",
    version: 1,
    tags: ["original:L10-2-Q01", "variation:A", "provisional-objective"],
    lecture: "Lecture 10",
  },
  {
    id: "L10-2-Q01-B",
    subject: "ITCS217_Computer Data Communication",
    topic: "Lecture 10 · Cumulative ACK window movement",
    objectiveId: "PROV-L10-2-O01",
    type: "single",
    difficulty: "Medium",
    cognitiveLevel: "Apply",
    prompt:
      "GBN uses sequence numbers 0–15, W = 4 and next-expected cumulative ACKs. Sf = 8, Sn = 12. ACK 11 arrives before any timeout. What remains outstanding?",
    answers: ["No frames", "Frames 10 and 11", "Frame 11 only"],
    correct: [2],
    explanation: "ACK 11 confirms Frames 8–10 and leaves 11 outstanding.",
    optionExplanations: [
      "ACK 12 would be needed to cover Frame 11.",
      "Frame 10 is included in the cumulative acknowledgement.",
      "ACK 11 confirms Frames 8–10 and leaves 11 outstanding.",
    ],
    sourceRefs: [
      {
        file: "Lecture 10_ Part 2_ Attempt review _ ICT My Courses.pdf",
        page: 1,
      },
      {
        file: "ITCS217-Lecture-10-Flow-control-and-Error-Control-2026.pdf",
        page: 42,
      },
    ],
    status: "draft",
    version: 1,
    tags: ["original:L10-2-Q01", "variation:B", "provisional-objective"],
    lecture: "Lecture 10",
  },
  {
    id: "L10-2-Q02-A",
    subject: "ITCS217_Computer Data Communication",
    topic: "Lecture 10 · GBN state variables",
    objectiveId: "PROV-L10-2-O02",
    type: "single",
    difficulty: "Medium",
    cognitiveLevel: "Apply",
    prompt:
      "GBN uses sequence numbers 0–7, W = 2, next-expected ACKs and initial Sf = Sn = R = 6. Frames 6 and 7 arrive in order. After the resulting cumulative ACK is received, what is the state?",
    answers: [
      "ACK 0; Sf = Sn = R = 0",
      "ACK 7; Sf = Sn = R = 7",
      "ACK 8; Sf = Sn = R = 8",
    ],
    correct: [0],
    explanation:
      "Two accepted frames advance the state from 6 through 7 to 0 modulo 8.",
    optionExplanations: [
      "Two accepted frames advance the state from 6 through 7 to 0 modulo 8.",
      "ACK 7 covers only through Frame 6, not both accepted frames.",
      "Sequence numbers wrap modulo 8; 8 is not a valid value.",
    ],
    sourceRefs: [
      {
        file: "Lecture 10_ Part 2_ Attempt review _ ICT My Courses.pdf",
        page: 1,
      },
      {
        file: "ITCS217-Lecture-10-Flow-control-and-Error-Control-2026.pdf",
        page: 42,
      },
    ],
    status: "draft",
    version: 1,
    tags: ["original:L10-2-Q02", "variation:A", "provisional-objective"],
    lecture: "Lecture 10",
  },
  {
    id: "L10-2-Q02-B",
    subject: "ITCS217_Computer Data Communication",
    topic: "Lecture 10 · GBN state variables",
    objectiveId: "PROV-L10-2-O02",
    type: "single",
    difficulty: "Medium",
    cognitiveLevel: "Apply",
    prompt:
      "GBN uses sequence numbers 0–15, W = 3, next-expected ACKs and initial Sf = Sn = R = 9. Frames 9, 10 and 11 arrive in order. After the resulting cumulative ACK is received, what is the state?",
    answers: [
      "ACK 11; Sf = Sn = R = 11",
      "ACK 12; Sf = 9, Sn = 12, R = 12",
      "ACK 12; Sf = Sn = R = 12",
    ],
    correct: [2],
    explanation:
      "All three frames are acknowledged, so the window base catches up with the next-to-send and next-expected values.",
    optionExplanations: [
      "ACK 11 would leave Frame 11 unacknowledged.",
      "Receipt of the cumulative ACK also advances Sf to 12.",
      "All three frames are acknowledged, so the window base catches up with the next-to-send and next-expected values.",
    ],
    sourceRefs: [
      {
        file: "Lecture 10_ Part 2_ Attempt review _ ICT My Courses.pdf",
        page: 1,
      },
      {
        file: "ITCS217-Lecture-10-Flow-control-and-Error-Control-2026.pdf",
        page: 42,
      },
    ],
    status: "draft",
    version: 1,
    tags: ["original:L10-2-Q02", "variation:B", "provisional-objective"],
    lecture: "Lecture 10",
  },
  {
    id: "L10-2-Q03-A",
    subject: "ITCS217_Computer Data Communication",
    topic: "Lecture 10 · SR out-of-order reception",
    objectiveId: "PROV-L10-2-O03",
    type: "single",
    difficulty: "Medium",
    cognitiveLevel: "Apply",
    prompt:
      "In Selective Repeat with a receive window covering Frames 6–9, Frame 6 is lost but Frames 7 and 8 arrive correctly. What should happen?",
    answers: [
      "Deliver 7 and 8 in order while permanently ignoring 6",
      "Buffer 7 and 8 and arrange retransmission of 6",
      "Discard 7 and 8 solely because 6 is missing",
    ],
    correct: [1],
    explanation:
      "SR retains acceptable out-of-order frames and recovers the missing frame selectively.",
    optionExplanations: [
      "Ordered delivery cannot skip the missing earlier frame.",
      "SR retains acceptable out-of-order frames and recovers the missing frame selectively.",
      "That matches the lecture GBN receiver behavior rather than SR.",
    ],
    sourceRefs: [
      {
        file: "Lecture 10_ Part 2_ Attempt review _ ICT My Courses.pdf",
        page: 2,
      },
      {
        file: "ITCS217-Lecture-10-Flow-control-and-Error-Control-2026.pdf",
        page: 48,
      },
    ],
    status: "draft",
    version: 1,
    tags: ["original:L10-2-Q03", "variation:A", "provisional-objective"],
    lecture: "Lecture 10",
  },
  {
    id: "L10-2-Q03-B",
    subject: "ITCS217_Computer Data Communication",
    topic: "Lecture 10 · SR out-of-order reception",
    objectiveId: "PROV-L10-2-O03",
    type: "single",
    difficulty: "Medium",
    cognitiveLevel: "Apply",
    prompt:
      "In Selective Repeat, Frame 10 is missing and Frames 11 and 12 are correctly buffered within the receive window. Frame 10 is then received. What can the receiver do?",
    answers: [
      "Deliver 12 before 10 and 11",
      "Deliver the now-contiguous sequence 10, 11, 12",
      "Require 11 and 12 to be retransmitted despite their correct buffered copies",
    ],
    correct: [1],
    explanation:
      "Arrival of the missing frame closes the gap and permits in-order delivery.",
    optionExplanations: [
      "That would violate the stated ordered delivery behavior.",
      "Arrival of the missing frame closes the gap and permits in-order delivery.",
      "Selective recovery reuses the correctly received buffered frames.",
    ],
    sourceRefs: [
      {
        file: "Lecture 10_ Part 2_ Attempt review _ ICT My Courses.pdf",
        page: 2,
      },
      {
        file: "ITCS217-Lecture-10-Flow-control-and-Error-Control-2026.pdf",
        page: 48,
      },
    ],
    status: "draft",
    version: 1,
    tags: ["original:L10-2-Q03", "variation:B", "provisional-objective"],
    lecture: "Lecture 10",
  },
  {
    id: "L10-2-Q04-A",
    subject: "ITCS217_Computer Data Communication",
    topic: "Lecture 10 · SR window limit",
    objectiveId: "PROV-L10-2-O04",
    type: "single",
    difficulty: "Medium",
    cognitiveLevel: "Apply",
    prompt:
      "Selective Repeat uses an 3-bit sequence field and equal sender/receiver windows. What is the maximum size of each?",
    answers: ["4 frames", "7 frames", "8 frames"],
    correct: [0],
    explanation: "Each window is at most half the 2^3 sequence space: 4.",
    optionExplanations: [
      "Each window is at most half the 2^3 sequence space: 4.",
      "That is the GBN sender maximum, not the equal-window SR limit.",
      "Using the entire sequence space violates the SR half-space limit.",
    ],
    sourceRefs: [
      {
        file: "Lecture 10_ Part 2_ Attempt review _ ICT My Courses.pdf",
        page: 2,
      },
      {
        file: "ITCS217-Lecture-10-Flow-control-and-Error-Control-2026.pdf",
        page: 50,
      },
    ],
    status: "draft",
    version: 1,
    tags: ["original:L10-2-Q04", "variation:A", "provisional-objective"],
    lecture: "Lecture 10",
  },
  {
    id: "L10-2-Q04-B",
    subject: "ITCS217_Computer Data Communication",
    topic: "Lecture 10 · SR window limit",
    objectiveId: "PROV-L10-2-O04",
    type: "single",
    difficulty: "Medium",
    cognitiveLevel: "Apply",
    prompt:
      "Selective Repeat uses an 5-bit sequence field and equal sender/receiver windows. What is the maximum size of each?",
    answers: ["16 frames", "32 frames", "31 frames"],
    correct: [0],
    explanation: "Each window is at most half the 2^5 sequence space: 16.",
    optionExplanations: [
      "Each window is at most half the 2^5 sequence space: 16.",
      "Using the entire sequence space violates the SR half-space limit.",
      "That is the GBN sender maximum, not the equal-window SR limit.",
    ],
    sourceRefs: [
      {
        file: "Lecture 10_ Part 2_ Attempt review _ ICT My Courses.pdf",
        page: 2,
      },
      {
        file: "ITCS217-Lecture-10-Flow-control-and-Error-Control-2026.pdf",
        page: 50,
      },
    ],
    status: "draft",
    version: 1,
    tags: ["original:L10-2-Q04", "variation:B", "provisional-objective"],
    lecture: "Lecture 10",
  },
  {
    id: "L10-2-Q05-A",
    subject: "ITCS217_Computer Data Communication",
    topic: "Lecture 10 · Selective retransmission efficiency",
    objectiveId: "PROV-L10-2-O05",
    type: "single",
    difficulty: "Medium",
    cognitiveLevel: "Apply",
    prompt:
      "Why can SR avoid retransmitting some frames that GBN would resend after a loss?",
    answers: [
      "It removes all acknowledgement processing",
      "It guarantees that the channel cannot lose frames",
      "It buffers valid out-of-order frames and selectively retransmits missing frames",
    ],
    correct: [2],
    explanation:
      "This retains successful transmissions instead of repeating the entire outstanding suffix.",
    optionExplanations: [
      "SR still uses acknowledgements to track frame reception.",
      "SR handles errors; it does not eliminate physical loss.",
      "This retains successful transmissions instead of repeating the entire outstanding suffix.",
    ],
    sourceRefs: [
      {
        file: "Lecture 10_ Part 2_ Attempt review _ ICT My Courses.pdf",
        page: 2,
      },
      {
        file: "ITCS217-Lecture-10-Flow-control-and-Error-Control-2026.pdf",
        page: 49,
      },
    ],
    status: "draft",
    version: 1,
    tags: ["original:L10-2-Q05", "variation:A", "provisional-objective"],
    lecture: "Lecture 10",
  },
  {
    id: "L10-2-Q05-B",
    subject: "ITCS217_Computer Data Communication",
    topic: "Lecture 10 · Selective retransmission efficiency",
    objectiveId: "PROV-L10-2-O05",
    type: "single",
    difficulty: "Medium",
    cognitiveLevel: "Apply",
    prompt:
      "One frame in a pipeline is lost, while its next three frames arrive correctly inside the SR receive window. Which capability avoids resending those three?",
    answers: [
      "Eliminating sequence numbers",
      "A receiver window of exactly one",
      "Out-of-order buffering with selective recovery",
    ],
    correct: [2],
    explanation:
      "The buffered correct frames need not be sent again solely because an earlier frame was lost.",
    optionExplanations: [
      "Sequence numbers identify the missing and buffered frames.",
      "A window of one cannot accept this out-of-order range.",
      "The buffered correct frames need not be sent again solely because an earlier frame was lost.",
    ],
    sourceRefs: [
      {
        file: "Lecture 10_ Part 2_ Attempt review _ ICT My Courses.pdf",
        page: 2,
      },
      {
        file: "ITCS217-Lecture-10-Flow-control-and-Error-Control-2026.pdf",
        page: 49,
      },
    ],
    status: "draft",
    version: 1,
    tags: ["original:L10-2-Q05", "variation:B", "provisional-objective"],
    lecture: "Lecture 10",
  },
  {
    id: "L10-2-Q06-A",
    subject: "ITCS217_Computer Data Communication",
    topic: "Lecture 10 · GBN versus SR",
    objectiveId: "PROV-L10-2-O06",
    type: "single",
    difficulty: "Medium",
    cognitiveLevel: "Apply",
    prompt:
      "With a 3-bit sequence field, which maximum-window comparison follows the lecture models?",
    answers: [
      "GBN sender 4, receiver 4; SR sender 7, receiver 1",
      "Both sender and receiver windows are 7 in both protocols",
      "GBN sender 7, receiver 1; SR sender and receiver 4",
    ],
    correct: [2],
    explanation:
      "GBN allows 2^3 - 1 at the sender; equal-window SR allows 2^(3-1) at each side.",
    optionExplanations: [
      "This reverses and mixes the protocol window rules.",
      "GBN receiver is one, and SR cannot use seven with only eight sequence values.",
      "GBN allows 2^3 - 1 at the sender; equal-window SR allows 2^(3-1) at each side.",
    ],
    sourceRefs: [
      {
        file: "Lecture 10_ Part 2_ Attempt review _ ICT My Courses.pdf",
        page: 3,
      },
      {
        file: "ITCS217-Lecture-10-Flow-control-and-Error-Control-2026.pdf",
        page: 50,
      },
    ],
    status: "draft",
    version: 1,
    tags: ["original:L10-2-Q06", "variation:A", "provisional-objective"],
    lecture: "Lecture 10",
  },
  {
    id: "L10-2-Q06-B",
    subject: "ITCS217_Computer Data Communication",
    topic: "Lecture 10 · GBN versus SR",
    objectiveId: "PROV-L10-2-O06",
    type: "single",
    difficulty: "Medium",
    cognitiveLevel: "Apply",
    prompt:
      "For frames arriving after a missing frame, which receiver behavior distinguishes the lecture GBN and SR models?",
    answers: [
      "GBN always buffers them while SR always discards them",
      "GBN discards out-of-order frames; SR can buffer acceptable ones",
      "Both must discard every out-of-order frame",
    ],
    correct: [1],
    explanation:
      "GBN expects only the next frame; SR accepts an in-window range.",
    optionExplanations: [
      "This reverses the lecture behaviors.",
      "GBN expects only the next frame; SR accepts an in-window range.",
      "SR buffering is specifically designed to retain them.",
    ],
    sourceRefs: [
      {
        file: "Lecture 10_ Part 2_ Attempt review _ ICT My Courses.pdf",
        page: 3,
      },
      {
        file: "ITCS217-Lecture-10-Flow-control-and-Error-Control-2026.pdf",
        page: 50,
      },
    ],
    status: "draft",
    version: 1,
    tags: ["original:L10-2-Q06", "variation:B", "provisional-objective"],
    lecture: "Lecture 10",
  },
  {
    id: "L10-2-Q07-A",
    subject: "ITCS217_Computer Data Communication",
    topic: "Lecture 10 · SR ACK and NAK state",
    objectiveId: "PROV-L10-2-O07",
    type: "single",
    difficulty: "Hard",
    cognitiveLevel: "Analyze",
    prompt:
      "SR uses sequence numbers 0–15, windows of 4, individual ACK k for Frame k, and NAK k for retransmission. Initially Sf = 4, Sn = 8, Rn = 4. Frames 4–7 are sent. Frames 4, 5, 7 arrive; Frame 6 is lost. The sender receives ACKs for the three arrivals and NAK 6. Before the missing frame is received, what is the state?",
    answers: [
      "Retransmit 6 and 7; Sf = 6, Sn = 8, Rn = 6",
      "Retransmit only 6; Sf = 6, Sn = 8, Rn = 6",
      "Retransmit only 6; Sf = 8, Sn = 8, Rn = 8",
    ],
    correct: [1],
    explanation:
      "Individual ACKs allow the base to advance only to the missing frame; the later good frame remains buffered and Sn is unchanged.",
    optionExplanations: [
      "The later frame is already individually acknowledged and does not require retransmission.",
      "Individual ACKs allow the base to advance only to the missing frame; the later good frame remains buffered and Sn is unchanged.",
      "The missing frame prevents the sender base and contiguous receiver base from passing it.",
    ],
    sourceRefs: [
      {
        file: "Lecture 10_ Part 2_ Attempt review _ ICT My Courses.pdf",
        page: 3,
      },
      {
        file: "ITCS217-Lecture-10-Flow-control-and-Error-Control-2026.pdf",
        page: 55,
      },
    ],
    status: "draft",
    version: 1,
    tags: ["original:L10-2-Q07", "variation:A", "provisional-objective"],
    lecture: "Lecture 10",
  },
  {
    id: "L10-2-Q07-B",
    subject: "ITCS217_Computer Data Communication",
    topic: "Lecture 10 · SR ACK and NAK state",
    objectiveId: "PROV-L10-2-O07",
    type: "single",
    difficulty: "Hard",
    cognitiveLevel: "Analyze",
    prompt:
      "SR uses sequence numbers 0–15, windows of 4, individual ACK k for Frame k, and NAK k for retransmission. Initially Sf = 8, Sn = 12, Rn = 8. Frames 8–11 are sent. Frames 8, 9, 11 arrive; Frame 10 is lost. The sender receives ACKs for the three arrivals and NAK 10. Before the missing frame is received, what is the state?",
    answers: [
      "Retransmit only 10; Sf = 12, Sn = 12, Rn = 12",
      "Retransmit 10 and 11; Sf = 10, Sn = 12, Rn = 10",
      "Retransmit only 10; Sf = 10, Sn = 12, Rn = 10",
    ],
    correct: [2],
    explanation:
      "Individual ACKs allow the base to advance only to the missing frame; the later good frame remains buffered and Sn is unchanged.",
    optionExplanations: [
      "The missing frame prevents the sender base and contiguous receiver base from passing it.",
      "The later frame is already individually acknowledged and does not require retransmission.",
      "Individual ACKs allow the base to advance only to the missing frame; the later good frame remains buffered and Sn is unchanged.",
    ],
    sourceRefs: [
      {
        file: "Lecture 10_ Part 2_ Attempt review _ ICT My Courses.pdf",
        page: 3,
      },
      {
        file: "ITCS217-Lecture-10-Flow-control-and-Error-Control-2026.pdf",
        page: 55,
      },
    ],
    status: "draft",
    version: 1,
    tags: ["original:L10-2-Q07", "variation:B", "provisional-objective"],
    lecture: "Lecture 10",
  },
  {
    id: "L10-2-Q08-A",
    subject: "ITCS217_Computer Data Communication",
    topic: "Lecture 10 · SR timers",
    objectiveId: "PROV-L10-2-O08",
    type: "single",
    difficulty: "Medium",
    cognitiveLevel: "Apply",
    prompt:
      "In theoretical SR with individual ACKs, Frame 3 times out and Frames 4 and 5 have already been acknowledged. What is retransmitted?",
    answers: [
      "Nothing, because ACK 5 cumulatively covers Frame 3",
      "Frame 3 only",
      "Frames 3, 4 and 5",
    ],
    correct: [1],
    explanation:
      "The timed-out frame is recovered selectively; acknowledged later frames are not resent.",
    optionExplanations: [
      "The prompt specifies individual rather than cumulative SR ACKs.",
      "The timed-out frame is recovered selectively; acknowledged later frames are not resent.",
      "That repeats acknowledged frames unnecessarily under SR.",
    ],
    sourceRefs: [
      {
        file: "Lecture 10_ Part 2_ Attempt review _ ICT My Courses.pdf",
        page: 4,
      },
      {
        file: "ITCS217-Lecture-10-Flow-control-and-Error-Control-2026.pdf",
        page: 53,
      },
    ],
    status: "draft",
    version: 1,
    tags: ["original:L10-2-Q08", "variation:A", "provisional-objective"],
    lecture: "Lecture 10",
  },
  {
    id: "L10-2-Q08-B",
    subject: "ITCS217_Computer Data Communication",
    topic: "Lecture 10 · SR timers",
    objectiveId: "PROV-L10-2-O08",
    type: "single",
    difficulty: "Medium",
    cognitiveLevel: "Apply",
    prompt:
      "In theoretical SR, outstanding Frame 9 times out. Why does this not itself require resending acknowledged Frame 10?",
    answers: [
      "SR tracks the reception state of individual frames",
      "Every SR ACK is necessarily cumulative",
      "Sequence numbers are disabled after a timeout",
    ],
    correct: [0],
    explanation:
      "A timeout for 9 does not undo the independent acknowledgement of 10.",
    optionExplanations: [
      "A timeout for 9 does not undo the independent acknowledgement of 10.",
      "Individual ACKs are supported in the stated theoretical model.",
      "SR continues to use sequence numbers for selective recovery.",
    ],
    sourceRefs: [
      {
        file: "Lecture 10_ Part 2_ Attempt review _ ICT My Courses.pdf",
        page: 4,
      },
      {
        file: "ITCS217-Lecture-10-Flow-control-and-Error-Control-2026.pdf",
        page: 53,
      },
    ],
    status: "draft",
    version: 1,
    tags: ["original:L10-2-Q08", "variation:B", "provisional-objective"],
    lecture: "Lecture 10",
  },
  {
    id: "L10-2-Q09-A",
    subject: "ITCS217_Computer Data Communication",
    topic: "Lecture 10 · HDLC core concepts",
    objectiveId: "PROV-L10-2-O09",
    type: "single",
    difficulty: "Medium",
    cognitiveLevel: "Apply",
    prompt: "Which set contains only core HDLC link-control concepts?",
    answers: [
      "Application ports, NAT and subnet assignment",
      "DHCP leasing, DNS and IP route selection",
      "Flags, bit stuffing and ARQ",
    ],
    correct: [2],
    explanation:
      "HDLC uses flag boundaries, bit transparency and ARQ-based flow/error control.",
    optionExplanations: [
      "These are not HDLC link framing mechanisms.",
      "These are not the HDLC core framing and link-control mechanisms.",
      "HDLC uses flag boundaries, bit transparency and ARQ-based flow/error control.",
    ],
    sourceRefs: [
      {
        file: "Lecture 10_ Part 2_ Attempt review _ ICT My Courses.pdf",
        page: 4,
      },
      {
        file: "ITCS217-Lecture-10-Flow-control-and-Error-Control-2026.pdf",
        page: 57,
      },
    ],
    status: "draft",
    version: 1,
    tags: ["original:L10-2-Q09", "variation:A", "provisional-objective"],
    lecture: "Lecture 10",
  },
  {
    id: "L10-2-Q09-B",
    subject: "ITCS217_Computer Data Communication",
    topic: "Lecture 10 · HDLC core concepts",
    objectiveId: "PROV-L10-2-O09",
    type: "single",
    difficulty: "Medium",
    cognitiveLevel: "Apply",
    prompt:
      "HDLC must distinguish payload from flags and recover from lost frames. Which pair addresses those tasks?",
    answers: [
      "Routing tables and transport ports",
      "DHCP and DNS",
      "Bit stuffing and acknowledgement/retransmission",
    ],
    correct: [2],
    explanation:
      "Stuffing protects flag transparency; ARQ handles loss through acknowledgement and recovery.",
    optionExplanations: [
      "Those functions do not provide HDLC bit transparency or link retransmission.",
      "Configuration and name resolution do not implement these HDLC tasks.",
      "Stuffing protects flag transparency; ARQ handles loss through acknowledgement and recovery.",
    ],
    sourceRefs: [
      {
        file: "Lecture 10_ Part 2_ Attempt review _ ICT My Courses.pdf",
        page: 4,
      },
      {
        file: "ITCS217-Lecture-10-Flow-control-and-Error-Control-2026.pdf",
        page: 57,
      },
    ],
    status: "draft",
    version: 1,
    tags: ["original:L10-2-Q09", "variation:B", "provisional-objective"],
    lecture: "Lecture 10",
  },
  {
    id: "L10-2-Q10-A",
    subject: "ITCS217_Computer Data Communication",
    topic: "Lecture 10 · HDLC supervisory frames",
    objectiveId: "PROV-L10-2-O10",
    type: "single",
    difficulty: "Medium",
    cognitiveLevel: "Apply",
    prompt:
      "An HDLC station has no user data to send but must report Receiver Ready. Which frame type fits?",
    answers: ["U-frame", "I-frame", "S-frame"],
    correct: [2],
    explanation:
      "Supervisory frames carry flow/error control without normal user payload.",
    optionExplanations: [
      "U-frames are for system/link management rather than routine Receiver Ready supervision.",
      "I-frames carry user information and may piggyback control, but the scenario has no user data.",
      "Supervisory frames carry flow/error control without normal user payload.",
    ],
    sourceRefs: [
      {
        file: "Lecture 10_ Part 2_ Attempt review _ ICT My Courses.pdf",
        page: 4,
      },
      {
        file: "ITCS217-Lecture-10-Flow-control-and-Error-Control-2026.pdf",
        page: 68,
      },
    ],
    status: "draft",
    version: 1,
    tags: ["original:L10-2-Q10", "variation:A", "provisional-objective"],
    lecture: "Lecture 10",
  },
  {
    id: "L10-2-Q10-B",
    subject: "ITCS217_Computer Data Communication",
    topic: "Lecture 10 · HDLC supervisory frames",
    objectiveId: "PROV-L10-2-O10",
    type: "single",
    difficulty: "Medium",
    cognitiveLevel: "Apply",
    prompt:
      "An HDLC station must send flow-control information when piggybacking is unavailable. Which type fits?",
    answers: ["U-frame", "S-frame", "I-frame"],
    correct: [1],
    explanation:
      "Supervisory frames carry flow/error control without normal user payload.",
    optionExplanations: [
      "U-frames are for system/link management rather than routine Receiver Ready supervision.",
      "Supervisory frames carry flow/error control without normal user payload.",
      "I-frames carry user information and may piggyback control, but the scenario has no user data.",
    ],
    sourceRefs: [
      {
        file: "Lecture 10_ Part 2_ Attempt review _ ICT My Courses.pdf",
        page: 4,
      },
      {
        file: "ITCS217-Lecture-10-Flow-control-and-Error-Control-2026.pdf",
        page: 68,
      },
    ],
    status: "draft",
    version: 1,
    tags: ["original:L10-2-Q10", "variation:B", "provisional-objective"],
    lecture: "Lecture 10",
  },
  {
    id: "L10-2-Q11-A",
    subject: "ITCS217_Computer Data Communication",
    topic: "Lecture 10 · Piggybacking",
    objectiveId: "PROV-L10-2-O11",
    type: "single",
    difficulty: "Medium",
    cognitiveLevel: "Apply",
    prompt:
      "Station B has outgoing user data and an acknowledgement for A. How can piggybacking reduce separate control transmissions?",
    answers: [
      "Carry the acknowledgement in B outgoing data frame",
      "Send the acknowledgement as an IP route update",
      "Remove all sequence information",
    ],
    correct: [0],
    explanation:
      "Piggybacking combines outgoing user data and acknowledgement information.",
    optionExplanations: [
      "Piggybacking combines outgoing user data and acknowledgement information.",
      "Routing updates do not replace link-layer acknowledgements.",
      "Reliable control still needs the relevant sequence and acknowledgement fields.",
    ],
    sourceRefs: [
      {
        file: "Lecture 10_ Part 2_ Attempt review _ ICT My Courses.pdf",
        page: 5,
      },
      {
        file: "ITCS217-Lecture-10-Flow-control-and-Error-Control-2026.pdf",
        page: 32,
      },
    ],
    status: "draft",
    version: 1,
    tags: ["original:L10-2-Q11", "variation:A", "provisional-objective"],
    lecture: "Lecture 10",
  },
  {
    id: "L10-2-Q11-B",
    subject: "ITCS217_Computer Data Communication",
    topic: "Lecture 10 · Piggybacking",
    objectiveId: "PROV-L10-2-O11",
    type: "single",
    difficulty: "Medium",
    cognitiveLevel: "Apply",
    prompt: "Which situation permits an HDLC I-frame to perform piggybacking?",
    answers: [
      "The station must remove the FCS to fit the ACK",
      "There is no outgoing user data and an I-frame must contain only a flag",
      "The station has user data and acknowledgement information to send in the opposite direction",
    ],
    correct: [2],
    explanation: "Both can be carried together in an Information frame.",
    optionExplanations: [
      "Piggybacking does not require removing the frame error check.",
      "Without data, a supervisory acknowledgement is the suitable mechanism rather than the described piggybacking.",
      "Both can be carried together in an Information frame.",
    ],
    sourceRefs: [
      {
        file: "Lecture 10_ Part 2_ Attempt review _ ICT My Courses.pdf",
        page: 5,
      },
      {
        file: "ITCS217-Lecture-10-Flow-control-and-Error-Control-2026.pdf",
        page: 32,
      },
    ],
    status: "draft",
    version: 1,
    tags: ["original:L10-2-Q11", "variation:B", "provisional-objective"],
    lecture: "Lecture 10",
  },
  {
    id: "L10-2-Q12-A",
    subject: "ITCS217_Computer Data Communication",
    topic: "Lecture 10 · Bandwidth-delay product",
    objectiveId: "PROV-L10-2-O12",
    type: "single",
    difficulty: "Medium",
    cognitiveLevel: "Apply",
    prompt:
      "A link has rate 2 Mbps and round-trip delay 30 ms. Using BDP = rate × RTT, how many bits correspond to one round trip?",
    answers: ["30,000 bits", "60,000 bits", "7,500 bits"],
    correct: [1],
    explanation: "2 × 10^6 × 30/1000 = 60,000 bits.",
    optionExplanations: [
      "This halves the stated round-trip delay, although the formula already calls for RTT.",
      "2 × 10^6 × 30/1000 = 60,000 bits.",
      "Dividing by eight converts bits to bytes; the answer is requested in bits.",
    ],
    sourceRefs: [
      {
        file: "Lecture 10_ Part 2_ Attempt review _ ICT My Courses.pdf",
        page: 5,
      },
      {
        file: "ITCS217-Lecture-10-Flow-control-and-Error-Control-2026.pdf",
        page: 80,
      },
    ],
    status: "draft",
    version: 1,
    tags: ["original:L10-2-Q12", "variation:A", "provisional-objective"],
    lecture: "Lecture 10",
  },
  {
    id: "L10-2-Q12-B",
    subject: "ITCS217_Computer Data Communication",
    topic: "Lecture 10 · Bandwidth-delay product",
    objectiveId: "PROV-L10-2-O12",
    type: "single",
    difficulty: "Medium",
    cognitiveLevel: "Apply",
    prompt:
      "A link has rate 5 Mbps and round-trip delay 8 ms. Using BDP = rate × RTT, how many bits correspond to one round trip?",
    answers: ["5,000 bits", "20,000 bits", "40,000 bits"],
    correct: [2],
    explanation: "5 × 10^6 × 8/1000 = 40,000 bits.",
    optionExplanations: [
      "Dividing by eight converts bits to bytes; the answer is requested in bits.",
      "This halves the stated round-trip delay, although the formula already calls for RTT.",
      "5 × 10^6 × 8/1000 = 40,000 bits.",
    ],
    sourceRefs: [
      {
        file: "Lecture 10_ Part 2_ Attempt review _ ICT My Courses.pdf",
        page: 5,
      },
      {
        file: "ITCS217-Lecture-10-Flow-control-and-Error-Control-2026.pdf",
        page: 80,
      },
    ],
    status: "draft",
    version: 1,
    tags: ["original:L10-2-Q12", "variation:B", "provisional-objective"],
    lecture: "Lecture 10",
  },
  {
    id: "L10-2-Q13-A",
    subject: "ITCS217_Computer Data Communication",
    topic: "Lecture 10 · Approximate Stop-and-Wait utilization",
    objectiveId: "PROV-L10-2-O13",
    type: "single",
    difficulty: "Medium",
    cognitiveLevel: "Apply",
    prompt:
      "Use the lecture approximation U = min(1, W × L / BDP), not the exact transmission-cycle formula. BDP = 40,000 bits, frame length L = 2,000 bits and Stop-and-Wait W = 1. What is approximate utilization?",
    answers: ["10%", "5%", "100%"],
    correct: [1],
    explanation:
      "100 × 2000/40000 = 5% under the specified lecture approximation.",
    optionExplanations: [
      "This doubles the single-frame budget despite W = 1.",
      "100 × 2000/40000 = 5% under the specified lecture approximation.",
      "Only one frame is outstanding, substantially below the stated bandwidth-delay product.",
    ],
    sourceRefs: [
      {
        file: "Lecture 10_ Part 2_ Attempt review _ ICT My Courses.pdf",
        page: 5,
      },
      {
        file: "ITCS217-Lecture-10-Flow-control-and-Error-Control-2026.pdf",
        page: 81,
      },
    ],
    status: "draft",
    version: 1,
    tags: ["original:L10-2-Q13", "variation:A", "provisional-objective"],
    lecture: "Lecture 10",
  },
  {
    id: "L10-2-Q13-B",
    subject: "ITCS217_Computer Data Communication",
    topic: "Lecture 10 · Approximate Stop-and-Wait utilization",
    objectiveId: "PROV-L10-2-O13",
    type: "single",
    difficulty: "Medium",
    cognitiveLevel: "Apply",
    prompt:
      "Use the lecture approximation U = min(1, W × L / BDP), not the exact transmission-cycle formula. BDP = 60,000 bits, frame length L = 1,500 bits and Stop-and-Wait W = 1. What is approximate utilization?",
    answers: ["100%", "2.5%", "5%"],
    correct: [1],
    explanation:
      "100 × 1500/60000 = 2.5% under the specified lecture approximation.",
    optionExplanations: [
      "Only one frame is outstanding, substantially below the stated bandwidth-delay product.",
      "100 × 1500/60000 = 2.5% under the specified lecture approximation.",
      "This doubles the single-frame budget despite W = 1.",
    ],
    sourceRefs: [
      {
        file: "Lecture 10_ Part 2_ Attempt review _ ICT My Courses.pdf",
        page: 5,
      },
      {
        file: "ITCS217-Lecture-10-Flow-control-and-Error-Control-2026.pdf",
        page: 81,
      },
    ],
    status: "draft",
    version: 1,
    tags: ["original:L10-2-Q13", "variation:B", "provisional-objective"],
    lecture: "Lecture 10",
  },
  {
    id: "L10-2-Q14-A",
    subject: "ITCS217_Computer Data Communication",
    topic: "Lecture 10 · Sequence wraparound",
    objectiveId: "PROV-L10-2-O14",
    type: "single",
    difficulty: "Medium",
    cognitiveLevel: "Apply",
    prompt:
      "GBN and SR each use 3-bit sequence numbers. Starting at 0, what are the sequence numbers of the first 11 newly transmitted frames? Assume loss-free transmission and ACKs that allow continued sending.",
    answers: [
      "0, 1, 2, 3, 0, 1, 2, 3, 0, 1, 2",
      "0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10",
      "0, 1, 2, 3, 4, 5, 6, 7, 0, 1, 2",
    ],
    correct: [2],
    explanation:
      "Sequence labels increment modulo 2^3 = 8; window size does not change this modulus.",
    optionExplanations: [
      "This wraps at half the sequence space, confusing SR window size with sequence modulus.",
      "This uses labels outside the finite sequence-number range.",
      "Sequence labels increment modulo 2^3 = 8; window size does not change this modulus.",
    ],
    sourceRefs: [
      {
        file: "Lecture 10_ Part 2_ Attempt review _ ICT My Courses.pdf",
        page: 5,
      },
      {
        file: "ITCS217-Lecture-10-Flow-control-and-Error-Control-2026.pdf",
        page: 83,
      },
    ],
    status: "draft",
    version: 1,
    tags: ["original:L10-2-Q14", "variation:A", "provisional-objective"],
    lecture: "Lecture 10",
  },
  {
    id: "L10-2-Q14-B",
    subject: "ITCS217_Computer Data Communication",
    topic: "Lecture 10 · Sequence wraparound",
    objectiveId: "PROV-L10-2-O14",
    type: "single",
    difficulty: "Medium",
    cognitiveLevel: "Apply",
    prompt:
      "GBN and SR each use 4-bit sequence numbers. Starting at 0, what are the sequence numbers of the first 19 newly transmitted frames? Assume loss-free transmission and ACKs that allow continued sending.",
    answers: [
      "0, 1, 2, 3, 4, 5, 6, 7, 0, 1, 2, 3, 4, 5, 6, 7, 0, 1, 2",
      "0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 0, 1, 2",
      "0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18",
    ],
    correct: [1],
    explanation:
      "Sequence labels increment modulo 2^4 = 16; window size does not change this modulus.",
    optionExplanations: [
      "This wraps at half the sequence space, confusing SR window size with sequence modulus.",
      "Sequence labels increment modulo 2^4 = 16; window size does not change this modulus.",
      "This uses labels outside the finite sequence-number range.",
    ],
    sourceRefs: [
      {
        file: "Lecture 10_ Part 2_ Attempt review _ ICT My Courses.pdf",
        page: 5,
      },
      {
        file: "ITCS217-Lecture-10-Flow-control-and-Error-Control-2026.pdf",
        page: 83,
      },
    ],
    status: "draft",
    version: 1,
    tags: ["original:L10-2-Q14", "variation:B", "provisional-objective"],
    lecture: "Lecture 10",
  },
  {
    id: "L10-2-Q15-A",
    subject: "ITCS217_Computer Data Communication",
    topic: "Lecture 10 · GBN and SR utilization",
    objectiveId: "PROV-L10-2-O15",
    type: "single",
    difficulty: "Hard",
    cognitiveLevel: "Apply",
    prompt:
      "Use the lecture approximation U = min(1, W × L / BDP). A loss-free link has BDP = 40,000 bits and L = 2,000 bits/frame. Both GBN and equal-window SR use 4-bit sequence fields and their maximum permitted windows. What are approximate GBN and SR utilizations, respectively?",
    answers: ["100% and 100%", "75% and 40%", "40% and 75%"],
    correct: [1],
    explanation:
      "GBN W = 15 and SR W = 8; multiply each by 2000/40000 and convert to percent.",
    optionExplanations: [
      "Neither permitted window fills the entire stated bandwidth-delay product.",
      "GBN W = 15 and SR W = 8; multiply each by 2000/40000 and convert to percent.",
      "This reverses the GBN and SR maximum sender-window limits.",
    ],
    sourceRefs: [
      {
        file: "Lecture 10_ Part 2_ Attempt review _ ICT My Courses.pdf",
        page: 6,
      },
      {
        file: "ITCS217-Lecture-10-Flow-control-and-Error-Control-2026.pdf",
        page: 82,
      },
    ],
    status: "draft",
    version: 1,
    tags: ["original:L10-2-Q15", "variation:A", "provisional-objective"],
    lecture: "Lecture 10",
  },
  {
    id: "L10-2-Q15-B",
    subject: "ITCS217_Computer Data Communication",
    topic: "Lecture 10 · GBN and SR utilization",
    objectiveId: "PROV-L10-2-O15",
    type: "single",
    difficulty: "Hard",
    cognitiveLevel: "Apply",
    prompt:
      "Use the lecture approximation U = min(1, W × L / BDP). A loss-free link has BDP = 80,000 bits and L = 1,000 bits/frame. Both GBN and equal-window SR use 5-bit sequence fields and their maximum permitted windows. What are approximate GBN and SR utilizations, respectively?",
    answers: ["100% and 100%", "20% and 38.75%", "38.75% and 20%"],
    correct: [2],
    explanation:
      "GBN W = 31 and SR W = 16; multiply each by 1000/80000 and convert to percent.",
    optionExplanations: [
      "Neither permitted window fills the entire stated bandwidth-delay product.",
      "This reverses the GBN and SR maximum sender-window limits.",
      "GBN W = 31 and SR W = 16; multiply each by 1000/80000 and convert to percent.",
    ],
    sourceRefs: [
      {
        file: "Lecture 10_ Part 2_ Attempt review _ ICT My Courses.pdf",
        page: 6,
      },
      {
        file: "ITCS217-Lecture-10-Flow-control-and-Error-Control-2026.pdf",
        page: 82,
      },
    ],
    status: "draft",
    version: 1,
    tags: ["original:L10-2-Q15", "variation:B", "provisional-objective"],
    lecture: "Lecture 10",
  },
] satisfies readonly BankQuestion[];
