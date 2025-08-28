# ATC Call `JSON File` Structure Guide

This document explains the structure and purpose of each field in our `rt-call-json-file` . The file is a database of aviation conversations, organized by the phase of flight.

### Top-Level Arrays

The main object contains four arrays, each representing a different category of flight communication:

* **`allArrivalCall`**: All conversations related to arriving at an airport, from the initial entry call to taxiing to the gate.
* **`allDepartureCall`**: All conversations for departing from an airport, from requesting engine startup to taking off.
* **`allCircuitCall`**: All conversations for flying a local traffic pattern, or "circuit," around the airport.
* **`allSpecialCall`**: An array reserved for conversations that don't fit into the other categories.

---

### Fields within a Single Call Object

Each object inside the arrays represents a single, complete ATC conversation:

* **`title`**: A simple name for the conversation (e.g., "Startup").
* **`category`**: A sub-category for the call (e.g., "Entry Call", "Departure Call").
* **`description`**: A plain-English summary of what the call is for.
* **`Route`**: Describes the physical flight path or location during which this conversation occurs.
* **`initialCall`**: The exact text the pilot says to begin the conversation.
* **`atcCall`**: The exact text the Air Traffic Controller says in response.
* **`feedbackCall`**: The exact text the pilot says to confirm the controller's instructions.
* **`atcType`**: Specifies whether the call is with the **`"Ground"`** or **`"Tower"`** controller.
* **`icao`**: The ICAO code of the airport where this call takes place (e.g., "VGHS"), used for filtering.

---

### Fields within the `Command` Objects

Both the **`initialCommand`** and **`feedbackCommand`** objects have the same internal structure. They provide instructions for how a command should be handled by a flight application.

* **`caption`**: A short, human-readable label for the command.
* **`playOnAwake`**: A boolean (`true` or `false`) that indicates if the command's audio should play automatically.
* **`requiredToInitiate`**: A boolean that shows if this call is required to initiate to complete or pass the movement phase in `simulator`.
* **`requiredToComplete`**: A boolean that shows if this call is required to be finished to complete or pass the movement phase in `simulator`.
* **`mainCommand`**: The primary text or phrase that can be used as `cmd` in command line or in `voice command`.
* **`altCommand`**: An array of alternative, valid phrases for the `mainCommand`.
* **`allParameter`**: An array for any variables (e.g. taxiway route, time, qnh) needed for the command.