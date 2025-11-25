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
