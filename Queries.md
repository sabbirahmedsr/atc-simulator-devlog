## VGJR QUERY
----

### Existing Parameter Related Query

#### 1. Taxiway 

##### 1.1 `Departure taxi` dewar somoy ki ki taxiway thakbe ?
```
Pilot: {JSR GRD}, {call-sign}, request taxi.
GRD: {call-sign}, {JSR GRD}, {taxi via O-P-M} to holding point Rwy-16, {QNH 746}.
Pilot: {QNH 746}, squawk 4154, {Taxi via O-P-M} to holding point Rwy-16, {call-sign}.
```

##### 1.2 Landing korar por `runway vacate` er somoy ki ki taxiway thakbe ? 
```
TWR: {call-sign}, {JSR TWR}, {taxi via C} after vacating contact ground 121.8.
Pilot: {Taxi via C}, after vacating contact ground 121.8, {call-sign}.
```

##### 1.3 Runway vacate er por tarmac e jawar jonno ki ki `parking taxiway` thakbe ? 
```
Pilot: {JSR GRD}, {call-sign}, back to your frequency.
GRD: {call-sign}, {JSR GRD}, {taxi via C-P-A} to tarmac.
Pilot: {taxi via C-P-A} to tarmac, {call-sign}.
```

---

#### 2. QNH
##### 2.1 `departure taxi` dewar somoy QNH gula ki ki hobe ?
```
Pilot: {JSR GRD}, {call-sign}, request taxi.
GRD: {call-sign}, {JSR GRD}, {taxi via O-P-M} to holding point Rwy-16, {QNH 746}.
Pilot: {QNH 746}, squawk 4154, {Taxi via O-P-M} to holding point Rwy-16, {call-sign}.
```
##### 2.2 QNH gula ki prottek call sign er sathe fix kore dewa jay ki na ?

---

#### 3. Time 
##### 3.1 `startup` er somoy ki ki time dewa jabe ?
```
Pilot: {JSR GRD}, {call-sign}, request startup.
GRD: {call-sign}, startup approved, temp 32, {time 23}.
Pilot: Startup approved, temp 32, {time 23}, {call-sign}.
```
