# VGJR
---
## Simplified Calls

#### 1. Details call with Intention
Jei call gulor sathe mission ba Intention declare kora hoiche sei call gulo simplified kore `generic` call add kora hoiche. jemon, taxi korar somoy,
```
AC  :	JSR GRD, Csp-737, request taxi
GRD :	CSP-737, JSR GRD, Taxi via B-P-M to holding point rwy-34, QNG-1014, Squak-4154
AC  :	JSR GRD, CSP-737, QNG-1014, Squak-4184-clear taxi via B-P-M to holding point rwy-16. 
Be Advise, on recovery like to carry out VOR-Y approach, EAT-30 (for PT-6 RCLD approach).
GRD :	CSP-737, JSR GRD, on recovery VOR-Y approach, EAT-30 copied, stack will be subject to traffic. Area-NL1 (for PT-6 RCLD) Copied
```
eta notun kore ba alada vabe add na kore simply ager taxi call er sathe merge kora hoiche. 

#### 2. Circuit followed by traffic
ciruite e jokhon multiple traffic thake se khetre traffic soho instruction dewa hoy. egula simplify kore normal curcuite movement call gula add kora hoiche. jemon, navigation rejoin er por,
```
Pilot: JSR TWR, CSP-731, over Z2 at 1500ft for initial pitch out land.
TWR:   CSP-731 maintain 1500ft report field insight, be advised CCT active by one Grob and one PT-6.
Pilot: Traffic copied call you field in sight, 731.
```

---
## QUERY
----
### Existing Parameter Related Query
1. **Taxiway** gula ki ki hobe, (ex, c-p-m)
2. **QNH** gula ki ki hobe, (ex QNH 746)
3. **Time** gula ki ki hobe 
    * startup er somoy time
    * setting course korar somoy estimate time

---
### New Parameter Add hobe ki na ?

##### Change to Training Phase
```
Pilot: {JSR TWR}, {call-sign}, we are abeam Z2, like to change to training.
TWR: Change approved.
Pilot: Over to training, {call-sign}.
```
* ekhane {we are abeam Z2} er jaygay onnanno training point lagbe ki na ???
* jodi lage tahole segula ki ki hobe ?

##### Setting Course Phase
```
Pilot: {JSR TWR}, {call-sign}, now setting course, estimating Alfadanga at time four zero.
TWR: {call-sign}, roger, estimate Alfadanga at time four zero. Report 5 miles out.
Pilot: Call you 5 miles out, {call-sign}.
```
* ekhane {estaming Alfadanga} variable hobe ki na ?
* jodi hoy tahole target location r ki ki hobe ?
* estimating time variable hobe ki na ?
