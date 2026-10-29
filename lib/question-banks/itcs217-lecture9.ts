import type { BankQuestion } from "../quiz-bank.ts";

export const lecture9Questions = [
  {
    "id": "dll-l09-single-01",
    "subject": "ITCS217_Computer Data Communication",
    "topic": "Lecture 9 · Data Link Layer functions",
    "objectiveId": "dll-l09-functions",
    "type": "single",
    "difficulty": "Easy",
    "cognitiveLevel": "Remember",
    "prompt": "Which function selects a path across multiple networks?",
    "answers": [
      "Framing",
      "Routing",
      "Flow control",
      "Media access control"
    ],
    "correct": [
      1
    ],
    "explanation": "Routing selects paths across networks and is not a main Data Link Layer function.",
    "optionExplanations": [
      "Framing organizes data into frames.",
      "Routing selects paths across multiple networks.",
      "Flow control regulates the sender relative to receiver capacity.",
      "Media access control coordinates access to a shared medium."
    ],
    "sourceRefs": [
      {
        "file": "Lecture 9_ Part 1_ Attempt review _ ICT My Courses.pdf",
        "page": 1
      }
    ],
    "status": "pending_review",
    "version": 1,
    "lecture": "Lecture 9"
  },
  {
    "id": "dll-l09-single-02",
    "subject": "ITCS217_Computer Data Communication",
    "topic": "Lecture 9 · Flow control",
    "objectiveId": "dll-l09-flow-control",
    "type": "single",
    "difficulty": "Medium",
    "cognitiveLevel": "Apply",
    "prompt": "A sender transmits frames faster than its neighboring receiver can handle. Which function directly addresses this problem?",
    "answers": [
      "Signal encoding",
      "Routing",
      "Flow control",
      "Framing"
    ],
    "correct": [
      2
    ],
    "explanation": "Flow control helps prevent a sender from overwhelming a receiver.",
    "optionExplanations": [
      "Signal encoding does not regulate receiver workload.",
      "Routing chooses paths across networks.",
      "Flow control regulates frame transmission relative to receiver capacity.",
      "Framing packages data rather than regulating its transmission rate."
    ],
    "sourceRefs": [
      {
        "file": "Lecture 9_ Part 1_ Attempt review _ ICT My Courses.pdf",
        "page": 1
      }
    ],
    "status": "pending_review",
    "version": 1,
    "lecture": "Lecture 9"
  },
  {
    "id": "dll-l09-single-03",
    "subject": "ITCS217_Computer Data Communication",
    "topic": "Lecture 9 · LLC and MAC",
    "objectiveId": "dll-l09-sublayers",
    "type": "single",
    "difficulty": "Medium",
    "cognitiveLevel": "Apply",
    "prompt": "Several stations share one transmission medium. Which sublayer coordinates their access?",
    "answers": [
      "MAC",
      "LLC",
      "Network layer",
      "Physical layer"
    ],
    "correct": [
      0
    ],
    "explanation": "MAC controls how stations access a shared medium.",
    "optionExplanations": [
      "MAC coordinates shared-medium access.",
      "LLC manages logical link functions such as flow and error control.",
      "The Network layer handles functions such as routing.",
      "The Physical layer does not provide the MAC coordination described here."
    ],
    "sourceRefs": [
      {
        "file": "Lecture 9_ Part 1_ Attempt review _ ICT My Courses.pdf",
        "page": 1
      }
    ],
    "status": "pending_review",
    "version": 1,
    "lecture": "Lecture 9"
  },
  {
    "id": "dll-l09-single-04",
    "subject": "ITCS217_Computer Data Communication",
    "topic": "Lecture 9 · Framing",
    "objectiveId": "dll-l09-framing",
    "type": "single",
    "difficulty": "Easy",
    "cognitiveLevel": "Understand",
    "prompt": "What happens to the original data during Data Link Layer encapsulation?",
    "answers": [
      "It is replaced entirely with control information.",
      "It becomes an HDLC Flag field.",
      "It is discarded after routing.",
      "It is enclosed within a frame."
    ],
    "correct": [
      3
    ],
    "explanation": "Framing encapsulates original data with additional control information.",
    "optionExplanations": [
      "Framing preserves rather than replaces the data.",
      "The Flag field marks frame boundaries.",
      "Framing does not discard the original data.",
      "The original data is encapsulated inside the frame."
    ],
    "sourceRefs": [
      {
        "file": "Lecture 9_ Part 1_ Attempt review _ ICT My Courses.pdf",
        "page": 2
      }
    ],
    "status": "pending_review",
    "version": 1,
    "lecture": "Lecture 9"
  },
  {
    "id": "dll-l09-single-05",
    "subject": "ITCS217_Computer Data Communication",
    "topic": "Lecture 9 · HDLC frame fields",
    "objectiveId": "dll-l09-fields",
    "type": "single",
    "difficulty": "Easy",
    "cognitiveLevel": "Remember",
    "prompt": "Which HDLC field indicates the beginning and end of a frame?",
    "answers": [
      "Address",
      "Flag",
      "FCS",
      "Control"
    ],
    "correct": [
      1
    ],
    "explanation": "HDLC uses Flag fields to mark frame boundaries.",
    "optionExplanations": [
      "Address identifies the secondary station.",
      "Flag marks the beginning and end.",
      "FCS supports error detection.",
      "Control identifies frame type and carries control information."
    ],
    "sourceRefs": [
      {
        "file": "Lecture 9_ Part 1_ Attempt review _ ICT My Courses.pdf",
        "page": 2
      }
    ],
    "status": "pending_review",
    "version": 1,
    "lecture": "Lecture 9"
  },
  {
    "id": "dll-l09-single-06",
    "subject": "ITCS217_Computer Data Communication",
    "topic": "Lecture 9 · HDLC frame fields",
    "objectiveId": "dll-l09-fields",
    "type": "single",
    "difficulty": "Easy",
    "cognitiveLevel": "Remember",
    "prompt": "Which HDLC field is used for error detection?",
    "answers": [
      "Control",
      "Address",
      "FCS",
      "Flag"
    ],
    "correct": [
      2
    ],
    "explanation": "The Frame Check Sequence (FCS) supports detection of transmission errors.",
    "optionExplanations": [
      "Control carries frame-type and other control information.",
      "Address identifies the secondary station.",
      "FCS is used for error detection.",
      "Flag marks frame boundaries."
    ],
    "sourceRefs": [
      {
        "file": "Lecture 9_ Part 1_ Attempt review _ ICT My Courses.pdf",
        "page": 2
      }
    ],
    "status": "pending_review",
    "version": 1,
    "lecture": "Lecture 9"
  },
  {
    "id": "dll-l09-single-07",
    "subject": "ITCS217_Computer Data Communication",
    "topic": "Lecture 9 · HDLC frame types",
    "objectiveId": "dll-l09-frame-types",
    "type": "single",
    "difficulty": "Medium",
    "cognitiveLevel": "Apply",
    "prompt": "An HDLC station needs to send user data with sequencing information. Which frame type is appropriate?",
    "answers": [
      "I-frame",
      "S-frame",
      "U-frame",
      "Flag"
    ],
    "correct": [
      0
    ],
    "explanation": "An Information frame carries user data and may include sequencing and acknowledgment information.",
    "optionExplanations": [
      "I-frames carry user data.",
      "S-frames mainly support flow and error control.",
      "U-frames support link management and control.",
      "Flag is a field rather than a frame type."
    ],
    "sourceRefs": [
      {
        "file": "Lecture 9_ Part 1_ Attempt review _ ICT My Courses.pdf",
        "page": 2
      }
    ],
    "status": "pending_review",
    "version": 1,
    "lecture": "Lecture 9"
  },
  {
    "id": "dll-l09-single-08",
    "subject": "ITCS217_Computer Data Communication",
    "topic": "Lecture 9 · HDLC communication modes",
    "objectiveId": "dll-l09-modes",
    "type": "single",
    "difficulty": "Medium",
    "cognitiveLevel": "Apply",
    "prompt": "Two HDLC stations both operate as combined stations, and either may initiate transmission. Which mode matches this arrangement?",
    "answers": [
      "NRM",
      "ARM",
      "A mode requiring permanent primary and secondary roles",
      "ABM"
    ],
    "correct": [
      3
    ],
    "explanation": "ABM uses combined stations and permits either side to initiate transmission.",
    "optionExplanations": [
      "NRM involves primary-controlled permission for secondary transmission.",
      "ARM permits a secondary to initiate without a poll but retains primary/secondary roles.",
      "Permanent primary/secondary roles do not describe ABM.",
      "ABM matches both conditions."
    ],
    "sourceRefs": [
      {
        "file": "Lecture 9_ Part 1_ Attempt review _ ICT My Courses.pdf",
        "page": 2
      }
    ],
    "status": "pending_review",
    "version": 1,
    "lecture": "Lecture 9"
  },
  {
    "id": "dll-l09-single-09",
    "subject": "ITCS217_Computer Data Communication",
    "topic": "Lecture 9 · HDLC communication modes",
    "objectiveId": "dll-l09-modes",
    "type": "single",
    "difficulty": "Medium",
    "cognitiveLevel": "Analyze",
    "prompt": "An HDLC secondary station initiates transmission without waiting for a primary poll. Which mode explicitly permits this behavior?",
    "answers": [
      "NRM",
      "ARM",
      "ABM with permanently assigned secondary role",
      "NRM with mandatory polling"
    ],
    "correct": [
      1
    ],
    "explanation": "ARM permits a secondary station to initiate transmission without waiting for a poll.",
    "optionExplanations": [
      "NRM requires permission from the primary.",
      "ARM explicitly permits this secondary-station behavior.",
      "ABM uses combined stations rather than a permanent secondary.",
      "Mandatory polling does not match the described initiation."
    ],
    "sourceRefs": [
      {
        "file": "Lecture 9_ Part 1_ Attempt review _ ICT My Courses.pdf",
        "page": 2
      }
    ],
    "status": "pending_review",
    "version": 1,
    "lecture": "Lecture 9"
  },
  {
    "id": "dll-l09-single-10",
    "subject": "ITCS217_Computer Data Communication",
    "topic": "Lecture 9 · Data Link and WAN protocols",
    "objectiveId": "dll-l09-protocols",
    "type": "single",
    "difficulty": "Medium",
    "cognitiveLevel": "Remember",
    "prompt": "Which protocol uses variable-length frames with a Q.922-based address field containing a DLCI?",
    "answers": [
      "PPP",
      "LAPB",
      "Frame Relay",
      "Cisco HDLC"
    ],
    "correct": [
      2
    ],
    "explanation": "The source associates Frame Relay with Q.922-based addressing and a DLCI.",
    "optionExplanations": [
      "PPP is described as adding a Protocol field to HDLC-like framing.",
      "LAPB is described as the Data Link Layer protocol used for X.25.",
      "Frame Relay uses the stated address structure.",
      "Cisco HDLC is described as including a Type field."
    ],
    "sourceRefs": [
      {
        "file": "Lecture 9_ Part 1_ Attempt review _ ICT My Courses.pdf",
        "page": 3
      }
    ],
    "status": "pending_review",
    "version": 1,
    "lecture": "Lecture 9"
  },
  {
    "id": "dll-l09-multiple-01",
    "subject": "ITCS217_Computer Data Communication",
    "topic": "Lecture 9 · Data Link Layer functions",
    "objectiveId": "dll-l09-functions",
    "type": "multiple",
    "difficulty": "Easy",
    "cognitiveLevel": "Remember",
    "prompt": "Which are main Data Link Layer functions? Select all that apply.",
    "answers": [
      "Framing",
      "Routing",
      "Flow control",
      "Error control",
      "Signal encoding",
      "Media access control"
    ],
    "correct": [
      0,
      2,
      3,
      5
    ],
    "explanation": "The material identifies framing, flow control, error control, and media access control as main functions.",
    "optionExplanations": [
      "Framing is a main function.",
      "Routing across networks is not a main Data Link Layer function.",
      "Flow control is a main function.",
      "Error control is a main function.",
      "Signal encoding is not a main Data Link Layer function.",
      "Media access control is a main function."
    ],
    "sourceRefs": [
      {
        "file": "Lecture 9_ Part 1_ Attempt review _ ICT My Courses.pdf",
        "page": 1
      }
    ],
    "status": "pending_review",
    "version": 1,
    "lecture": "Lecture 9"
  },
  {
    "id": "dll-l09-multiple-02",
    "subject": "ITCS217_Computer Data Communication",
    "topic": "Lecture 9 · Data Link Layer functions",
    "objectiveId": "dll-l09-functions",
    "type": "multiple",
    "difficulty": "Medium",
    "cognitiveLevel": "Understand",
    "prompt": "Which statements correctly describe the Data Link Layer? Select all that apply.",
    "answers": [
      "It supports communication between neighboring nodes over a link.",
      "It selects the best path across multiple networks.",
      "It may use framing and control information.",
      "It is responsible only for signal encoding."
    ],
    "correct": [
      0,
      2
    ],
    "explanation": "The layer provides link-level communication and uses framing/control information; path selection is routing.",
    "optionExplanations": [
      "Neighboring-node communication is within its scope.",
      "This is routing across networks.",
      "Framing and control information support link communication.",
      "Its functions are broader and do not reduce to signal encoding."
    ],
    "sourceRefs": [
      {
        "file": "Lecture 9_ Part 1_ Attempt review _ ICT My Courses.pdf",
        "page": 1
      }
    ],
    "status": "pending_review",
    "version": 1,
    "lecture": "Lecture 9"
  },
  {
    "id": "dll-l09-multiple-03",
    "subject": "ITCS217_Computer Data Communication",
    "topic": "Lecture 9 · LLC and MAC",
    "objectiveId": "dll-l09-sublayers",
    "type": "multiple",
    "difficulty": "Medium",
    "cognitiveLevel": "Understand",
    "prompt": "Which statements about LLC and MAC are correct? Select all that apply.",
    "answers": [
      "LLC manages logical link functions such as flow and error control.",
      "MAC selects the best route between networks.",
      "LLC is used only in multipoint communication.",
      "MAC coordinates access to a shared medium."
    ],
    "correct": [
      0,
      3
    ],
    "explanation": "LLC handles logical link functions, while MAC coordinates shared-medium access.",
    "optionExplanations": [
      "This matches the LLC description.",
      "MAC does not select routes across networks.",
      "The source rejects restricting LLC to multipoint communication.",
      "This matches the MAC description."
    ],
    "sourceRefs": [
      {
        "file": "Lecture 9_ Part 1_ Attempt review _ ICT My Courses.pdf",
        "page": 1
      }
    ],
    "status": "pending_review",
    "version": 1,
    "lecture": "Lecture 9"
  },
  {
    "id": "dll-l09-multiple-04",
    "subject": "ITCS217_Computer Data Communication",
    "topic": "Lecture 9 · Framing",
    "objectiveId": "dll-l09-framing",
    "type": "multiple",
    "difficulty": "Medium",
    "cognitiveLevel": "Understand",
    "prompt": "Which statements about framing are correct? Select all that apply.",
    "answers": [
      "The original data is replaced entirely by control information.",
      "Control information may be placed in a header and trailer.",
      "Original data is encapsulated before being passed to the Physical Layer.",
      "Header control information helps devices interpret and manage a frame."
    ],
    "correct": [
      1,
      2,
      3
    ],
    "explanation": "Framing adds control information around the original data without replacing it.",
    "optionExplanations": [
      "Framing preserves the original data.",
      "A header and trailer may surround the data.",
      "Encapsulation precedes Physical Layer transmission.",
      "Headers can contain interpretation and management information."
    ],
    "sourceRefs": [
      {
        "file": "Lecture 9_ Part 1_ Attempt review _ ICT My Courses.pdf",
        "page": 2
      }
    ],
    "status": "pending_review",
    "version": 1,
    "lecture": "Lecture 9"
  },
  {
    "id": "dll-l09-multiple-05",
    "subject": "ITCS217_Computer Data Communication",
    "topic": "Lecture 9 · HDLC frame fields",
    "objectiveId": "dll-l09-fields",
    "type": "multiple",
    "difficulty": "Medium",
    "cognitiveLevel": "Remember",
    "prompt": "Which HDLC field-purpose pairs are correct? Select all that apply.",
    "answers": [
      "Flag — frame boundaries",
      "Address — error detection",
      "FCS — error detection",
      "Control — frame type and sequence information"
    ],
    "correct": [
      0,
      2,
      3
    ],
    "explanation": "Flag marks boundaries, FCS detects errors, and Control identifies frame type and carries control information.",
    "optionExplanations": [
      "The Flag field marks the beginning and end.",
      "Address identifies the secondary station; FCS detects errors.",
      "FCS is used for error detection.",
      "Control can contain frame type and sequence information."
    ],
    "sourceRefs": [
      {
        "file": "Lecture 9_ Part 1_ Attempt review _ ICT My Courses.pdf",
        "page": 2
      }
    ],
    "status": "pending_review",
    "version": 1,
    "lecture": "Lecture 9"
  },
  {
    "id": "dll-l09-multiple-06",
    "subject": "ITCS217_Computer Data Communication",
    "topic": "Lecture 9 · HDLC frame types",
    "objectiveId": "dll-l09-frame-types",
    "type": "multiple",
    "difficulty": "Medium",
    "cognitiveLevel": "Understand",
    "prompt": "Which statements about HDLC frame types are correct? Select all that apply.",
    "answers": [
      "An I-frame carries user data.",
      "An S-frame is primarily for carrying user data.",
      "A U-frame supports link management and control.",
      "An I-frame may include acknowledgment information."
    ],
    "correct": [
      0,
      2,
      3
    ],
    "explanation": "I-frames carry user data and may include acknowledgments; U-frames support link management.",
    "optionExplanations": [
      "This is the role of I-frames.",
      "S-frames mainly serve flow and error control.",
      "This is the stated role of U-frames.",
      "I-frames may include sequencing and acknowledgment information."
    ],
    "sourceRefs": [
      {
        "file": "Lecture 9_ Part 1_ Attempt review _ ICT My Courses.pdf",
        "page": 2
      }
    ],
    "status": "pending_review",
    "version": 1,
    "lecture": "Lecture 9"
  },
  {
    "id": "dll-l09-multiple-07",
    "subject": "ITCS217_Computer Data Communication",
    "topic": "Lecture 9 · HDLC communication modes",
    "objectiveId": "dll-l09-modes",
    "type": "multiple",
    "difficulty": "Medium",
    "cognitiveLevel": "Understand",
    "prompt": "Which statements describe Normal Response Mode (NRM)? Select all that apply.",
    "answers": [
      "The primary controls communication.",
      "A secondary must receive permission before transmitting.",
      "It can be used for point-to-point or multipoint communication.",
      "Both stations must operate as combined stations."
    ],
    "correct": [
      0,
      1,
      2
    ],
    "explanation": "NRM uses primary/secondary roles and primary-controlled permission, in point-to-point or multipoint arrangements.",
    "optionExplanations": [
      "The primary controls communication in NRM.",
      "Permission from the primary is required.",
      "The material allows both arrangements.",
      "Combined stations describe ABM."
    ],
    "sourceRefs": [
      {
        "file": "Lecture 9_ Part 1_ Attempt review _ ICT My Courses.pdf",
        "page": 2
      }
    ],
    "status": "pending_review",
    "version": 1,
    "lecture": "Lecture 9"
  },
  {
    "id": "dll-l09-multiple-08",
    "subject": "ITCS217_Computer Data Communication",
    "topic": "Lecture 9 · HDLC communication modes",
    "objectiveId": "dll-l09-modes",
    "type": "multiple",
    "difficulty": "Hard",
    "cognitiveLevel": "Analyze",
    "prompt": "Which comparisons of HDLC modes are correct? Select all that apply.",
    "answers": [
      "NRM requires primary permission for secondary transmission, whereas ARM permits initiation without a poll.",
      "ABM uses combined stations, whereas NRM uses primary/secondary roles.",
      "ARM and ABM both require a secondary to wait for a primary poll.",
      "NRM is restricted to multipoint communication."
    ],
    "correct": [
      0,
      1
    ],
    "explanation": "The modes differ in station roles and permission to initiate transmission.",
    "optionExplanations": [
      "This correctly contrasts NRM and ARM.",
      "This correctly contrasts station roles.",
      "ARM permits unpolled initiation; ABM uses combined stations.",
      "NRM may also be used point-to-point."
    ],
    "sourceRefs": [
      {
        "file": "Lecture 9_ Part 1_ Attempt review _ ICT My Courses.pdf",
        "page": 2
      }
    ],
    "status": "pending_review",
    "version": 1,
    "lecture": "Lecture 9"
  },
  {
    "id": "dll-l09-multiple-09",
    "subject": "ITCS217_Computer Data Communication",
    "topic": "Lecture 9 · Data Link and WAN protocols",
    "objectiveId": "dll-l09-protocols",
    "type": "multiple",
    "difficulty": "Medium",
    "cognitiveLevel": "Remember",
    "prompt": "Which protocol-field descriptions match the material? Select all that apply.",
    "answers": [
      "PPP adds a Protocol field to HDLC-like framing.",
      "Cisco HDLC includes a Type field.",
      "Frame Relay addressing includes a DLCI.",
      "ATM uses the same HDLC-style variable-length frame format."
    ],
    "correct": [
      0,
      1,
      2
    ],
    "explanation": "PPP, Cisco HDLC, and Frame Relay have the stated identifiers; the material rejects the ATM claim.",
    "optionExplanations": [
      "The Protocol field identifies the encapsulated upper-layer protocol.",
      "Cisco HDLC includes the stated Type field.",
      "Frame Relay uses a DLCI in its address field.",
      "ATM does not follow the stated HDLC-style variable-length format."
    ],
    "sourceRefs": [
      {
        "file": "Lecture 9_ Part 1_ Attempt review _ ICT My Courses.pdf",
        "page": 3
      }
    ],
    "status": "pending_review",
    "version": 1,
    "lecture": "Lecture 9"
  },
  {
    "id": "dll-l09-multiple-10",
    "subject": "ITCS217_Computer Data Communication",
    "topic": "Lecture 9 · HDLC frame types",
    "objectiveId": "dll-l09-frame-types",
    "type": "multiple",
    "difficulty": "Hard",
    "cognitiveLevel": "Evaluate",
    "prompt": "A proposed reference sheet contains the following entries. Which entries need correction? Select all that apply.",
    "answers": [
      "I-frame: carries user data and may carry sequencing information.",
      "S-frame: primarily carries user data.",
      "U-frame: supports link management.",
      "Control field: used only to mark frame boundaries."
    ],
    "correct": [
      1,
      3
    ],
    "explanation": "The S-frame entry confuses supervisory control with user-data transfer, and the Control entry confuses Control with Flag.",
    "optionExplanations": [
      "This entry is correct and does not need correction.",
      "S-frames mainly support flow and error control.",
      "This entry is correct and does not need correction.",
      "Flag marks boundaries; Control identifies frame type and carries control information."
    ],
    "sourceRefs": [
      {
        "file": "Lecture 9_ Part 1_ Attempt review _ ICT My Courses.pdf",
        "page": 2
      }
    ],
    "status": "pending_review",
    "version": 1,
    "lecture": "Lecture 9"
  },
  {
    "id": "dll-l09-boolean-01",
    "subject": "ITCS217_Computer Data Communication",
    "topic": "Lecture 9 · Data Link Layer functions",
    "objectiveId": "dll-l09-functions",
    "type": "boolean",
    "difficulty": "Easy",
    "cognitiveLevel": "Understand",
    "prompt": "The Data Link Layer provides communication over a link between neighboring nodes.",
    "answers": [
      "True",
      "False"
    ],
    "correct": [
      0
    ],
    "explanation": "The material describes Data Link Layer communication as occurring between neighboring nodes over a link.",
    "optionExplanations": [
      "Correct. The material describes Data Link Layer communication as occurring between neighboring nodes over a link.",
      "Incorrect. The material describes Data Link Layer communication as occurring between neighboring nodes over a link."
    ],
    "sourceRefs": [
      {
        "file": "Lecture 9_ Part 1_ Attempt review _ ICT My Courses.pdf",
        "page": 1
      }
    ],
    "status": "pending_review",
    "version": 1,
    "lecture": "Lecture 9"
  },
  {
    "id": "dll-l09-boolean-02",
    "subject": "ITCS217_Computer Data Communication",
    "topic": "Lecture 9 · Data Link Layer functions",
    "objectiveId": "dll-l09-functions",
    "type": "boolean",
    "difficulty": "Easy",
    "cognitiveLevel": "Understand",
    "prompt": "Selecting the best path across multiple networks is a main Data Link Layer responsibility.",
    "answers": [
      "True",
      "False"
    ],
    "correct": [
      1
    ],
    "explanation": "Path selection across networks is routing, which the material excludes from the main Data Link Layer functions.",
    "optionExplanations": [
      "Incorrect. Path selection across networks is routing, which the material excludes from the main Data Link Layer functions.",
      "Correct. Path selection across networks is routing, which the material excludes from the main Data Link Layer functions."
    ],
    "sourceRefs": [
      {
        "file": "Lecture 9_ Part 1_ Attempt review _ ICT My Courses.pdf",
        "page": 1
      }
    ],
    "status": "pending_review",
    "version": 1,
    "lecture": "Lecture 9"
  },
  {
    "id": "dll-l09-boolean-03",
    "subject": "ITCS217_Computer Data Communication",
    "topic": "Lecture 9 · LLC and MAC",
    "objectiveId": "dll-l09-sublayers",
    "type": "boolean",
    "difficulty": "Medium",
    "cognitiveLevel": "Understand",
    "prompt": "A point-to-point link always requires MAC contention simply because two devices share the link.",
    "answers": [
      "True",
      "False"
    ],
    "correct": [
      1
    ],
    "explanation": "The material rejects the claim that every point-to-point link necessarily requires MAC contention.",
    "optionExplanations": [
      "Incorrect. The material rejects the claim that every point-to-point link necessarily requires MAC contention.",
      "Correct. The material rejects the claim that every point-to-point link necessarily requires MAC contention."
    ],
    "sourceRefs": [
      {
        "file": "Lecture 9_ Part 1_ Attempt review _ ICT My Courses.pdf",
        "page": 1
      }
    ],
    "status": "pending_review",
    "version": 1,
    "lecture": "Lecture 9"
  },
  {
    "id": "dll-l09-boolean-04",
    "subject": "ITCS217_Computer Data Communication",
    "topic": "Lecture 9 · Framing",
    "objectiveId": "dll-l09-framing",
    "type": "boolean",
    "difficulty": "Easy",
    "cognitiveLevel": "Understand",
    "prompt": "Framing preserves the original data while adding control information.",
    "answers": [
      "True",
      "False"
    ],
    "correct": [
      0
    ],
    "explanation": "Framing encapsulates original data and adds control information, potentially in a header and trailer.",
    "optionExplanations": [
      "Correct. Framing encapsulates original data and adds control information, potentially in a header and trailer.",
      "Incorrect. Framing encapsulates original data and adds control information, potentially in a header and trailer."
    ],
    "sourceRefs": [
      {
        "file": "Lecture 9_ Part 1_ Attempt review _ ICT My Courses.pdf",
        "page": 2
      }
    ],
    "status": "pending_review",
    "version": 1,
    "lecture": "Lecture 9"
  },
  {
    "id": "dll-l09-boolean-05",
    "subject": "ITCS217_Computer Data Communication",
    "topic": "Lecture 9 · HDLC frame fields",
    "objectiveId": "dll-l09-fields",
    "type": "boolean",
    "difficulty": "Easy",
    "cognitiveLevel": "Remember",
    "prompt": "The HDLC Address field is used to identify the secondary station.",
    "answers": [
      "True",
      "False"
    ],
    "correct": [
      0
    ],
    "explanation": "The material maps the Address field to identification of the secondary station.",
    "optionExplanations": [
      "Correct. The material maps the Address field to identification of the secondary station.",
      "Incorrect. The material maps the Address field to identification of the secondary station."
    ],
    "sourceRefs": [
      {
        "file": "Lecture 9_ Part 1_ Attempt review _ ICT My Courses.pdf",
        "page": 2
      }
    ],
    "status": "pending_review",
    "version": 1,
    "lecture": "Lecture 9"
  },
  {
    "id": "dll-l09-boolean-06",
    "subject": "ITCS217_Computer Data Communication",
    "topic": "Lecture 9 · HDLC frame fields",
    "objectiveId": "dll-l09-fields",
    "type": "boolean",
    "difficulty": "Easy",
    "cognitiveLevel": "Remember",
    "prompt": "The HDLC FCS field indicates the beginning and end of a frame.",
    "answers": [
      "True",
      "False"
    ],
    "correct": [
      1
    ],
    "explanation": "Flag fields mark frame boundaries; FCS is used for error detection.",
    "optionExplanations": [
      "Incorrect. Flag fields mark frame boundaries; FCS is used for error detection.",
      "Correct. Flag fields mark frame boundaries; FCS is used for error detection."
    ],
    "sourceRefs": [
      {
        "file": "Lecture 9_ Part 1_ Attempt review _ ICT My Courses.pdf",
        "page": 2
      }
    ],
    "status": "pending_review",
    "version": 1,
    "lecture": "Lecture 9"
  },
  {
    "id": "dll-l09-boolean-07",
    "subject": "ITCS217_Computer Data Communication",
    "topic": "Lecture 9 · HDLC frame types",
    "objectiveId": "dll-l09-frame-types",
    "type": "boolean",
    "difficulty": "Medium",
    "cognitiveLevel": "Understand",
    "prompt": "An HDLC S-frame is primarily used to carry user data between stations.",
    "answers": [
      "True",
      "False"
    ],
    "correct": [
      1
    ],
    "explanation": "S-frames mainly serve flow and error control; I-frames carry user data.",
    "optionExplanations": [
      "Incorrect. S-frames mainly serve flow and error control; I-frames carry user data.",
      "Correct. S-frames mainly serve flow and error control; I-frames carry user data."
    ],
    "sourceRefs": [
      {
        "file": "Lecture 9_ Part 1_ Attempt review _ ICT My Courses.pdf",
        "page": 2
      }
    ],
    "status": "pending_review",
    "version": 1,
    "lecture": "Lecture 9"
  },
  {
    "id": "dll-l09-boolean-08",
    "subject": "ITCS217_Computer Data Communication",
    "topic": "Lecture 9 · HDLC communication modes",
    "objectiveId": "dll-l09-modes",
    "type": "boolean",
    "difficulty": "Medium",
    "cognitiveLevel": "Understand",
    "prompt": "In ABM, either combined station may initiate transmission.",
    "answers": [
      "True",
      "False"
    ],
    "correct": [
      0
    ],
    "explanation": "ABM uses combined stations and permits either side to initiate transmission.",
    "optionExplanations": [
      "Correct. ABM uses combined stations and permits either side to initiate transmission.",
      "Incorrect. ABM uses combined stations and permits either side to initiate transmission."
    ],
    "sourceRefs": [
      {
        "file": "Lecture 9_ Part 1_ Attempt review _ ICT My Courses.pdf",
        "page": 2
      }
    ],
    "status": "pending_review",
    "version": 1,
    "lecture": "Lecture 9"
  },
  {
    "id": "dll-l09-boolean-09",
    "subject": "ITCS217_Computer Data Communication",
    "topic": "Lecture 9 · Data Link and WAN protocols",
    "objectiveId": "dll-l09-protocols",
    "type": "boolean",
    "difficulty": "Easy",
    "cognitiveLevel": "Remember",
    "prompt": "LAPB is based on HDLC framing and was used as the Data Link Layer protocol for X.25.",
    "answers": [
      "True",
      "False"
    ],
    "correct": [
      0
    ],
    "explanation": "This relationship between LAPB, HDLC, and X.25 is stated in the material.",
    "optionExplanations": [
      "Correct. This relationship between LAPB, HDLC, and X.25 is stated in the material.",
      "Incorrect. This relationship between LAPB, HDLC, and X.25 is stated in the material."
    ],
    "sourceRefs": [
      {
        "file": "Lecture 9_ Part 1_ Attempt review _ ICT My Courses.pdf",
        "page": 3
      }
    ],
    "status": "pending_review",
    "version": 1,
    "lecture": "Lecture 9"
  },
  {
    "id": "dll-l09-boolean-10",
    "subject": "ITCS217_Computer Data Communication",
    "topic": "Lecture 9 · Data Link and WAN protocols",
    "objectiveId": "dll-l09-protocols",
    "type": "boolean",
    "difficulty": "Medium",
    "cognitiveLevel": "Understand",
    "prompt": "ATM follows the same HDLC-style variable-length frame format with Flag fields at both ends and an FCS trailer.",
    "answers": [
      "True",
      "False"
    ],
    "correct": [
      1
    ],
    "explanation": "The material explicitly rejects this description of ATM as using the same HDLC-style variable-length format.",
    "optionExplanations": [
      "Incorrect. The material explicitly rejects this description of ATM as using the same HDLC-style variable-length format.",
      "Correct. The material explicitly rejects this description of ATM as using the same HDLC-style variable-length format."
    ],
    "sourceRefs": [
      {
        "file": "Lecture 9_ Part 1_ Attempt review _ ICT My Courses.pdf",
        "page": 3
      }
    ],
    "status": "pending_review",
    "version": 1,
    "lecture": "Lecture 9"
  }
] satisfies readonly BankQuestion[];
