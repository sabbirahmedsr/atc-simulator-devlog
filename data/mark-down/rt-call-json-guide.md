# ATC RT Call `JSON File` Structure Guide

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


***

### Parameters and Their Descriptions

Here is a list of all the variables, or "parameters," included in the `command-parameter` JSON file, along with a simple description and an example for each.

* **`QNH`**: This is the air pressure setting used to calibrate an aircraft's altimeter, which shows its height above sea level. It helps pilots fly at the correct altitude.
    * **Example**: `QNH 1013`
* **`Altitude`**: This is a command for the height an aircraft should fly at or descend to, helping it reach the correct level.
    * **Example**: `Descending 3000 feet`
* **`Departure Taxiway`**: This is the specific route an aircraft must follow on the ground to get to the runway for takeoff.
    * **Example**: `taxi via C-N-N2`
* **`Arrival Taxiway`**: This is the route an aircraft follows on the ground after landing to get to its gate or parking area.
    * **Example**: `taxi via S1`
* **`Runway Vacate Taxiway`**: This is a command instructing a pilot on which taxiway to use to exit the runway after landing.
    * **Example**: `runway vacated via S1`
* **`Parking Taxiway`**: This is the final ground route an aircraft follows to its designated parking spot or gate.
    * **Example**: `taxi via S1-S-C`
* **`Pushback Face`**: This is a ground command that tells a pilot which direction to face the aircraft after pushing back from the gate.
    * **Example**: `push to face north`
* **`TIME`**: This is the time, typically provided in UTC (Coordinated Universal Time) format.
    * **Example**: `TIME 1335`
* **`Arrival Approach Feedback`**: This is a report from a pilot confirming their current location and status during the final approach to the airport.
    * **Example**: `call you established 12 dme arc`